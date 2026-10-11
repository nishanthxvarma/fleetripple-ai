from datetime import datetime
from sqlalchemy.orm import Session
from app.models.audit_event import AuditEvent

def log_audit_event(
    db: Session,
    event_type: str,
    actor: str,
    description: str,
    badge_color: str = "blue",
    entity_type: str = None,
    entity_id: str = None
) -> AuditEvent:
    now = datetime.now()
    timestamp_str = now.strftime("%H:%M:%S IST")
    event_id = f"LOG-{int(now.timestamp() * 1000) % 100000:05d}"

    event = AuditEvent(
        id=event_id,
        timestamp=timestamp_str,
        event_type=event_type,
        actor=actor,
        description=description,
        badge_color=badge_color,
        entity_type=entity_type,
        entity_id=entity_id
    )
    db.add(event)
    db.commit()
    db.refresh(event)
    return event
