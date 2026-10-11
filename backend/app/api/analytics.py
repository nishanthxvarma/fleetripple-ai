from fastapi import APIRouter, Depends
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.trip import Trip
from app.models.booking import Booking
from app.models.audit_event import AuditEvent

router = APIRouter()

@router.get("/analytics/occupancy")
def get_occupancy_analytics(db: Session = Depends(get_db)):
    trips = db.query(Trip).all()
    data = []
    for t in trips:
        data.append({
            "tripId": t.id,
            "route": t.route_name,
            "occupancy": t.occupancy_percent,
            "capacity": t.scheduled_capacity,
            "booked": t.confirmed_bookings,
            "operator": t.operator_name
        })
    return data

@router.get("/audit-events")
def get_audit_events(limit: int = 50, db: Session = Depends(get_db)):
    events = db.query(AuditEvent).order_by(AuditEvent.created_at.desc()).limit(limit).all()
    return [
        {
            "id": e.id,
            "timestamp": e.timestamp,
            "type": e.event_type,
            "actor": e.actor,
            "description": e.description,
            "badgeColor": e.badge_color,
            "entityType": e.entity_type,
            "entityId": e.entity_id
        }
        for e in events
    ]
