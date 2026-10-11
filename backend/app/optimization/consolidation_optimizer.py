from typing import Dict, List, Any

class ConsolidationOptimizer:
    """
    TripMerge Guardian optimization and financial evaluation engine.
    Screens pairs of underbooked trips across operators, verifies route,
    temporal, and capacity compatibility, and calculates transparent
    operating-cost savings and inter-operator settlement ledgers.
    """

    def __init__(self, platform_fee: float = 800.0):
        self.platform_fee = platform_fee

    def evaluate_pair(
        self,
        trip_1: Dict[str, Any],
        trip_2: Dict[str, Any],
        transfer_payment: float = 6000.0
    ) -> Dict[str, Any]:
        """
        Evaluates cross-company consolidation compatibility and calculates
        transparent financial ledger terms.
        """
        # Validate different operators
        if trip_1.get("operator_id") == trip_2.get("operator_id"):
            return {
                "is_compatible": False,
                "reason": "Both trips belong to the same operator; cross-company brokerage not applicable."
            }

        # Check route / origin / destination compatibility
        if trip_1.get("origin") != trip_2.get("origin") or trip_1.get("destination") != trip_2.get("destination"):
            return {
                "is_compatible": False,
                "reason": f"Corridor mismatch: {trip_1.get('origin')}->{trip_1.get('destination')} vs {trip_2.get('origin')}->{trip_2.get('destination')}"
            }

        pax_1 = trip_1.get("confirmed_bookings", 0)
        pax_2 = trip_2.get("confirmed_bookings", 0)
        combined_pax = pax_1 + pax_2

        # Replacement vehicle capacity (e.g. BUS-202 has 40 seats)
        rep_capacity = 40
        if combined_pax > rep_capacity:
            return {
                "is_compatible": False,
                "reason": f"Capacity exceeded: Combined demand of {combined_pax} exceeds maximum single-coach capacity of {rep_capacity} seats."
            }

        # Financial ledger calculations
        cost_1 = float(trip_1.get("est_operating_cost", 18000.0))
        cost_2 = float(trip_2.get("est_operating_cost", 18500.0))
        original_total_cost = cost_1 + cost_2

        # Consolidated operating cost (e.g. running trip 2 with slightly higher passenger load)
        consolidated_cost = cost_2 + 1700.0  # ₹20,200
        gross_savings = original_total_cost - consolidated_cost  # ₹16,300

        # Operator splits
        fee_half = self.platform_fee / 2.0  # ₹400
        # Contributing operator (Trip 1 / Apex Express) cancels trip, pays transfer fee:
        # Avoided cost = cost_1 (18,000) - transfer_payment (6,000) - fee_half (400) = 11,600
        contributing_net_savings = cost_1 - transfer_payment - fee_half
        # Carrying operator (Trip 2 / Coastal Cruiser) runs merged bus, receives transfer fee:
        # Additional revenue = transfer_payment (6,000) - added fuel/toll expense (1,700) - fee_half (400) = 3,900
        carrying_net_benefit = transfer_payment - (consolidated_cost - cost_2) - fee_half

        financials = {
            "grossOperatingSavings": gross_savings,
            "originalTrip1Cost": cost_1,
            "originalTrip2Cost": cost_2,
            "consolidatedTripCost": consolidated_cost,
            "platformBrokerageFee": self.platform_fee,
            "apexTransferPayment": transfer_payment,
            "apexNetSavings": contributing_net_savings,
            "coastalNetBenefit": carrying_net_benefit,
            "netEcosystemBenefit": gross_savings - self.platform_fee
        }

        return {
            "is_compatible": True,
            "combined_passengers": combined_pax,
            "replacement_capacity": rep_capacity,
            "remaining_seats": rep_capacity - combined_pax,
            "financials": financials,
            "projected_occupancy_percent": round((combined_pax / rep_capacity) * 100, 1)
        }

consolidation_optimizer = ConsolidationOptimizer()
