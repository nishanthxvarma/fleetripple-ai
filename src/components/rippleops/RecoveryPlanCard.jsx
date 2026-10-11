import React from 'react';
import {
  CheckCircle2,
  Send,
  Users,
  ShieldCheck,
  AlertCircle,
  Clock,
  Sparkles,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

export function RecoveryPlanCard({ plan, onSendOffers, offersSent }) {
  if (!plan) return null;

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      {/* Header */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900">
                Optimized Passenger Recovery Plan
              </h3>
              <span className="text-xs font-mono font-bold bg-slate-100 text-slate-600 border border-slate-200 px-2 py-0.5 rounded">
                OR-Tools Active
              </span>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Constraint-optimized seat reallocation for Incident {plan.incidentId} • Generated at {plan.createdAt || '18:15 IST'}
            </p>
          </div>
        </div>

        <Badge
          variant={plan.isFeasible ? 'emerald' : 'amber'}
          size="sm"
        >
          {plan.feasibilityStatus}
        </Badge>
      </div>

      {/* Metrics Row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-50/40 border-b border-slate-100 text-sm">
        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs block">
            Seat Reallocation
          </span>
          <div className="mt-1.5 flex items-baseline gap-2">
            <span className="text-2xl font-bold text-slate-900">{plan.totalAssigned}</span>
            <span className="text-slate-500 text-sm">/ {plan.totalAffected} assigned</span>
          </div>
          <span className="text-xs font-semibold text-emerald-700 block mt-1">
            {plan.totalUnassigned === 0 ? '✓ 100% Demand Covered' : `⚠ ${plan.totalUnassigned} unassigned`}
          </span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs block">
            Route Compatibility
          </span>
          <div className="mt-1.5 text-lg font-bold text-slate-900">100% Validated</div>
          <span className="text-xs text-slate-500 block mt-1">BUS-104 excluded by rule</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs block">
            Est. Arrival Window
          </span>
          <div className="mt-1.5 text-lg font-bold text-slate-900">{plan.estAdditionalWaitingTime}</div>
          <span className="text-xs text-slate-500 block mt-1">Arrival at Anakapalle bay</span>
        </div>

        <div className="p-4 bg-white rounded-xl border border-slate-200/80">
          <span className="text-slate-400 font-semibold uppercase tracking-wider text-xs block">
            Est. Transfer Cost
          </span>
          <div className="mt-1.5 text-lg font-bold text-slate-900">{formatCurrency(plan.estTransferCost)}</div>
          <span className="text-xs text-slate-400 font-mono block mt-1">Illustrative estimate</span>
        </div>
      </div>

      {/* Allocation breakdown */}
      <div className="p-5 space-y-4">
        <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider">
          Multi-Vehicle Seat Allocation
        </h4>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
          {plan.assignments.map((alloc) => (
            <div
              key={alloc.busId}
              className="p-4 md:p-5 rounded-xl border border-slate-200 bg-white hover:border-slate-300 transition-all shadow-2xs space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-lg bg-teal-50 text-teal-800 border border-teal-200 flex items-center justify-center font-bold font-mono text-sm">
                    {alloc.busId.replace('BUS-', '')}
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 text-base">{alloc.busId}</span>
                    <span className="text-slate-500 ml-2 font-normal text-sm">({alloc.operatorName})</span>
                  </div>
                </div>
                <Badge variant="teal" size="sm">
                  <Users className="w-3.5 h-3.5" />
                  <span>{alloc.allocatedSeats} seats allocated</span>
                </Badge>
              </div>

              <div className="space-y-1.5 text-slate-600 text-sm">
                <div className="flex justify-between">
                  <span>Available Seats on Coach:</span>
                  <span className="font-semibold text-slate-900">{alloc.availableCapacity} seats</span>
                </div>
                <div className="flex justify-between">
                  <span>Simulated Arrival ETA:</span>
                  <span className="font-semibold text-slate-900">+{alloc.etaMinutes} minutes</span>
                </div>
                <div className="flex justify-between">
                  <span>Boarding Transfer Point:</span>
                  <span className="font-semibold text-slate-900 text-right">{alloc.pickupPoint}</span>
                </div>
              </div>

              <div className="p-2.5 rounded-lg bg-slate-50 text-xs text-slate-700 border border-slate-200/80 leading-relaxed">
                {alloc.note}
              </div>
            </div>
          ))}
        </div>

        {/* Excluded Candidate Vehicle Reason */}
        {plan.excludedBuses?.length > 0 && (
          <div className="p-4 rounded-xl bg-rose-50/40 border border-rose-200 text-sm">
            <div className="flex items-center gap-2 text-rose-800 font-bold mb-1">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>
                Excluded Nearby Candidate: {plan.excludedBuses[0].busId} ({plan.excludedBuses[0].operatorName})
              </span>
            </div>
            <p className="text-rose-700 text-xs md:text-sm leading-relaxed pl-6">
              {plan.excludedBuses[0].reason}
            </p>
          </div>
        )}
      </div>

      {/* Footer Action */}
      <div className="p-5 bg-slate-50/80 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-600 flex items-center gap-2">
          <Sparkles className="w-4 h-4 text-teal-600" />
          <span>
            {offersSent
              ? 'Individualized offers delivered to passengers. Responses are syncing in real time.'
              : 'Action: Dispatch individualized recovery offers to all 35 stranded passengers.'}
          </span>
        </div>

        <button
          onClick={onSendOffers}
          disabled={offersSent}
          className={`px-4 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2 transition-all ${
            offersSent
              ? 'bg-emerald-50 text-emerald-800 cursor-not-allowed border border-emerald-300'
              : 'bg-slate-900 hover:bg-slate-800 text-white shadow-2xs'
          }`}
        >
          {offersSent ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Offers Dispatched to 35 Passengers</span>
            </>
          ) : (
            <>
              <Send className="w-4 h-4 text-teal-400" />
              <span>Send Passenger Offers (35 Passengers)</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
}
