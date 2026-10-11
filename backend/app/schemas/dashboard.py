from pydantic import BaseModel
from typing import List, Dict, Any, Optional

class DashboardSummaryResponse(BaseModel):
    totalBusesCount: int
    availableBusesCount: int
    activeBreakdownsCount: int
    unassignedPassengersCount: int
    underbookedTripsCount: int
    pendingOperatorAgreementsCount: int
    pendingPassengerResponsesCount: int
    totalIllustrativeSavings: float
    corridorSummary: Dict[str, Any]

class ActionQueueItem(BaseModel):
    id: str
    urgency: str  # 'critical' | 'high' | 'medium'
    title: str
    description: str
    module: str  # 'rippleops' | 'tripmerge' | 'passenger'
    actionLabel: str
    actionPayload: Dict[str, Any]
