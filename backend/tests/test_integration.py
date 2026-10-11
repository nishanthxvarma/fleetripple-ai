import pytest
from app.models import BreakdownIncident, ConsolidationProposal, Trip, Vehicle, Booking

def test_full_recovery_workflow_e2e(client, db_session):
    # Reset demo state to clean slate
    client.post("/api/demo/reset")

    # 1. Discover alternatives for active incident INC-2026-081
    alt_res = client.post("/api/incidents/INC-2026-081/discover-alternatives")
    assert alt_res.status_code == 200
    alt_data = alt_res.json()
    assert alt_data["candidates_examined"] >= 3
    # Verify BUS-104 excluded
    incompat_ids = [c["id"] for c in alt_data["incompatible_candidates"]]
    assert "BUS-104" in incompat_ids

    # 2. Generate recovery plan
    plan_res = client.post("/api/incidents/INC-2026-081/generate-plan")
    assert plan_res.status_code == 200
    plan = plan_res.json()["recoveryPlan"]
    assert plan["isFeasible"] is True
    assert plan["totalAssigned"] == 35

    # 3. Approve plan
    appr_res = client.post("/api/incidents/INC-2026-081/approve-plan")
    assert appr_res.status_code == 200

    # 4. Send offers
    offer_res = client.post("/api/incidents/INC-2026-081/send-offers")
    assert offer_res.status_code == 200
    assert offer_res.json()["offersSent"] == 18

    # 5. Simulate realistic responses (1 waiting, 1 refund, 33 accepted)
    client.post("/api/passenger/simulate-recovery", json={"scenario": "mixed_realistic"})

    # 6. Reconcile manifest
    recon_res = client.post("/api/incidents/INC-2026-081/reconcile")
    assert recon_res.status_code == 200
    recon = recon_res.json()
    assert recon["waiting_count"] == 1
    assert recon["refund_requested_count"] == 1
    assert recon["can_resolve"] is False  # Cannot resolve while 1 is waiting!

    # 7. Attempting to resolve prematurely must be blocked
    block_res = client.post("/api/incidents/INC-2026-081/resolve")
    assert block_res.status_code == 400

    # 8. Arrange standby relief shuttle for waiting passengers
    relief_res = client.post("/api/incidents/INC-2026-081/arrange-backup")
    assert relief_res.status_code == 200

    # 9. Now re-reconcile and resolve
    recon_res2 = client.post("/api/incidents/INC-2026-081/reconcile")
    assert recon_res2.status_code == 200
    assert recon_res2.json()["can_resolve"] is True

    resolve_res = client.post("/api/incidents/INC-2026-081/resolve", json={
        "resolution_summary": "All 35 passengers safely recovered or accommodated with standby shuttle."
    })
    assert resolve_res.status_code == 200
    assert resolve_res.json()["status"] == "resolved"


def test_full_consolidation_workflow_e2e(client, db_session):
    # 1. Inspect opportunity
    opps_res = client.get("/api/consolidation/opportunities?threshold=50")
    assert opps_res.status_code == 200

    # 2. Both operators negotiate and accept terms for PROP-2026-402
    res_op1 = client.post("/api/consolidation/proposals/PROP-2026-402/respond", json={
        "operator_id": "OP-1",
        "decision": "accepted",
        "notes": "Confirmed by Apex Ops"
    })
    assert res_op1.status_code == 200

    res_op2 = client.post("/api/consolidation/proposals/PROP-2026-402/respond", json={
        "operator_id": "OP-2",
        "decision": "accepted",
        "notes": "Confirmed by Coastal Cruiser Ops"
    })
    assert res_op2.status_code == 200
    assert res_op2.json()["status"] == "operator_approved"

    # 3. Send consolidation offers to all 27 passengers
    offers_res = client.post("/api/consolidation/proposals/PROP-2026-402/send-offers")
    assert offers_res.status_code == 200
    assert offers_res.json()["status"] == "passenger_consent_active"

    # 4. Simulate high passenger consent (26 accept, 1 refund -> 96.3% > 70%)
    client.post("/api/passenger/simulate-consolidation", json={"scenario": "high_accept_90"})

    # 5. Finalize consolidation
    fin_res = client.post("/api/consolidation/proposals/PROP-2026-402/finalize")
    assert fin_res.status_code == 200
    assert fin_res.json()["success"] is True

    # 6. Verify consistent operational state
    t1 = db_session.query(Trip).filter(Trip.id == "TRIP-201").first()
    t2 = db_session.query(Trip).filter(Trip.id == "TRIP-202").first()
    v1 = db_session.query(Vehicle).filter(Vehicle.id == "BUS-201").first()
    v2 = db_session.query(Vehicle).filter(Vehicle.id == "BUS-202").first()

    assert t1.status == "Consolidated (Withdrawn)"
    assert t2.status == "Active Consolidated Service"
    assert v1.status == "Withdrawn (Consolidated into BUS-202)"
    assert v2.status == "Active Consolidated"
    assert t2.confirmed_bookings == 26
