import React, { useState } from 'react';
import {
  Users,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  RotateCcw,
  Sparkles,
  ShieldAlert,
  ArrowRight,
  TrendingUp,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';

export function PassengerConsentPanel({ proposal, onFinalize }) {
  const {
    bookings,
    respondToConsolidationOffer,
    simulateAllConsolidationOffers,
    setSelectedPassengerBookingId,
    setActiveTab,
  } = useFleetRipple();

  const relevantBookings = bookings.filter(
    (b) => b.tripId === 'TRIP-201' || b.tripId === 'TRIP-202'
  );

  const totalPassengers = 27;
  const acceptedPax = relevantBookings
    .filter((b) => b.status === 'consolidation_accepted')
    .reduce((sum, b) => sum + b.passengerCount, 0);

  const refundPax = relevantBookings
    .filter((b) => b.status === 'consolidation_refund_requested')
    .reduce((sum, b) => sum + b.passengerCount, 0);

  const pendingPax = totalPassengers - acceptedPax - refundPax;

  const acceptanceRate = Number(((acceptedPax / totalPassengers) * 100).toFixed(1));
  const threshold = proposal.viabilityThresholdPercent || 70;
  const isViable = acceptanceRate >= threshold;
  const allAnswered = pendingPax === 0;

  const isFinalized = proposal.status === 'finalized';

  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-xs space-y-0">
      {/* Header */}
      <div className="p-5 md:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div>
          <div className="flex items-center gap-2.5">
            <h3 className="card-title text-slate-900">
              Passenger Consent Ledger & Viability Threshold
            </h3>
            <Badge variant={isFinalized ? 'emerald' : isViable ? 'teal' : 'rose'} size="sm">
              {isFinalized ? 'CONSOLIDATION FINALIZED' : isViable ? 'VIABILITY THRESHOLD MET' : 'THRESHOLD NOT MET'}
            </Badge>
          </div>
          <p className="secondary-text text-slate-500 mt-1">
            Cross-operator consolidation requires passenger agreement with guaranteed refund rights
          </p>
        </div>

        {/* Batch Response Simulator */}
        <div className="flex items-center gap-2.5 flex-wrap">
          <span className="text-xs font-semibold text-slate-500 flex items-center gap-1.5 uppercase tracking-wider">
            <Sparkles className="w-4 h-4 text-indigo-500" />
            <span>Simulate Consent:</span>
          </span>

          <button
            onClick={() => simulateAllConsolidationOffers('all_accept')}
            className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-teal-50 hover:bg-teal-100 text-teal-700 border border-teal-200 font-semibold transition-colors shadow-2xs"
          >
            100% Accept (27)
          </button>

          <button
            onClick={() => simulateAllConsolidationOffers('high_accept_90')}
            className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-emerald-50 hover:bg-emerald-100 text-emerald-700 border border-emerald-200 font-semibold transition-colors shadow-2xs"
          >
            96% Accept (26/1)
          </button>

          <button
            onClick={() => simulateAllConsolidationOffers('low_accept_50_infeasible')}
            className="px-3 py-1.5 text-xs md:text-sm rounded-lg bg-rose-50 hover:bg-rose-100 text-rose-700 border border-rose-200 font-semibold transition-colors shadow-2xs"
          >
            Sub-Threshold 63% (Fail)
          </button>
        </div>
      </div>

      {/* Viability Gauge Bar */}
      <div className="p-5 md:p-6 bg-slate-50/40 border-b border-slate-100 space-y-3.5">
        <div className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <span className="font-semibold text-slate-700">Passenger Acceptance Rate:</span>
            <span
              className={`font-bold text-base ${
                isViable ? 'text-teal-700' : 'text-rose-600'
              }`}
            >
              {acceptanceRate}% ({acceptedPax}/{totalPassengers} passengers)
            </span>
          </div>

          <div className="flex items-center gap-2 text-slate-500 text-sm">
            <span>Minimum Viability Target:</span>
            <span className="font-bold text-slate-800">{threshold}%</span>
          </div>
        </div>

        {/* Progress bar with threshold marker */}
        <div className="relative w-full h-3.5 bg-slate-200 rounded-full overflow-hidden">
          <div
            className={`h-full rounded-full transition-all duration-500 ${
              isViable ? 'bg-teal-500' : 'bg-rose-500'
            }`}
            style={{ width: `${Math.min(100, acceptanceRate)}%` }}
          />
          {/* Threshold indicator line at 70% */}
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-900 z-10"
            style={{ left: `${threshold}%` }}
            title={`Viability Threshold: ${threshold}%`}
          />
        </div>

        {/* Viability Warning or Success Alert */}
        {!isViable && (
          <div className="p-4 rounded-xl bg-rose-50 border border-rose-200 text-rose-800 text-sm flex items-center gap-3">
            <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
            <span>
              <strong>Viability Constraint Triggered:</strong> Passenger acceptance ({acceptanceRate}%) is
              below the required {threshold}% threshold. High refund attrition renders consolidation
              commercially unviable. Finalization is safely blocked.
            </span>
          </div>
        )}

        {isViable && (
          <div className="p-4 rounded-xl bg-teal-50 border border-teal-200 text-teal-800 text-sm flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-teal-600 shrink-0" />
            <span>
              <strong>Viability Condition Satisfied:</strong> {acceptanceRate}% of passengers have
              accepted transfer to BUS-202 (Coastal Cruiser). Replacement vehicle has {40 - acceptedPax} spare
              seats remaining.
            </span>
          </div>
        )}
      </div>

      {/* Passenger Table */}
      <div className="overflow-x-auto max-h-80">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50/90 text-slate-500 font-semibold sticky top-0 border-b border-slate-200">
            <tr>
              <th className="px-5 py-3 text-xs uppercase tracking-wider">Booking / Trip</th>
              <th className="px-5 py-3 text-xs uppercase tracking-wider">Passenger Name</th>
              <th className="px-5 py-3 text-xs uppercase tracking-wider">Seats / Fare</th>
              <th className="px-5 py-3 text-xs uppercase tracking-wider">Original Service</th>
              <th className="px-5 py-3 text-xs uppercase tracking-wider">Consent Decision</th>
              <th className="px-5 py-3 text-xs uppercase tracking-wider text-right">Simulate Passenger</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {relevantBookings.map((b) => {
              const isAccepted = b.status === 'consolidation_accepted';
              const isRefund = b.status === 'consolidation_refund_requested';

              return (
                <tr key={b.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-5 py-3.5">
                    <button
                      onClick={() => {
                        setSelectedPassengerBookingId(b.id);
                        setActiveTab('passenger');
                      }}
                      className="text-teal-700 hover:text-teal-900 hover:underline font-mono font-bold text-sm block"
                      title="Inspect passenger offer in portal"
                    >
                      {b.id}
                    </button>
                    <span className="text-xs text-slate-400 font-mono mt-0.5 block">{b.tripId}</span>
                  </td>

                  <td className="px-5 py-3.5 font-medium text-slate-900">{b.leadPassenger}</td>

                  <td className="px-5 py-3.5">
                    <span className="font-semibold text-slate-800">{b.passengerCount} seat(s)</span>
                    <span className="text-slate-500 ml-1.5 font-medium">₹{b.fare}</span>
                  </td>

                  <td className="px-5 py-3.5">
                    <span className="text-slate-600">
                      {b.tripId === 'TRIP-201' ? 'Apex (18:00)' : 'Coastal (18:15)'}
                    </span>
                  </td>

                  <td className="px-5 py-3.5">
                    <Badge
                      variant={isAccepted ? 'emerald' : isRefund ? 'rose' : 'amber'}
                      size="sm"
                    >
                      {isAccepted
                        ? 'ACCEPTED CONSOLIDATION'
                        : isRefund
                        ? 'REFUND REQUESTED'
                        : 'PENDING CONSENT'}
                    </Badge>
                  </td>

                  <td className="px-5 py-3.5 text-right">
                    <div className="inline-flex items-center gap-2">
                      <button
                        onClick={() => respondToConsolidationOffer(b.id, 'accept')}
                        className={`px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                          isAccepted
                            ? 'bg-teal-600 text-white'
                            : 'bg-teal-50 text-teal-700 hover:bg-teal-100 border border-teal-200'
                        }`}
                      >
                        Accept
                      </button>

                      <button
                        onClick={() => respondToConsolidationOffer(b.id, 'refund')}
                        className={`px-3 py-1 rounded-lg text-xs md:text-sm font-semibold transition-colors ${
                          isRefund
                            ? 'bg-rose-600 text-white'
                            : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                        }`}
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

      {/* Bottom Finalize Section */}
      <div className="p-5 md:p-6 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-600">
          <span className="font-semibold text-slate-800">Pre-Flight Validation: </span>
          Operators agreed: <span className="font-semibold text-teal-700">✓ Apex & Coastal</span> •
          Capacity: <span className="font-semibold text-teal-700">40 seats available</span> •
          Accepted Pax: <span className="font-semibold text-teal-700">{acceptedPax}</span>
        </div>

        <button
          onClick={onFinalize}
          disabled={!isViable || !allAnswered || isFinalized}
          className={`px-6 py-3 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            isFinalized
              ? 'bg-emerald-100 text-emerald-800 border border-emerald-300 cursor-not-allowed'
              : !isViable || !allAnswered
              ? 'bg-slate-200 text-slate-400 cursor-not-allowed'
              : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
          }`}
        >
          {isFinalized ? (
            <>
              <CheckCircle2 className="w-5 h-5 text-emerald-600" />
              <span>Consolidation Formally Executed</span>
            </>
          ) : (
            <>
              <CheckCircle2 className="w-5 h-5" />
              <span>Finalize Cross-Company Consolidation</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
