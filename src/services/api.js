// Centralized API client for FleetRipple AI

const BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

class ApiError extends Error {
  constructor(message, status, data) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.data = data;
  }
}

async function request(endpoint, options = {}) {
  const url = `${BASE_URL}${endpoint}`;
  const headers = {
    'Content-Type': 'application/json',
    ...(options.headers || {}),
  };

  try {
    const response = await fetch(url, {
      ...options,
      headers,
    });

    if (!response.ok) {
      let errorData;
      try {
        errorData = await response.json();
      } catch (e) {
        errorData = { detail: await response.text() };
      }
      const message = errorData.detail || errorData.message || `Request failed with status ${response.status}`;
      throw new ApiError(message, response.status, errorData);
    }

    return await response.json();
  } catch (err) {
    if (err instanceof ApiError) {
      throw err;
    }
    throw new ApiError(err.message || 'Network error occurred. Backend may be offline.', 0, null);
  }
}

export const api = {
  health: {
    check: () => request('/health'),
  },
  dashboard: {
    getSummary: () => request('/dashboard/summary'),
    getActionQueue: () => request('/dashboard/action-queue'),
  },
  operators: {
    getAll: () => request('/operators'),
  },
  vehicles: {
    getAll: () => request('/vehicles'),
    getById: (id) => request(`/vehicles/${id}`),
    updateStatus: (id, status, isAvailable) =>
      request(`/vehicles/${id}/status`, {
        method: 'PATCH',
        body: JSON.stringify({ status, is_available: isAvailable }),
      }),
  },
  trips: {
    getAll: () => request('/trips'),
    getById: (id) => request(`/trips/${id}`),
  },
  bookings: {
    getAll: (tripId) => request(`/bookings${tripId ? `?trip_id=${tripId}` : ''}`),
    getById: (id) => request(`/bookings/${id}`),
  },
  incidents: {
    getAll: () => request('/incidents'),
    getById: (id) => request(`/incidents/${id}`),
    report: (data) =>
      request('/incidents', {
        method: 'POST',
        body: JSON.stringify({
          vehicle_id: data.busId || data.vehicle_id,
          trip_id: data.tripId || data.trip_id,
          stage: data.stage,
          location: data.location,
          affected_passengers: data.affectedPassengers ? Number(data.affectedPassengers) : undefined,
          description: data.description,
        }),
      }),
    discoverAlternatives: (incidentId) =>
      request(`/incidents/${incidentId}/discover-alternatives`, { method: 'POST' }),
    generatePlan: (incidentId) =>
      request(`/incidents/${incidentId}/generate-plan`, { method: 'POST' }),
    getPlan: (incidentId) => request(`/incidents/${incidentId}/recovery-plan`),
    approvePlan: (incidentId) =>
      request(`/incidents/${incidentId}/approve-plan`, { method: 'POST' }),
    sendOffers: (incidentId) =>
      request(`/incidents/${incidentId}/send-offers`, { method: 'POST' }),
    reconcile: (incidentId) =>
      request(`/incidents/${incidentId}/reconcile`, { method: 'POST' }),
    arrangeBackup: (incidentId) =>
      request(`/incidents/${incidentId}/arrange-backup`, { method: 'POST' }),
    resolve: (incidentId, summary) =>
      request(`/incidents/${incidentId}/resolve`, {
        method: 'POST',
        body: JSON.stringify({ resolution_summary: summary }),
      }),
  },
  consolidation: {
    getOpportunities: (threshold = 50) => request(`/consolidation/opportunities?threshold=${threshold}`),
    getProposals: () => request('/consolidation/proposals'),
    getProposal: (id) => request(`/consolidation/proposals/${id}`),
    negotiate: (proposalId, operatorId, decision, notes = '') =>
      request(`/consolidation/proposals/${proposalId}/respond`, {
        method: 'POST',
        body: JSON.stringify({ operator_id: operatorId, decision, notes }),
      }),
    reviseTerms: (proposalId, transferPayment) =>
      request(`/consolidation/proposals/${proposalId}/revise`, {
        method: 'POST',
        body: JSON.stringify({ transfer_payment: Number(transferPayment) }),
      }),
    sendOffers: (proposalId) =>
      request(`/consolidation/proposals/${proposalId}/send-offers`, { method: 'POST' }),
    finalize: (proposalId) =>
      request(`/consolidation/proposals/${proposalId}/finalize`, { method: 'POST' }),
    cancel: (proposalId, reason) =>
      request(`/consolidation/proposals/${proposalId}/cancel`, {
        method: 'POST',
        body: JSON.stringify({ reason }),
      }),
  },
  passenger: {
    getOffers: () => request('/passenger/offers'),
    respondRecovery: (bookingId, decision, reason) =>
      request('/passenger/respond-recovery', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId, decision, reason }),
      }),
    respondConsolidation: (bookingId, decision) =>
      request('/passenger/respond-consolidation', {
        method: 'POST',
        body: JSON.stringify({ booking_id: bookingId, decision }),
      }),
    simulateRecovery: (scenario) =>
      request('/passenger/simulate-recovery', {
        method: 'POST',
        body: JSON.stringify({ scenario }),
      }),
    simulateConsolidation: (scenario) =>
      request('/passenger/simulate-consolidation', {
        method: 'POST',
        body: JSON.stringify({ scenario }),
      }),
  },
  refunds: {
    getAll: () => request('/refunds'),
  },
  analytics: {
    getOccupancy: () => request('/analytics/occupancy'),
  },
  audit: {
    getEvents: (limit = 50) => request(`/audit-events?limit=${limit}`),
  },
  demo: {
    reset: () => request('/demo/reset', { method: 'POST' }),
  },
};
