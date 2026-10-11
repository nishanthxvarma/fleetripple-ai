import pytest
from app.models import ConsolidationProposal, OperatorAgreement, Booking, Trip, Vehicle
from app.optimization.consolidation_optimizer import consolidation_optimizer

def test_1_underbooked_compatible_trips_produce_opportunity(client):
    res = client.get("/api/consolidation/opportunities?threshold=50")
    assert res.status_code == 200
    opps = res.json()
    assert len(opps) >= 1
    target = next((o for o in opps if "TRIP-201" in o["id"] and "TRIP-202" in o["id"]), None)
    assert target is not None
    assert target["combined_passengers"] == 27
    assert target["candidate_capacity"] == 40

def test_2_incompatible_routes_rejected():
    t1 = {"origin": "Visakhapatnam", "destination": "Vijayawada", "operator_id": "OP-1"}
    t2 = {"origin": "Visakhapatnam", "destination": "Kakinada", "operator_id": "OP-4"}
    res = consolidation_optimizer.evaluate_pair(t1, t2)
    assert res["is_compatible"] is False
    assert "Corridor mismatch" in res["reason"]

def test_3_insufficient_replacement_capacity_rejected():
    t1 = {"origin": "Vizag", "destination": "Vijayawada", "operator_id": "OP-1", "confirmed_bookings": 25}
    t2 = {"origin": "Vizag", "destination": "Vijayawada", "operator_id": "OP-2", "confirmed_bookings": 20}
    # 25 + 20 = 45 > 40
    res = consolidation_optimizer.evaluate_pair(t1, t2)
    assert res["is_compatible"] is False
    assert "Capacity exceeded" in res["reason"]

def test_4_and_5_cost_calculations_and_savings_not_conflated():
    t1 = {"origin": "Vizag", "destination": "BZA", "operator_id": "OP-1", "confirmed_bookings": 12, "est_operating_cost": 18000.0}
    t2 = {"origin": "Vizag", "destination": "BZA", "operator_id": "OP-2", "confirmed_bookings": 15, "est_operating_cost": 18500.0}
    res = consolidation_optimizer.evaluate_pair(t1, t2, transfer_payment=6000.0)
    assert res["is_compatible"] is True
    fin = res["financials"]
    # Gross savings = 18000 + 18500 - 20200 = 16300
    assert fin["grossOperatingSavings"] == 16300.0
    # Contributing operator net savings = 18000 - 6000 - 400 = 11600
    assert fin["apexNetSavings"] == 11600.0
    # Carrying operator net benefit = 6000 - 1700 - 400 = 3900
    assert fin["coastalNetBenefit"] == 3900.0
    # Gross savings (16300) != Net benefits (11600 / 3900)
    assert fin["grossOperatingSavings"] != fin["apexNetSavings"]
    assert fin["grossOperatingSavings"] != fin["coastalNetBenefit"]

def test_6_operator_can_accept_terms(client, db_session):
    res = client.post("/api/consolidation/proposals/PROP-2026-402/respond", json={
        "operator_id": "OP-1",
        "decision": "accepted",
        "notes": "Terms acceptable to Apex Express"
    })
    assert res.status_code == 200
    data = res.json()
    assert data["operator_agreements"]["OP-1"]["status"] == "accepted"

def test_7_operator_can_reject_proposal(client, db_session):
    res = client.post("/api/consolidation/proposals/PROP-2026-402/respond", json={
        "operator_id": "OP-2",
        "decision": "rejected",
        "notes": "Capacity needed for private charter"
    })
    assert res.status_code == 200
    prop = db_session.query(ConsolidationProposal).filter(ConsolidationProposal.id == "PROP-2026-402").first()
    assert prop.status == "rejected"

def test_8_revised_terms_invalidate_obsolete_approvals(client, db_session):
    # Set OP-1 to accepted first
    client.post("/api/consolidation/proposals/PROP-2026-402/respond", json={
        "operator_id": "OP-1",
        "decision": "accepted"
    })
    # Revise terms
    res = client.post("/api/consolidation/proposals/PROP-2026-402/revise", json={
        "transfer_payment": 6500.0
    })
    assert res.status_code == 200
    data = res.json()
    assert data["version"] == 2
    # Prior approvals invalidated: both should be pending!
    assert data["operator_agreements"]["OP-1"]["status"] == "pending"
    assert data["operator_agreements"]["OP-2"]["status"] == "pending"

def test_9_both_operators_must_accept_same_version(client, db_session):
    # Only OP-1 accepts
    client.post("/api/consolidation/proposals/PROP-2026-402/respond", json={
        "operator_id": "OP-1",
        "decision": "accepted"
    })
    # Sending offers or finalizing should be blocked
    res = client.post("/api/consolidation/proposals/PROP-2026-402/send-offers")
    assert res.status_code == 400

    # OP-2 accepts as well
    client.post("/api/consolidation/proposals/PROP-2026-402/respond", json={
        "operator_id": "OP-2",
        "decision": "accepted"
    })
    res2 = client.post("/api/consolidation/proposals/PROP-2026-402/send-offers")
    assert res2.status_code == 200

def test_10_and_11_passenger_acceptance_and_declining_not_silently_transferred(client, db_session):
    # BKG-201-01 accepts
    res1 = client.post("/api/passenger/respond-consolidation", json={
        "booking_id": "BKG-201-01",
        "decision": "accept"
    })
    assert res1.status_code == 200

    # BKG-201-02 requests refund
    res2 = client.post("/api/passenger/respond-consolidation", json={
        "booking_id": "BKG-201-02",
        "decision": "refund"
    })
    assert res2.status_code == 200

    b1 = db_session.query(Booking).filter(Booking.id == "BKG-201-01").first()
    b2 = db_session.query(Booking).filter(Booking.id == "BKG-201-02").first()
    assert b1.status == "consolidation_accepted"
    assert b2.status == "consolidation_refund_requested"

def test_12_insufficient_consent_prevents_finalization(client, db_session):
    # Simulate low accept (drops below 70%)
    client.post("/api/passenger/simulate-consolidation", json={"scenario": "low_accept_50_infeasible"})
    res = client.post("/api/consolidation/proposals/PROP-2026-402/finalize")
    assert res.status_code == 400
    assert "below the minimum viability threshold" in res.json()["detail"]

def test_13_finalized_proposal_updates_trips_and_assignments(client, db_session):
    # Simulate high accept (> 90%)
    client.post("/api/passenger/simulate-consolidation", json={"scenario": "high_accept_90"})
    res = client.post("/api/consolidation/proposals/PROP-2026-402/finalize")
    assert res.status_code == 200

    t1 = db_session.query(Trip).filter(Trip.id == "TRIP-201").first()
    t2 = db_session.query(Trip).filter(Trip.id == "TRIP-202").first()
    v1 = db_session.query(Vehicle).filter(Vehicle.id == "BUS-201").first()
    v2 = db_session.query(Vehicle).filter(Vehicle.id == "BUS-202").first()

    assert t1.status == "Consolidated (Withdrawn)"
    assert t2.status == "Active Consolidated Service"
    assert v1.status == "Withdrawn (Consolidated into BUS-202)"
    assert v2.status == "Active Consolidated"

def test_14_cancelled_proposal_cannot_be_finalized(client, db_session):
    # Reset proposal to cancelled
    prop = db_session.query(ConsolidationProposal).filter(ConsolidationProposal.id == "PROP-2026-402").first()
    prop.status = "cancelled"
    db_session.commit()

    res = client.post("/api/consolidation/proposals/PROP-2026-402/finalize")
    assert res.status_code == 400
