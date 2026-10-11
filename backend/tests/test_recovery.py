import pytest
from app.models import Vehicle, Booking, BreakdownIncident, RecoveryPlan, RefundRequest
from app.optimization.recovery_optimizer import recovery_optimizer

def test_1_compatible_capacity_equals_demand():
    # 35 affected passengers, candidate buses: BUS-102 (15) and BUS-103 (20)
    candidates = [
        {"id": "BUS-102", "available_seats": 15, "is_compatible": True, "eta_minutes": 20},
        {"id": "BUS-103", "available_seats": 20, "is_compatible": True, "eta_minutes": 35},
    ]
    res = recovery_optimizer.optimize_allocation("INC-01", 35, [], candidates, "Anakapalle")
    assert res["is_feasible"] is True
    assert res["total_assigned"] == 35
    assert res["total_unassigned"] == 0
    assert len(res["assignments"]) == 2

def test_2_compatible_capacity_insufficient():
    # 45 affected passengers, but only 35 seats available
    candidates = [
        {"id": "BUS-102", "available_seats": 15, "is_compatible": True, "eta_minutes": 20},
        {"id": "BUS-103", "available_seats": 20, "is_compatible": True, "eta_minutes": 35},
    ]
    res = recovery_optimizer.optimize_allocation("INC-01", 45, [], candidates, "Anakapalle")
    assert res["is_feasible"] is False
    assert res["total_assigned"] == 35
    assert res["total_unassigned"] == 10
    assert "SHORTFALL" in res["feasibility_status"]

def test_3_incompatible_route_excluded():
    candidates = [
        {"id": "BUS-102", "available_seats": 15, "is_compatible": True, "eta_minutes": 20},
        {"id": "BUS-104", "available_seats": 10, "is_compatible": False, "compatibility_note": "Route diverges at Kathipudi towards Kakinada", "eta_minutes": 12},
    ]
    res = recovery_optimizer.optimize_allocation("INC-01", 15, [], candidates, "Anakapalle")
    assert res["is_feasible"] is True
    # BUS-104 must be in excluded_vehicles
    excluded_ids = [e["busId"] for e in res["excluded_vehicles"]]
    assert "BUS-104" in excluded_ids
    assert any("Kathipudi" in e["reason"] for e in res["excluded_vehicles"])

def test_4_unavailable_vehicle_excluded():
    candidates = [
        {"id": "BUS-102", "available_seats": 15, "is_compatible": True, "is_available": False, "eta_minutes": 20},
        {"id": "BUS-103", "available_seats": 20, "is_compatible": True, "is_available": True, "eta_minutes": 35},
    ]
    res = recovery_optimizer.optimize_allocation("INC-01", 20, [], candidates, "Anakapalle")
    excluded_ids = [e["busId"] for e in res["excluded_vehicles"]]
    assert "BUS-102" in excluded_ids

def test_5_bus_with_insufficient_seats_cannot_receive_invalid_assignment():
    candidates = [
        {"id": "BUS-102", "available_seats": 5, "is_compatible": True, "eta_minutes": 20},
    ]
    res = recovery_optimizer.optimize_allocation("INC-01", 10, [], candidates, "Anakapalle")
    # Only 5 seats can be assigned, never exceeding availableCapacity (5)
    bus102_assign = next(a for a in res["assignments"] if a["busId"] == "BUS-102")
    assert bus102_assign["allocatedSeats"] <= 5
    assert res["total_unassigned"] == 5

def test_6_passenger_acceptance_is_persisted(client, db_session):
    # Respond to BKG-101-01
    res = client.post("/api/passenger/respond-recovery", json={"booking_id": "BKG-101-01", "decision": "accept"})
    assert res.status_code == 200
    bkg = db_session.query(Booking).filter(Booking.id == "BKG-101-01").first()
    assert bkg.status == "accepted"

def test_7_passenger_who_declines_is_not_assigned(client, db_session):
    res = client.post("/api/passenger/respond-recovery", json={"booking_id": "BKG-101-02", "decision": "wait"})
    assert res.status_code == 200
    bkg = db_session.query(Booking).filter(Booking.id == "BKG-101-02").first()
    assert bkg.status == "waiting_alternative"

def test_8_refund_request_recorded_separately(client, db_session):
    res = client.post("/api/passenger/respond-recovery", json={
        "booking_id": "BKG-101-04",
        "decision": "refund",
        "reason": "Cannot travel with schedule shift"
    })
    assert res.status_code == 200
    bkg = db_session.query(Booking).filter(Booking.id == "BKG-101-04").first()
    assert bkg.status == "refund_requested"
    ref = db_session.query(RefundRequest).filter(RefundRequest.booking_id == "BKG-101-04").first()
    assert ref is not None
    assert ref.status == "recorded_pending_settlement"
    assert ref.amount == bkg.fare

def test_9_duplicate_active_incident_rejected(client):
    client.post("/api/demo/reset")
    # Try creating another incident for TRIP-101 while INC-2026-081 is active
    res = client.post("/api/incidents", json={
        "vehicle_id": "BUS-101",
        "trip_id": "TRIP-101",
        "stage": "En Route",
        "location": "Anakapalle",
        "affected_passengers": 35
    })
    assert res.status_code == 409

def test_10_stale_recovery_plan_cannot_be_approved(client, db_session):
    # First generate a plan
    client.post("/api/incidents/INC-2026-081/generate-plan")
    # Make candidate BUS-102 unavailable
    v = db_session.query(Vehicle).filter(Vehicle.id == "BUS-102").first()
    v.is_available = False
    db_session.commit()

    # Approving plan should now fail due to stale vehicle state
    res = client.post("/api/incidents/INC-2026-081/approve-plan")
    assert res.status_code == 409

    # Re-enable BUS-102 for subsequent tests
    v.is_available = True
    db_session.commit()

def test_11_standby_relief_shuttle_dispatch(client, db_session):
    # Set a booking to waiting_alternative
    b = db_session.query(Booking).filter(Booking.id == "BKG-101-03").first()
    b.status = "waiting_alternative"
    db_session.commit()

    res = client.post("/api/incidents/INC-2026-081/arrange-backup")
    assert res.status_code == 200
    db_session.refresh(b)
    assert b.status == "accepted"
    assert "BUS-STBY-01" in b.assigned_vehicle_id

def test_12_incident_cannot_be_closed_with_unresolved_passengers(client, db_session):
    # Set a booking to unassigned
    b = db_session.query(Booking).filter(Booking.id == "BKG-101-05").first()
    b.status = "unassigned"
    db_session.commit()

    res = client.post("/api/incidents/INC-2026-081/resolve")
    assert res.status_code == 400
    assert "Cannot close incident" in res.json()["detail"]
