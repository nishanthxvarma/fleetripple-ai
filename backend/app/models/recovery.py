import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, Boolean, ForeignKey, DateTime, Text
from app.database import Base

class RecoveryPlan(Base):
    __tablename__ = "recovery_plans"

    id = Column(String, primary_key=True, index=True)
    incident_id = Column(String, ForeignKey("breakdown_incidents.id"), nullable=False, index=True)
    status = Column(String, default="proposed")  # 'proposed' | 'approved' | 'superseded'
    is_feasible = Column(Boolean, default=False)
    feasibility_status = Column(String, nullable=False)
    total_affected = Column(Integer, default=0)
    total_assigned = Column(Integer, default=0)
    total_unassigned = Column(Integer, default=0)
    est_additional_waiting_time = Column(String, default="")
    est_transfer_cost = Column(Float, default=0.0)
    route_compatibility_check = Column(String, default="")
    capacity_check = Column(String, default="")
    assignments_json = Column(Text, default="[]")
    excluded_vehicles_json = Column(Text, default="[]")
    created_at = Column(DateTime, default=datetime.utcnow)
    approved_at = Column(DateTime, nullable=True)

    @property
    def assignments(self):
        try:
            return json.loads(self.assignments_json) if self.assignments_json else []
        except Exception:
            return []

    @assignments.setter
    def assignments(self, value):
        self.assignments_json = json.dumps(value)

    @property
    def excluded_vehicles(self):
        try:
            return json.loads(self.excluded_vehicles_json) if self.excluded_vehicles_json else []
        except Exception:
            return []

    @excluded_vehicles.setter
    def excluded_vehicles(self, value):
        self.excluded_vehicles_json = json.dumps(value)
