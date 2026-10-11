from pydantic import BaseModel
from typing import Optional, List, Any, Dict
from datetime import datetime

class AlternativeCandidate(BaseModel):
    id: str
    reg_number: str
    operator_id: str
    operator_name: str
    model: str
    route: str
    capacity: int
    confirmed_bookings: int
    available_seats: int
    status: str
    location: str
    direction: str
    current_trip_id: Optional[str] = None
    is_available: bool
    departure_time: Optional[str] = None
    arrival_time: Optional[str] = None
    eta_minutes: Optional[int] = None
    distance_km: Optional[float] = None
    is_compatible: bool
    compatibility_note: str

class AlternativeDiscoveryResponse(BaseModel):
    incident_id: str
    location: str
    candidates_examined: int
    compatible_candidates: List[AlternativeCandidate]
    incompatible_candidates: List[AlternativeCandidate]

class RecoveryPlanResponse(BaseModel):
    id: str
    incident_id: str
    status: str
    is_feasible: bool
    feasibility_status: str
    total_affected: int
    total_assigned: int
    total_unassigned: int
    est_additional_waiting_time: str
    est_transfer_cost: float
    route_compatibility_check: str
    capacity_check: str
    assignments: List[Dict[str, Any]]
    excluded_vehicles: List[Dict[str, Any]]
    created_at: Optional[datetime] = None
    approved_at: Optional[datetime] = None

    class Config:
        from_attributes = True

class PlanApprovalResponse(BaseModel):
    success: bool
    message: str
    plan: RecoveryPlanResponse

class ReconcileResponse(BaseModel):
    incident_id: str
    status: str
    total_passengers: int
    accepted_count: int
    waiting_count: int
    refund_requested_count: int
    unassigned_count: int
    can_resolve: bool
    reconciliation_notes: str
