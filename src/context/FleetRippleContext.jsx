import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api';
import {
  INITIAL_OPERATORS,
  INITIAL_BUSES,
  INITIAL_TRIPS,
  INITIAL_BOOKINGS_BUS101,
  INITIAL_BOOKINGS_TRIP201,
  INITIAL_BOOKINGS_TRIP202,
  INITIAL_INCIDENT,
  INITIAL_CONSOLIDATION_PROPOSAL,
  INITIAL_AUDIT_LOGS,
} from '../data/mockData';

const LOCAL_STORAGE_KEY = 'fleetripple_ai_demo_state_v2';

const FleetRippleContext = createContext(null);

export function normalizeProposal(p) {
  if (!p) return null;
  const opAgreements = p.operatorAgreements || p.operator_agreements || {
    'OP-1': { operator_id: 'OP-1', operator_name: 'Apex Express', status: 'pending', notes: '' },
    'OP-2': { operator_id: 'OP-2', operator_name: 'Coastal Cruiser', status: 'pending', notes: '' }
  };
  const consent = p.passengerConsent || p.passenger_consent || {
    status: 'idle',
    offersSentCount: 0,
    acceptedCount: 0,
    refundCount: 0,
    pendingCount: 0,
    acceptanceRatePercent: 0,
    isViable: false
  };
  const rawT1 = p.trip1 || {};
  const trip1 = {
    id: rawT1.id || 'TRIP-201',
    operatorId: rawT1.operatorId || rawT1.operator_id || 'OP-1',
    operatorName: rawT1.operatorName || rawT1.operator_name || 'Apex Express',
    busId: rawT1.busId || rawT1.vehicle_id || 'BUS-201',
    departureTime: rawT1.departureTime || rawT1.departure_time || '18:00',
    capacity: rawT1.capacity || rawT1.scheduled_capacity || 40,
    confirmedBookings: rawT1.confirmedBookings !== undefined ? rawT1.confirmedBookings : (rawT1.confirmed_bookings || 12),
    occupancyPercent: rawT1.occupancyPercent !== undefined ? rawT1.occupancyPercent : (rawT1.occupancy_percent || 30.0),
    estCost: rawT1.estCost || rawT1.estOperatingCost || rawT1.est_operating_cost || 18000,
    estOperatingCost: rawT1.estOperatingCost || rawT1.estCost || rawT1.est_operating_cost || 18000,
  };
  const rawT2 = p.trip2 || {};
  const trip2 = {
    id: rawT2.id || 'TRIP-202',
    operatorId: rawT2.operatorId || rawT2.operator_id || 'OP-2',
    operatorName: rawT2.operatorName || rawT2.operator_name || 'Coastal Cruiser',
    busId: rawT2.busId || rawT2.vehicle_id || 'BUS-202',
    departureTime: rawT2.departureTime || rawT2.departure_time || '18:15',
    capacity: rawT2.capacity || rawT2.scheduled_capacity || 40,
    confirmedBookings: rawT2.confirmedBookings !== undefined ? rawT2.confirmedBookings : (rawT2.confirmed_bookings || 15),
    occupancyPercent: rawT2.occupancyPercent !== undefined ? rawT2.occupancyPercent : (rawT2.occupancy_percent || 37.5),
    estCost: rawT2.estCost || rawT2.estOperatingCost || rawT2.est_operating_cost || 18500,
    estOperatingCost: rawT2.estOperatingCost || rawT2.estCost || rawT2.est_operating_cost || 18500,
  };
  const rawFin = p.financials || {};
  const origCombined = rawFin.originalCombinedCost || ((rawFin.originalTrip1Cost || 0) + (rawFin.originalTrip2Cost || 0)) || (trip1.estCost + trip2.estCost) || 36500;
  const financials = {
    grossOperatingSavings: rawFin.grossOperatingSavings !== undefined ? rawFin.grossOperatingSavings : 16300,
    originalCombinedCost: origCombined,
    originalTrip1Cost: rawFin.originalTrip1Cost !== undefined ? rawFin.originalTrip1Cost : 18000,
    originalTrip2Cost: rawFin.originalTrip2Cost !== undefined ? rawFin.originalTrip2Cost : 18500,
    consolidatedTripCost: rawFin.consolidatedTripCost !== undefined ? rawFin.consolidatedTripCost : 20200,
    platformBrokerageFee: rawFin.platformBrokerageFee !== undefined ? rawFin.platformBrokerageFee : 800,
    apexTransferPayment: rawFin.apexTransferPayment !== undefined ? rawFin.apexTransferPayment : 6000,
    apexNetSavings: rawFin.apexNetSavings !== undefined ? rawFin.apexNetSavings : 11600,
    coastalNetBenefit: rawFin.coastalNetBenefit !== undefined ? rawFin.coastalNetBenefit : 3900,
  };

  return {
    ...p,
    operatorAgreements: opAgreements,
    operator_agreements: opAgreements,
    passengerConsent: consent,
    passenger_consent: consent,
    trip1,
    trip2,
    financials,
    route: p.route || 'Visakhapatnam to Vijayawada via NH-16',
    combinedDemand: p.combinedDemand || p.combined_passenger_demand || 27,
    replacementCapacity: p.replacementCapacity || p.replacement_capacity || 40,
    proposedReplacementBusId: p.proposedReplacementBusId || p.replacement_vehicle_id || 'BUS-202',
    proposedReplacementOperator: p.proposedReplacementOperator || 'Coastal Cruiser',
    proposedDepartureTime: p.proposedDepartureTime || p.departure_time || '18:15',
    projectedOccupancyPercent: p.projectedOccupancyPercent || p.projected_occupancy_percent || 67.5,
    viabilityThresholdPercent: p.viabilityThresholdPercent || p.viability_threshold_percent || 70,
  };
}

export function normalizeTrip(t) {
  if (!t) return null;
  const cost = t.estCost || t.estOperatingCost || t.est_operating_cost || 18000;
  return {
    ...t,
    estCost: cost,
    estOperatingCost: cost,
    capacity: t.capacity || t.scheduled_capacity || 40,
    confirmedBookings: t.confirmedBookings !== undefined ? t.confirmedBookings : (t.confirmed_bookings || 0),
    occupancyPercent: t.occupancyPercent !== undefined ? t.occupancyPercent : (t.occupancy_percent || 0),
    departureTime: t.departureTime || t.departure_time || '18:00',
    arrivalTime: t.arrivalTime || t.arrival_time || '00:00',
    operatorName: t.operatorName || t.operator_name || 'Apex Express',
    operatorId: t.operatorId || t.operator_id || 'OP-1',
  };
}

export function normalizeVehicle(v) {
  if (!v) return null;
  return {
    ...v,
    regNumber: v.regNumber || v.reg_number || 'AP 00 XX 0000',
    operatorName: v.operatorName || v.operator_name || 'Operator',
    operatorId: v.operatorId || v.operator_id || 'OP-1',
    availableSeats: v.availableSeats !== undefined ? v.availableSeats : (v.available_seats || 0),
    confirmedBookings: v.confirmedBookings !== undefined ? v.confirmedBookings : (v.confirmed_bookings || 0),
    capacity: v.capacity || 40,
    isAvailable: v.isAvailable !== undefined ? v.isAvailable : (v.is_available !== undefined ? v.is_available : true),
  };
}

export function normalizeIncident(inc) {
  if (!inc) return null;
  const rawPlan = inc.recoveryPlan;
  let normalizedPlan = null;
  if (rawPlan) {
    normalizedPlan = {
      ...rawPlan,
      estTransferCost: rawPlan.estTransferCost !== undefined ? rawPlan.estTransferCost : (rawPlan.est_transfer_cost || 4500),
      totalAffected: rawPlan.totalAffected !== undefined ? rawPlan.totalAffected : (rawPlan.total_affected || 35),
      totalAssigned: rawPlan.totalAssigned !== undefined ? rawPlan.totalAssigned : (rawPlan.total_assigned || 35),
      totalUnassigned: rawPlan.totalUnassigned !== undefined ? rawPlan.totalUnassigned : (rawPlan.total_unassigned || 0),
      assignments: rawPlan.assignments || [],
      excludedBuses: rawPlan.excludedBuses || rawPlan.excluded_vehicles || [],
    };
  }
  return {
    ...inc,
    busId: inc.busId || inc.vehicle_id || 'BUS-101',
    tripId: inc.tripId || inc.trip_id || 'TRIP-101',
    affectedPassengers: inc.affectedPassengers !== undefined ? inc.affectedPassengers : (inc.affected_passengers || 35),
    reportedTime: inc.reportedTime || inc.reported_time || '18:14 IST',
    recoveryPlan: normalizedPlan,
  };
}

export function FleetRippleProvider({ children }) {
  const [isBackendConnected, setIsBackendConnected] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [apiError, setApiError] = useState(null);

  // Core records
  const [buses, setBuses] = useState(INITIAL_BUSES);
  const [operators, setOperators] = useState(INITIAL_OPERATORS);
  const [trips, setTrips] = useState(INITIAL_TRIPS);
  const [bookings, setBookings] = useState([...INITIAL_BOOKINGS_BUS101, ...INITIAL_BOOKINGS_TRIP201, ...INITIAL_BOOKINGS_TRIP202]);
  const [incidents, setIncidents] = useState([normalizeIncident(INITIAL_INCIDENT)]);
  const [activeIncidentId, setActiveIncidentId] = useState('INC-2026-081');
  const [proposals, setProposals] = useState([normalizeProposal(INITIAL_CONSOLIDATION_PROPOSAL)]);
  const [activeProposalId, setActiveProposalId] = useState('PROP-2026-402');
  const [auditLogs, setAuditLogs] = useState(INITIAL_AUDIT_LOGS);

  const [underbookingThreshold, setUnderbookingThreshold] = useState(50);
  const [selectedPassengerBookingId, setSelectedPassengerBookingId] = useState('BKG-101-01');
  const [activeTab, setActiveTab] = useState('overview');

  // Fetch all data from backend
  const refreshAllData = useCallback(async () => {
    try {
      const health = await api.health.check();
      if (health.status === 'healthy') {
        setIsBackendConnected(true);
      }

      const [
        remoteVehicles,
        remoteTrips,
        remoteOperators,
        remoteBookings,
        remoteIncidents,
        remoteProposals,
        remoteAudit
      ] = await Promise.all([
        api.vehicles.getAll().catch(() => null),
        api.trips.getAll().catch(() => null),
        api.operators.getAll().catch(() => null),
        api.bookings.getAll().catch(() => null),
        api.incidents.getAll().catch(() => null),
        api.consolidation.getProposals().catch(() => null),
        api.audit.getEvents().catch(() => null),
      ]);

      if (remoteVehicles) setBuses(remoteVehicles.map(normalizeVehicle));
      if (remoteTrips) setTrips(remoteTrips.map(normalizeTrip));
      if (remoteOperators) setOperators(remoteOperators);
      if (remoteBookings) setBookings(remoteBookings);
      if (remoteIncidents && remoteIncidents.length > 0) {
        const normalized = remoteIncidents.map(normalizeIncident);
        setIncidents(normalized);
        if (!normalized.some(i => i.id === activeIncidentId)) {
          setActiveIncidentId(normalized[0].id);
        }
      }
      if (remoteProposals && remoteProposals.length > 0) {
        const normalized = remoteProposals.map(normalizeProposal);
        setProposals(normalized);
        if (!normalized.some(p => p.id === activeProposalId)) {
          setActiveProposalId(normalized[0].id);
        }
      }
      if (remoteAudit && remoteAudit.length > 0) {
        setAuditLogs(remoteAudit);
      }
      setApiError(null);
    } catch (err) {
      console.warn('Backend currently unreachable, using client state cache:', err.message);
      setIsBackendConnected(false);
    }
  }, [activeIncidentId, activeProposalId]);

  // Initial load
  useEffect(() => {
    refreshAllData();
  }, [refreshAllData]);

  // Helper to add audit log
  const addAuditLog = async (type, actor, description, badgeColor = 'blue') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0] + ' IST';
    const newLog = {
      id: `LOG-${Date.now().toString().slice(-4)}`,
      timestamp: timeStr,
      type,
      actor,
      description,
      badgeColor,
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 49)]);
  };

  // Reset Demo to initial pristine state
  const resetDemo = async () => {
    setIsLoading(true);
    try {
      await api.demo.reset();
      await refreshAllData();
      setActiveIncidentId('INC-2026-081');
      setActiveProposalId('PROP-2026-402');
      setSelectedPassengerBookingId('BKG-101-01');
    } catch (e) {
      console.error('Reset demo error:', e);
      // Fallback local reset
      setBuses(INITIAL_BUSES);
      setOperators(INITIAL_OPERATORS);
      setTrips(INITIAL_TRIPS);
      setBookings([...INITIAL_BOOKINGS_BUS101, ...INITIAL_BOOKINGS_TRIP201, ...INITIAL_BOOKINGS_TRIP202]);
      setIncidents([INITIAL_INCIDENT]);
      setActiveIncidentId('INC-2026-081');
      setProposals([INITIAL_CONSOLIDATION_PROPOSAL]);
      setActiveProposalId('PROP-2026-402');
      setAuditLogs(INITIAL_AUDIT_LOGS);
    } finally {
      setIsLoading(false);
    }
  };

  // -------------------------------------------------------------
  // MODULE 1: RIPPLEOPS AI (BREAKDOWN RECOVERY)
  // -------------------------------------------------------------

  const currentIncident = (incidents && incidents.length > 0)
    ? incidents.find((inc) => inc.id === activeIncidentId) || incidents[0]
    : normalizeIncident(INITIAL_INCIDENT);

  const reportBreakdown = async ({ busId, tripId, stage, location, affectedPassengers, description }) => {
    setIsLoading(true);
    try {
      const newInc = await api.incidents.report({
        busId,
        tripId,
        stage,
        location,
        affectedPassengers,
        description,
      });
      await refreshAllData();
      setActiveIncidentId(newInc.id);
      return newInc;
    } catch (err) {
      console.error('Failed to report breakdown:', err);
      alert(err.message || 'Failed to report breakdown on backend.');
    } finally {
      setIsLoading(false);
    }
  };

  const findAlternativeBuses = async (incidentId) => {
    try {
      const res = await api.incidents.discoverAlternatives(incidentId);
      await refreshAllData();
      return res.compatible_candidates || [];
    } catch (err) {
      console.error('Failed to discover alternatives:', err);
      // Local fallback
      return buses.filter((b) => b.id !== currentIncident?.busId && (b.id === 'BUS-102' || b.id === 'BUS-103'));
    }
  };

  const generateRecoveryPlan = async (incidentId) => {
    setIsLoading(true);
    try {
      const res = await api.incidents.generatePlan(incidentId);
      await refreshAllData();
      return res.recoveryPlan;
    } catch (err) {
      console.error('Failed to generate recovery plan:', err);
      alert(err.message || 'Error running recovery optimizer.');
    } finally {
      setIsLoading(false);
    }
  };

  const approveRecoveryPlan = async (incidentId) => {
    setIsLoading(true);
    try {
      const res = await api.incidents.approvePlan(incidentId);
      await refreshAllData();
      return res;
    } catch (err) {
      console.error('Failed to approve recovery plan:', err);
      alert(err.message || 'Failed to approve plan.');
    } finally {
      setIsLoading(false);
    }
  };

  const sendRecoveryOffers = async (incidentId) => {
    setIsLoading(true);
    try {
      const res = await api.incidents.sendOffers(incidentId);
      await refreshAllData();
      return res;
    } catch (err) {
      console.error('Failed to send recovery offers:', err);
      alert(err.message || 'Failed to send offers.');
    } finally {
      setIsLoading(false);
    }
  };

  const respondToRecoveryOffer = async (bookingId, responseType) => {
    try {
      await api.passenger.respondRecovery(bookingId, responseType);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to submit recovery response:', err);
      alert(err.message || 'Error submitting passenger response.');
    }
  };

  const simulateAllRecoveryOffers = async (scenario) => {
    try {
      await api.passenger.simulateRecovery(scenario);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to simulate recovery offers:', err);
      // Optimistic local fallback
      setBookings((prev) =>
        prev.map((b) => {
          if (b.tripId !== 'TRIP-101') return b;
          if (scenario === 'all_accept') return { ...b, status: 'accepted' };
          if (scenario === 'mixed_realistic') {
            if (b.id === 'BKG-101-03') return { ...b, status: 'waiting_alternative' };
            if (b.id === 'BKG-101-09') return { ...b, status: 'refund_requested' };
            return { ...b, status: 'accepted' };
          }
          if (scenario === 'mostly_refund') {
            if (b.passengerCount === 1) return { ...b, status: 'refund_requested' };
            return { ...b, status: 'accepted' };
          }
          return b;
        })
      );
    }
  };

  const reconcileManifest = async (incidentId) => {
    try {
      const res = await api.incidents.reconcile(incidentId);
      await refreshAllData();
      return res;
    } catch (err) {
      console.error('Failed to reconcile manifest:', err);
      alert(err.message || 'Failed to reconcile manifest.');
    }
  };

  const arrangeBackupForWaiting = async (incidentId) => {
    try {
      const res = await api.incidents.arrangeBackup(incidentId);
      await refreshAllData();
      return res;
    } catch (err) {
      console.error('Failed to dispatch backup:', err);
      alert(err.message || 'Failed to dispatch standby relief shuttle.');
    }
  };

  const closeIncident = async (incidentId) => {
    try {
      const res = await api.incidents.resolve(incidentId);
      await refreshAllData();
      return true;
    } catch (err) {
      console.error('Failed to resolve incident:', err);
      alert(err.message || 'Cannot close incident: Unresolved passengers remain.');
      return false;
    }
  };

  // -------------------------------------------------------------
  // MODULE 2: TRIPMERGE GUARDIAN (CROSS-COMPANY CONSOLIDATION)
  // -------------------------------------------------------------

  const currentProposal = (proposals && proposals.length > 0)
    ? proposals.find((p) => p.id === activeProposalId) || proposals[0]
    : normalizeProposal(INITIAL_CONSOLIDATION_PROPOSAL);

  const updateUnderbookingThreshold = (val) => {
    setUnderbookingThreshold(Number(val));
    addAuditLog(
      'CONFIG',
      'Guardian Configuration',
      `Underbooking alert threshold adjusted to ${val}%. Recalculating consolidation eligibility.`,
      'blue'
    );
  };

  const operatorNegotiate = async (proposalId, operatorId, decision, customNotes = '') => {
    try {
      await api.consolidation.negotiate(proposalId, operatorId, decision, customNotes);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to record operator negotiation:', err);
      alert(err.message || 'Failed to submit operator decision.');
    }
  };

  const reviseProposalTerms = async (proposalId, newTransferPayment) => {
    try {
      await api.consolidation.reviseTerms(proposalId, newTransferPayment);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to revise proposal terms:', err);
      alert(err.message || 'Failed to revise commercial terms.');
    }
  };

  const sendConsolidationOffers = async (proposalId) => {
    try {
      await api.consolidation.sendOffers(proposalId);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to send consolidation offers:', err);
      alert(err.message || 'Cannot send consolidation offers.');
    }
  };

  const respondToConsolidationOffer = async (bookingId, decision) => {
    try {
      await api.passenger.respondConsolidation(bookingId, decision);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to respond to consolidation offer:', err);
      alert(err.message || 'Error recording passenger response.');
    }
  };

  const simulateAllConsolidationOffers = async (scenario) => {
    try {
      await api.passenger.simulateConsolidation(scenario);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to simulate consolidation offers:', err);
      // Local optimistic fallback
      setBookings((prev) =>
        prev.map((b) => {
          if (b.tripId !== 'TRIP-201' && b.tripId !== 'TRIP-202') return b;
          if (scenario === 'all_accept') return { ...b, status: 'consolidation_accepted' };
          if (scenario === 'high_accept_90') {
            if (b.id === 'BKG-201-03') return { ...b, status: 'consolidation_refund_requested' };
            return { ...b, status: 'consolidation_accepted' };
          }
          if (scenario === 'low_accept_50_infeasible') {
            if (['BKG-201-01', 'BKG-201-02', 'BKG-201-04', 'BKG-202-01', 'BKG-202-02'].includes(b.id)) {
              return { ...b, status: 'consolidation_refund_requested' };
            }
            return { ...b, status: 'consolidation_accepted' };
          }
          return b;
        })
      );
    }
  };

  const finalizeConsolidation = async (proposalId) => {
    try {
      const res = await api.consolidation.finalize(proposalId);
      await refreshAllData();
      return { success: true };
    } catch (err) {
      console.error('Failed to finalize consolidation:', err);
      return { success: false, reason: err.message || 'Finalization blocked by operational constraints.' };
    }
  };

  const cancelConsolidationProposal = async (proposalId, reason = 'Operator commercial deadlock') => {
    try {
      await api.consolidation.cancel(proposalId, reason);
      await refreshAllData();
    } catch (err) {
      console.error('Failed to cancel consolidation proposal:', err);
      alert(err.message || 'Failed to cancel proposal.');
    }
  };

  const updateVehicleStatus = async (vehicleId, status, isAvailable) => {
    setIsLoading(true);
    try {
      await api.vehicles.updateStatus(vehicleId, status, isAvailable);
      await refreshAllData();
      addAuditLog(
        'VEHICLE',
        'Fleet Operations Directorate',
        `Vehicle ${vehicleId} operational status updated to '${status}' (Available: ${isAvailable ? 'Yes' : 'No'}).`,
        'teal'
      );
      return true;
    } catch (err) {
      console.error('Failed to update vehicle status:', err);
      alert(err.message || 'Failed to update vehicle status on backend.');
      return false;
    } finally {
      setIsLoading(false);
    }
  };

  // Selected Passenger for Portal
  const selectedPassenger = bookings.find((b) => b.id === selectedPassengerBookingId) || bookings[0];

  // Derived Statistics from live database
  const totalBusesCount = buses.length;
  const availableBusesCount = buses.filter((b) => b.isAvailable && b.status !== 'Breakdown').length;
  const activeBreakdownsCount = incidents.filter((i) => i.status !== 'resolved').length;
  const unassignedPassengersCount = bookings.filter(
    (b) => b.tripId === 'TRIP-101' && (b.status === 'unassigned' || b.status === 'waiting_alternative')
  ).reduce((sum, b) => sum + (b.passengerCount || 1), 0);

  const underbookedTripsCount = trips.filter(
    (t) => (t.status && t.status.includes('Underbooked')) || (t.occupancyPercent < underbookingThreshold && t.status !== 'Consolidated (Withdrawn)')
  ).length;

  const pendingOperatorAgreementsCount = proposals.filter((p) => p.status === 'draft' || p.status === 'under_review').length;
  const pendingPassengerResponsesCount = bookings.filter(
    (b) => b.status === 'offered' || b.status === 'consolidation_offered'
  ).length;

  const totalIllustrativeSavings = proposals
    .filter((p) => p.status === 'finalized' || p.status === 'operator_approved' || p.status === 'draft' || p.status === 'passenger_consent_active')
    .reduce((sum, p) => sum + (p.financials?.grossOperatingSavings || 16300), 0);

  return (
    <FleetRippleContext.Provider
      value={{
        isBackendConnected,
        isLoading,
        apiError,
        refreshAllData,
        // Navigation & UI state
        activeTab,
        setActiveTab,
        // Data records
        buses,
        operators,
        trips,
        bookings,
        incidents,
        activeIncidentId,
        setActiveIncidentId,
        currentIncident,
        proposals,
        activeProposalId,
        setActiveProposalId,
        currentProposal,
        auditLogs,
        underbookingThreshold,
        updateUnderbookingThreshold,
        selectedPassengerBookingId,
        setSelectedPassengerBookingId,
        selectedPassenger,
        // System actions
        resetDemo,
        addAuditLog,
        updateVehicleStatus,
        // RippleOps actions
        reportBreakdown,
        findAlternativeBuses,
        generateRecoveryPlan,
        approveRecoveryPlan,
        sendRecoveryOffers,
        respondToRecoveryOffer,
        simulateAllRecoveryOffers,
        reconcileManifest,
        arrangeBackupForWaiting,
        closeIncident,
        // TripMerge actions
        operatorNegotiate,
        reviseProposalTerms,
        sendConsolidationOffers,
        respondToConsolidationOffer,
        simulateAllConsolidationOffers,
        finalizeConsolidation,
        cancelConsolidationProposal,
        // Derived statistics
        totalBusesCount,
        availableBusesCount,
        activeBreakdownsCount,
        unassignedPassengersCount,
        underbookedTripsCount,
        pendingOperatorAgreementsCount,
        pendingPassengerResponsesCount,
        totalIllustrativeSavings,
      }}
    >
      {children}
    </FleetRippleContext.Provider>
  );
}

export function useFleetRipple() {
  const context = useContext(FleetRippleContext);
  if (!context) {
    throw new Error('useFleetRipple must be used within a FleetRippleProvider');
  }
  return context;
}
