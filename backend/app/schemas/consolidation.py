from pydantic import BaseModel
from typing import Optional, List, Dict, Any
from datetime import datetime

class ConsolidationOpportunity(BaseModel):
    id: str
    trip_id_1: str
    trip_id_2: str
    operator_1: str
    operator_2: str
    origin: str
    destination: str
    departure_time_1: str
    departure_time_2: str
    passengers_1: int
    passengers_2: int
    combined_passengers: int
    candidate_capacity: int
    compatibility: str
    est_gross_savings: float
    status: str

class OperatorAgreementSchema(BaseModel):
    operator_id: str
    operator_name: str
    status: str
    notes: Optional[str] = None
    responded_at: Optional[datetime] = None

class FinancialBreakdown(BaseModel):
    grossOperatingSavings: float
    originalTrip1Cost: float
    originalTrip2Cost: float
    consolidatedTripCost: float
    platformBrokerageFee: float
    apexTransferPayment: float
    apexNetSavings: float
    coastalNetBenefit: float

class PassengerConsentSummary(BaseModel):
    status: str
    offersSentCount: int
    acceptedCount: int
    refundCount: int
    pendingCount: int
    acceptanceRatePercent: float
    isViable: bool

class ConsolidationProposalResponse(BaseModel):
    id: str
    participating_trip_ids: List[str]
    participating_operator_ids: List[str]
    replacement_vehicle_id: str
    replacement_capacity: int
    combined_passenger_demand: int
    status: str
    version: int
    viability_threshold_percent: float
    financials: Dict[str, Any]
    operator_agreements: Dict[str, Dict[str, Any]]
    passenger_consent: Dict[str, Any]
    departure_time: str
    route: str
    finalized_at: Optional[datetime] = None

    class Config:
        extra = "allow"

class OperatorNegotiateRequest(BaseModel):
    operator_id: str
    decision: str  # 'accepted' | 'rejected' | 'revision_requested'
    notes: Optional[str] = ""

class ProposalReviseRequest(BaseModel):
    transfer_payment: float

class ConsolidationFinalizeResponse(BaseModel):
    success: bool
    message: str
    proposal: Optional[ConsolidationProposalResponse] = None
