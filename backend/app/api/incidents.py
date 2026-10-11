from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from app.database import get_db
from app.models.incident import BreakdownIncident
from app.models.recovery import RecoveryPlan
from app.schemas.incident import IncidentCreate, IncidentResolveRequest
from app.services.recovery_service import RecoveryService

router = APIRouter(prefix="/incidents")

def serialize_incident(inc: BreakdownIncident, db: Session):
    plan = db.query(RecoveryPlan).filter(RecoveryPlan.incident_id == inc.id).first()
    plan_dict = None
    if plan:
        plan_dict = {
            "id": plan.id,
            "incidentId": plan.incident_id,
            "status": plan.status,
            "isFeasible": plan.is_feasible,
            "feasibilityStatus": plan.feasibility_status,
            "totalAffected": plan.total_affected,
            "totalAssigned": plan.total_assigned,
            "totalUnassigned": plan.total_unassigned,
            "estAdditionalWaitingTime": plan.est_additional_waiting_time,
            "estTransferCost": plan.est_transfer_cost,
            "routeCompatibilityCheck": plan.route_compatibility_check,
            "capacityCheck": plan.capacity_check,
            "assignments": plan.assignments,
            "excludedBuses": plan.excluded_vehicles,
            "createdAt": plan.created_at.strftime("%H:%M IST") if plan.created_at else None
        }

    return {
        "id": inc.id,
        "busId": inc.vehicle_id,
        "tripId": inc.trip_id,
        "route": inc.route,
        "stage": inc.stage,
        "location": inc.location,
        "affectedPassengers": inc.affected_passengers,
        "reportedTime": inc.reported_time,
        "description": inc.description,
        "status": inc.status,
        "resolutionSummary": inc.resolution_summary,
        "recoveryPlan": plan_dict
    }

@router.get("")
def get_incidents(db: Session = Depends(get_db)):
    incidents = db.query(BreakdownIncident).order_by(BreakdownIncident.created_at.desc()).all()
    return [serialize_incident(inc, db) for inc in incidents]

@router.post("")
def report_breakdown(payload: IncidentCreate, db: Session = Depends(get_db)):
    incident = RecoveryService.report_breakdown(
        db=db,
        vehicle_id=payload.vehicle_id,
        trip_id=payload.trip_id,
        stage=payload.stage,
        location=payload.location,
        affected_passengers=payload.affected_passengers,
        description=payload.description
    )
    return serialize_incident(incident, db)

@router.get("/{incident_id}")
def get_incident(incident_id: str, db: Session = Depends(get_db)):
    incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
    if not incident:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Incident not found")
    return serialize_incident(incident, db)

@router.post("/{incident_id}/discover-alternatives")
def discover_alternatives(incident_id: str, db: Session = Depends(get_db)):
    return RecoveryService.discover_alternatives(db, incident_id)

@router.post("/{incident_id}/generate-plan")
def generate_recovery_plan(incident_id: str, db: Session = Depends(get_db)):
    plan = RecoveryService.generate_recovery_plan(db, incident_id)
    incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
    return serialize_incident(incident, db)

@router.get("/{incident_id}/recovery-plan")
def get_recovery_plan(incident_id: str, db: Session = Depends(get_db)):
    plan = db.query(RecoveryPlan).filter(RecoveryPlan.incident_id == incident_id).first()
    if not plan:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Plan not found")
    return {
        "id": plan.id,
        "incidentId": plan.incident_id,
        "status": plan.status,
        "isFeasible": plan.is_feasible,
        "feasibilityStatus": plan.feasibility_status,
        "totalAffected": plan.total_affected,
        "totalAssigned": plan.total_assigned,
        "totalUnassigned": plan.total_unassigned,
        "estAdditionalWaitingTime": plan.est_additional_waiting_time,
        "estTransferCost": plan.est_transfer_cost,
        "routeCompatibilityCheck": plan.route_compatibility_check,
        "capacityCheck": plan.capacity_check,
        "assignments": plan.assignments,
        "excludedBuses": plan.excluded_vehicles
    }

@router.post("/{incident_id}/approve-plan")
def approve_recovery_plan(incident_id: str, db: Session = Depends(get_db)):
    result = RecoveryService.approve_plan(db, incident_id)
    incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
    return {
        "success": True,
        "message": result["message"],
        "incident": serialize_incident(incident, db)
    }

@router.post("/{incident_id}/send-offers")
def send_recovery_offers(incident_id: str, db: Session = Depends(get_db)):
    result = RecoveryService.send_offers(db, incident_id)
    incident = db.query(BreakdownIncident).filter(BreakdownIncident.id == incident_id).first()
    return {
        "success": True,
        "offersSent": result["offers_sent"],
        "incident": serialize_incident(incident, db)
    }

@router.post("/{incident_id}/reconcile")
def reconcile_manifest(incident_id: str, db: Session = Depends(get_db)):
    return RecoveryService.reconcile_manifest(db, incident_id)

@router.post("/{incident_id}/arrange-backup")
def arrange_backup(incident_id: str, db: Session = Depends(get_db)):
    return RecoveryService.arrange_backup_for_waiting(db, incident_id)

@router.post("/{incident_id}/resolve")
def resolve_incident(incident_id: str, payload: IncidentResolveRequest = None, db: Session = Depends(get_db)):
    summary = payload.resolution_summary if payload else None
    return RecoveryService.resolve_incident(db, incident_id, summary)
