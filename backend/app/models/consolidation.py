import json
from datetime import datetime
from sqlalchemy import Column, String, Integer, Float, ForeignKey, DateTime, Text
from app.database import Base

class ConsolidationProposal(Base):
    __tablename__ = "consolidation_proposals"

    id = Column(String, primary_key=True, index=True)
    participating_trip_ids_json = Column(Text, default="[]")
    participating_operator_ids_json = Column(Text, default="[]")
    replacement_vehicle_id = Column(String, ForeignKey("vehicles.id"), nullable=False)
    replacement_capacity = Column(Integer, default=40)
    combined_passenger_demand = Column(Integer, default=0)
    status = Column(String, default="draft")
    # 'draft' | 'under_review' | 'operator_approved' | 'passenger_consent_active' | 'finalized' | 'rejected' | 'cancelled'
    version = Column(Integer, default=1)
    viability_threshold_percent = Column(Float, default=70.0)
    financials_json = Column(Text, default="{}")
    departure_time = Column(String, default="18:15")
    route = Column(String, default="Visakhapatnam to Vijayawada via NH-16")
    projected_occupancy_percent = Column(Float, default=67.5)
    created_at = Column(DateTime, default=datetime.utcnow)
    finalized_at = Column(DateTime, nullable=True)

    @property
    def participating_trip_ids(self):
        try:
            return json.loads(self.participating_trip_ids_json) if self.participating_trip_ids_json else []
        except Exception:
            return []

    @participating_trip_ids.setter
    def participating_trip_ids(self, value):
        self.participating_trip_ids_json = json.dumps(value)

    @property
    def participating_operator_ids(self):
        try:
            return json.loads(self.participating_operator_ids_json) if self.participating_operator_ids_json else []
        except Exception:
            return []

    @participating_operator_ids.setter
    def participating_operator_ids(self, value):
        self.participating_operator_ids_json = json.dumps(value)

    @property
    def financials(self):
        try:
            return json.loads(self.financials_json) if self.financials_json else {}
        except Exception:
            return {}

    @financials.setter
    def financials(self, value):
        self.financials_json = json.dumps(value)
