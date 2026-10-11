import React from 'react';
import {
  GitMerge,
  Scale,
  CheckCircle2,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

export function ProposalAnalysisCard({ proposal }) {
  if (!proposal) return null;

  const trip1 = proposal.trip1 || {
    id: 'TRIP-201',
    operatorId: 'OP-1',
    operatorName: 'Apex Express',
    busId: 'BUS-201',
    departureTime: '18:00',
    capacity: 40,
    confirmedBookings: 12,
    occupancyPercent: 30.0,
    estCost: 18000,
  };
  const trip2 = proposal.trip2 || {
    id: 'TRIP-202',
    operatorId: 'OP-2',
    operatorName: 'Coastal Cruiser',
    busId: 'BUS-202',
    departureTime: '18:15',
    capacity: 40,
    confirmedBookings: 15,
    occupancyPercent: 37.5,
    estCost: 18500,
  };
  const financials = proposal.financials || {};

  return (
    <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
      {/* Header (Spacious Light Enterprise Style) */}
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
        <div className="flex items-center gap-3.5">
          <div className="w-9 h-9 rounded-lg bg-teal-50 border border-teal-200 text-teal-700 flex items-center justify-center shrink-0">
            <GitMerge className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h3 className="text-base font-bold text-slate-900">
                Consolidation Service Analysis • Proposal {proposal.id}
              </h3>
              <Badge variant="teal" size="sm">
                Demand-Aware
              </Badge>
            </div>
            <p className="text-sm text-slate-500 mt-0.5">
              Corridor: {proposal.route} • Departure Tolerance: 15 mins (18:00 vs 18:15 IST)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2.5">
          <span className="text-xs font-mono bg-white text-slate-600 px-2.5 py-1 rounded-md border border-slate-200 font-semibold">
            Target: {proposal.viabilityThresholdPercent}% Consent
          </span>
          <Badge
            variant={
              proposal.status === 'finalized'
                ? 'emerald'
                : proposal.status === 'operator_approved'
                ? 'teal'
                : proposal.status === 'rejected'
                ? 'rose'
                : 'amber'
            }
            size="sm"
          >
            {proposal.status.replace('_', ' ').toUpperCase()}
          </Badge>
        </div>
      </div>

      {/* Comparison Grid: Trip 1 vs Trip 2 vs Consolidated */}
      <div className="p-5 grid grid-cols-1 md:grid-cols-3 gap-4 border-b border-slate-100 bg-slate-50/30 text-sm">
        {/* Original Trip 1 (Apex) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-base">{trip1.id} (Apex Express)</span>
            <Badge variant="amber" size="sm">
              30.0% Underbooked
            </Badge>
          </div>
          <div className="text-slate-600 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Departure:</span>
              <span className="font-semibold text-slate-900">{trip1.departureTime} IST</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicle Asset:</span>
              <span className="font-mono font-bold text-slate-800">{trip1.busId}</span>
            </div>
            <div className="flex justify-between">
              <span>Confirmed Passengers:</span>
              <span className="font-semibold text-amber-700 font-mono">12 / 40 seats</span>
            </div>
            <div className="flex justify-between">
              <span>Operating Run Cost:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatCurrency(trip1.estCost)}</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-400 font-mono">
            Withdrawn service in merge
          </div>
        </div>

        {/* Original Trip 2 (Coastal) */}
        <div className="p-5 rounded-xl bg-white border border-slate-200/80 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-slate-900 text-base">{trip2.id} (Coastal Cruiser)</span>
            <Badge variant="amber" size="sm">
              37.5% Underbooked
            </Badge>
          </div>
          <div className="text-slate-600 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Departure:</span>
              <span className="font-semibold text-slate-900">{trip2.departureTime} IST</span>
            </div>
            <div className="flex justify-between">
              <span>Vehicle Asset:</span>
              <span className="font-mono font-bold text-slate-800">{trip2.busId}</span>
            </div>
            <div className="flex justify-between">
              <span>Confirmed Passengers:</span>
              <span className="font-semibold text-amber-700 font-mono">15 / 40 seats</span>
            </div>
            <div className="flex justify-between">
              <span>Operating Run Cost:</span>
              <span className="font-semibold text-slate-900 font-mono">{formatCurrency(trip2.estCost)}</span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-slate-100 text-xs text-slate-400 font-mono">
            Host operating coach
          </div>
        </div>

        {/* Proposed Consolidated Service */}
        <div className="p-5 rounded-xl bg-teal-50/50 border border-teal-200 space-y-3">
          <div className="flex items-center justify-between">
            <span className="font-bold text-teal-950 text-base">Consolidated Service</span>
            <Badge variant="teal" size="sm">
              67.5% Target
            </Badge>
          </div>
          <div className="text-teal-900 space-y-1.5 text-sm">
            <div className="flex justify-between">
              <span>Departure:</span>
              <span className="font-semibold text-teal-950">
                {proposal.proposedDepartureTime} IST (+15m Apex)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Operating Coach:</span>
              <span className="font-mono font-bold text-teal-950">
                {proposal.proposedReplacementBusId} (Coastal)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Combined Demand:</span>
              <span className="font-bold text-teal-800 font-mono">
                27 / 40 seats (13 spare)
              </span>
            </div>
            <div className="flex justify-between">
              <span>Consolidated Cost:</span>
              <span className="font-semibold text-teal-950 font-mono">
                {formatCurrency(financials.consolidatedTripCost)}
              </span>
            </div>
          </div>
          <div className="pt-2.5 border-t border-teal-200/80 text-xs font-semibold text-teal-800">
            ✓ 13 spare seats available for walk-ins
          </div>
        </div>
      </div>

      {/* Financial Settlement & Savings Ledger */}
      <div className="p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h4 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
            <Scale className="w-4 h-4 text-teal-600" />
            <span>Commercial Cost Breakdown & Ecosystem Savings</span>
          </h4>
          <span className="text-xs text-slate-400 font-mono">
            Simulated B2B Model
          </span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-semibold text-xs uppercase font-mono block">
              Original Combined Run Cost
            </span>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-1.5 font-mono">
              {formatCurrency(financials.originalCombinedCost)}
            </div>
            <span className="text-xs text-slate-400 font-mono mt-1 block">₹18,000 + ₹18,500</span>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
            <span className="text-slate-400 font-semibold text-xs uppercase font-mono block">
              Consolidated Trip Cost
            </span>
            <div className="text-2xl md:text-3xl font-bold text-slate-900 mt-1.5 font-mono">
              {formatCurrency(financials.consolidatedTripCost)}
            </div>
            <span className="text-xs text-slate-400 mt-1 block">Single vehicle operation</span>
          </div>

          <div className="p-4 rounded-xl bg-emerald-50/60 border border-emerald-200">
            <span className="text-emerald-800 font-semibold text-xs uppercase font-mono block">
              Gross Operating Savings
            </span>
            <div className="text-2xl md:text-3xl font-bold text-emerald-800 mt-1.5 font-mono">
              {formatCurrency(financials.grossOperatingSavings)}
            </div>
            <span className="text-xs text-emerald-700 font-medium mt-1 block">Ecosystem fuel & toll saving</span>
          </div>

          <div className="p-4 rounded-xl bg-teal-50/60 border border-teal-200">
            <span className="text-teal-800 font-semibold text-xs uppercase font-mono block">
              Apex Net Benefit
            </span>
            <div className="text-2xl md:text-3xl font-bold text-teal-800 mt-1.5 font-mono">
              {formatCurrency(financials.apexNetSavings)}
            </div>
            <span className="text-xs text-teal-700 font-medium font-mono mt-1 block">
              After {formatCurrency(financials.apexTransferPayment)} transfer
            </span>
          </div>
        </div>

        {/* Operational Compatibility Checklist */}
        <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm space-y-2">
          <span className="font-bold text-slate-900 block text-xs uppercase tracking-wider">
            Constraint Verification Checklist:
          </span>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-2.5 text-xs md:text-sm text-slate-700">
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>Route Corridor: Identical (NH-16 Vizag ➔ BZA)</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>All Boarding Stops Included</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>15m Departure Window (Within 30m rule)</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
