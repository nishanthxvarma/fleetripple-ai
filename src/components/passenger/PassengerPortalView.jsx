import React, { useState } from 'react';
import {
  MessageSquareCheck,
  Search,
  Filter,
  CheckCircle2,
  XCircle,
  Clock,
  RotateCcw,
  Sparkles,
  ArrowRight,
  User,
  ShieldCheck,
  Banknote,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export function PassengerPortalView() {
  const {
    bookings,
    respondToRecoveryOffer,
    respondToConsolidationOffer,
    simulateAllRecoveryOffers,
    simulateConsolidationOffers,
  } = useFleetRipple();

  const [searchTerm, setSearchTerm] = useState('');
  const [workflowFilter, setWorkflowFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [selectedBookingForAction, setSelectedBookingForAction] = useState(null);

  // Grouped counts
  const totalBookings = bookings?.length || 0;
  const acceptedBookings = bookings?.filter(
    (b) => b.status === 'accepted' || b.status === 'consolidation_accepted'
  ) || [];
  const waitingBookings = bookings?.filter(
    (b) => b.status === 'waiting_alternative'
  ) || [];
  const refundBookings = bookings?.filter(
    (b) => b.status === 'refund_requested' || b.status === 'consolidation_refund_requested'
  ) || [];
  const pendingBookings = bookings?.filter(
    (b) => b.status === 'unassigned' || b.status === 'consolidation_offered' || b.status === 'confirmed'
  ) || [];

  // Filtered list
  const filteredBookings = (bookings || []).filter((b) => {
    const q = searchTerm.toLowerCase();
    const id = (b.id || '').toLowerCase();
    const name = (b.leadPassenger || b.lead_passenger || '').toLowerCase();
    const trip = (b.tripId || b.trip_id || '').toLowerCase();
    const matchesSearch = id.includes(q) || name.includes(q) || trip.includes(q);

    let matchesWorkflow = true;
    if (workflowFilter === 'BREAKDOWN') {
      matchesWorkflow = b.tripId === 'TRIP-101';
    } else if (workflowFilter === 'CONSOLIDATION') {
      matchesWorkflow = b.tripId === 'TRIP-201' || b.tripId === 'TRIP-202';
    }

    let matchesStatus = true;
    const st = b.status || '';
    if (statusFilter === 'ACCEPTED') {
      matchesStatus = st.includes('accepted');
    } else if (statusFilter === 'WAITING') {
      matchesStatus = st === 'waiting_alternative';
    } else if (statusFilter === 'REFUND') {
      matchesStatus = st.includes('refund');
    } else if (statusFilter === 'PENDING') {
      matchesStatus = st === 'unassigned' || st === 'consolidation_offered' || st === 'confirmed';
    }

    return matchesSearch && matchesWorkflow && matchesStatus;
  });

  const handleRecordDecision = (bookingId, decision) => {
    const booking = bookings.find((b) => b.id === bookingId);
    if (!booking) return;

    if (booking.tripId === 'TRIP-101') {
      respondToRecoveryOffer(bookingId, decision);
    } else {
      // Consolidation accepts 'accept' or 'refund'
      respondToConsolidationOffer(bookingId, decision === 'refund' ? 'refund' : 'accept');
    }
  };

  return (
    <div className="space-y-6">
      {/* 1. TOP METRICS STRIP (Spacious prominent cards) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Total Offers Dispatched
            </span>
            <MessageSquareCheck className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {totalBookings}
            </span>
            <span className="text-xs font-medium text-slate-500">
              Passenger Bookings
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            18 Breakdown • 13 Consolidation
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Accepted & Reallocated
            </span>
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-emerald-700 tracking-tight">
              {acceptedBookings.length}
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              {totalBookings > 0 ? `${Math.round((acceptedBookings.length / totalBookings) * 100)}%` : '0%'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            Alternative bus seats confirmed
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Waiting for Alternative
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-amber-700 tracking-tight">
              {waitingBookings.length}
            </span>
            <span className="text-xs font-medium text-slate-500">
              {waitingBookings.length > 0 ? 'Relief shuttle needed' : 'None waiting'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            {waitingBookings.length > 0 ? 'Assigned to Standby BUS-STBY-01' : 'Zero unassigned passengers'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Refund Requests
            </span>
            <RotateCcw className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-rose-700 tracking-tight">
              {refundBookings.length}
            </span>
            <span className="text-xs font-semibold text-rose-800 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              100% Refundable
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            Recorded in platform refund ledger
          </p>
        </div>
      </div>

      {/* 2. TABLE TOOLBAR (Search & Filters) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Passenger Offer & Response Ledger
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Live tracking of individual passenger choices, assigned replacement seats, and resolution actions
            </p>
          </div>

          <span className="text-xs font-mono text-slate-500 font-medium">
            Showing {filteredBookings.length} of {totalBookings} records
          </span>
        </div>

        <div className="flex flex-wrap items-center gap-3.5 pt-3 border-t border-slate-100 text-sm">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Booking ID, Passenger Name, or Trip..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600 text-sm"
            />
          </div>

          {/* Workflow Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Workflow:</span>
            <select
              value={workflowFilter}
              onChange={(e) => setWorkflowFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 text-sm font-medium"
            >
              <option value="ALL">All Workflows</option>
              <option value="BREAKDOWN">Breakdown Recovery (TRIP-101)</option>
              <option value="CONSOLIDATION">TripMerge (TRIP-201 / TRIP-202)</option>
            </select>
          </div>

          {/* Response Status Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Status:</span>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 text-sm font-medium"
            >
              <option value="ALL">All Statuses</option>
              <option value="ACCEPTED">Accepted</option>
              <option value="WAITING">Waiting Alternative</option>
              <option value="REFUND">Refund Requested</option>
              <option value="PENDING">Pending Response</option>
            </select>
          </div>
        </div>
      </div>

      {/* 3. STRUCTURED DATA TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Booking ID & Passenger</th>
                <th className="px-5 py-3.5">Original Service</th>
                <th className="px-5 py-3.5">Proposed Replacement</th>
                <th className="px-5 py-3.5">Passenger Outcome</th>
                <th className="px-5 py-3.5">Operational Action Required</th>
                <th className="px-5 py-3.5 text-right">Simulate Choice</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredBookings.map((b) => {
                const isBreakdown = b.tripId === 'TRIP-101';
                const st = b.status || '';
                const isAccepted = st.includes('accepted');
                const isWaiting = st === 'waiting_alternative';
                const isRefund = st.includes('refund');

                // Determine replacement coach
                let replacementCoach = isBreakdown ? 'BUS-102 / BUS-103' : 'BUS-202';
                if (isBreakdown) {
                  const num = parseInt(b.id.split('-').pop() || '1', 10);
                  replacementCoach = num <= 8 ? 'BUS-102 (Coastal)' : 'BUS-103 (Southern)';
                }

                return (
                  <tr key={b.id} className="hover:bg-slate-50/50 transition-colors">
                    {/* Booking ID & Passenger */}
                    <td className="px-5 py-4">
                      <div className="font-mono font-bold text-slate-900 text-base">{b.id}</div>
                      <div className="text-sm text-slate-700 font-medium mt-0.5">
                        {b.leadPassenger || b.lead_passenger}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {b.passengerCount || b.passenger_count || 1} seat(s) • {b.phone || '+91 98480 XXXXX'}
                      </div>
                    </td>

                    {/* Original Service */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-sm">
                        {b.tripId || b.trip_id}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {b.boardingPoint || 'Visakhapatnam'} ➔ {b.destination || 'Vijayawada'}
                      </div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        Seat: {(b.seatNumbers || []).join(', ') || 'Assigned'}
                      </div>
                    </td>

                    {/* Proposed Replacement */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-teal-800 text-sm">
                        {replacementCoach}
                      </div>
                      <div className="text-xs text-slate-500 mt-0.5">
                        {isBreakdown ? 'Transfer at Anakapalle' : 'Depart 18:15 IST'}
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">
                        Fare Protected (No Extra Cost)
                      </div>
                    </td>

                    {/* Passenger Outcome */}
                    <td className="px-5 py-4">
                      {isAccepted ? (
                        <Badge variant="emerald" size="sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Accepted Alternative</span>
                        </Badge>
                      ) : isWaiting ? (
                        <Badge variant="amber" size="sm">
                          <Clock className="w-3.5 h-3.5" />
                          <span>Waiting for Later Coach</span>
                        </Badge>
                      ) : isRefund ? (
                        <Badge variant="rose" size="sm">
                          <RotateCcw className="w-3.5 h-3.5" />
                          <span>Refund Requested</span>
                        </Badge>
                      ) : (
                        <Badge variant="slate" size="sm">
                          <span>Offer Dispatched</span>
                        </Badge>
                      )}
                    </td>

                    {/* Operational Action Required */}
                    <td className="px-5 py-4 text-xs md:text-sm">
                      {isAccepted ? (
                        <span className="text-emerald-700 font-semibold flex items-center gap-1.5">
                          ✓ Transfer Boarding Pass Issued
                        </span>
                      ) : isWaiting ? (
                        <span className="text-amber-700 font-semibold flex items-center gap-1.5">
                          ⚠ Standby Relief Shuttle Assigned
                        </span>
                      ) : isRefund ? (
                        <span className="text-rose-700 font-semibold flex items-center gap-1.5">
                          ₹ Full Refund Processed
                        </span>
                      ) : (
                        <span className="text-slate-500 italic">
                          Awaiting passenger response
                        </span>
                      )}
                    </td>

                    {/* Action buttons */}
                    <td className="px-5 py-4 text-right">
                      <div className="inline-flex items-center gap-1.5">
                        <button
                          onClick={() => handleRecordDecision(b.id, 'accept')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isAccepted
                              ? 'bg-emerald-100 text-emerald-800 cursor-default'
                              : 'bg-white hover:bg-emerald-50 text-emerald-700 border border-emerald-200'
                          }`}
                          title="Record Acceptance"
                        >
                          Accept
                        </button>
                        <button
                          onClick={() => handleRecordDecision(b.id, 'wait')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isWaiting
                              ? 'bg-amber-100 text-amber-800 cursor-default'
                              : 'bg-white hover:bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                          title="Record Waiting on Relief Bus"
                        >
                          Wait
                        </button>
                        <button
                          onClick={() => handleRecordDecision(b.id, 'refund')}
                          className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                            isRefund
                              ? 'bg-rose-100 text-rose-800 cursor-default'
                              : 'bg-white hover:bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                          title="Record Refund Request"
                        >
                          Refund
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* 4. SIMULATION SCENARIO BAR */}
        <div className="p-4 md:p-5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4 text-sm">
          <div className="flex items-center gap-2 text-slate-600">
            <Sparkles className="w-4 h-4 text-teal-600" />
            <span className="font-semibold text-slate-800">Demonstration Batch Runners:</span>
            <span className="text-slate-500 hidden md:inline">
              Simulate bulk passenger reactions across the corridor
            </span>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => {
                simulateAllRecoveryOffers('all_accept');
                simulateConsolidationOffers('all_accept');
              }}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-teal-50 border border-slate-200 text-teal-800 font-semibold transition-colors shadow-2xs text-xs md:text-sm"
            >
              Simulate: All Accept
            </button>
            <button
              onClick={() => {
                simulateAllRecoveryOffers('mixed_realistic');
                simulateConsolidationOffers('high_accept_90');
              }}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-amber-50 border border-slate-200 text-amber-800 font-semibold transition-colors shadow-2xs text-xs md:text-sm"
            >
              Simulate: Realistic Mixed
            </button>
            <button
              onClick={() => {
                simulateAllRecoveryOffers('mostly_refund');
              }}
              className="px-3.5 py-2 rounded-lg bg-white hover:bg-rose-50 border border-slate-200 text-rose-800 font-semibold transition-colors shadow-2xs text-xs md:text-sm"
            >
              Simulate: Refund Heavy
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
