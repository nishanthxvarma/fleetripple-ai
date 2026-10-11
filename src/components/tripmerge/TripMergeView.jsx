import React, { useState } from 'react';
import {
  GitMerge,
  Scale,
  Percent,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  Bus,
  Clock,
  Banknote,
  Building2,
  Users,
  FileCheck,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';
import { ProposalAnalysisCard } from './ProposalAnalysisCard';
import { OperatorNegotiationPanel } from './OperatorNegotiationPanel';
import { PassengerConsentPanel } from './PassengerConsentPanel';
import { formatCurrency } from '../../utils/formatters';

export function TripMergeView() {
  const {
    currentProposal,
    trips,
    buses,
    underbookingThreshold,
    updateUnderbookingThreshold,
    sendConsolidationOffers,
    finalizeConsolidation,
  } = useFleetRipple();

  const [activeBrokerStage, setActiveBrokerStage] = useState(() => {
    if (currentProposal?.status === 'finalized') return 6;
    const consentStatus = currentProposal?.passengerConsent?.status || currentProposal?.passenger_consent?.status;
    if (consentStatus && consentStatus !== 'idle') return 5;
    const agreements = currentProposal?.operatorAgreements || currentProposal?.operator_agreements || {};
    const op1 = agreements?.['OP-1']?.status === 'accepted';
    const op2 = agreements?.['OP-2']?.status === 'accepted';
    if (op1 && op2) return 4;
    return 2; // Default to Side-by-Side Comparison
  });

  const [finalizeResult, setFinalizeResult] = useState(null);

  const handleSendOffers = () => {
    if (currentProposal?.id) {
      sendConsolidationOffers(currentProposal.id);
      setActiveBrokerStage(5);
    }
  };

  const handleFinalize = async () => {
    if (currentProposal?.id) {
      const res = await finalizeConsolidation(currentProposal.id);
      setFinalizeResult(res);
      if (res?.success) {
        setActiveBrokerStage(6);
      }
    }
  };

  const agreements = currentProposal?.operatorAgreements || currentProposal?.operator_agreements || {};
  const op1Accepted = agreements?.['OP-1']?.status === 'accepted';
  const op2Accepted = agreements?.['OP-2']?.status === 'accepted';
  const bothOperatorsAccepted = Boolean(op1Accepted && op2Accepted);
  const isFinalized = currentProposal?.status === 'finalized';

  const brokerStages = [
    { num: 1, label: 'Trip Selection', icon: Percent },
    { num: 2, label: 'Compatibility', icon: GitMerge },
    { num: 3, label: 'Cost & Savings', icon: Banknote },
    { num: 4, label: 'Operator Approvals', icon: Building2 },
    { num: 5, label: 'Passenger Consent', icon: Users },
    { num: 6, label: 'Final Execution', icon: FileCheck },
  ];

  return (
    <div className="space-y-6">
      {/* 1. BROKERAGE OVERVIEW BAR (Spacious Light Enterprise Header) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs md:text-sm font-bold text-teal-800 bg-teal-50 px-2.5 py-1 rounded-md border border-teal-200">
                {currentProposal?.id}
              </span>
              <span className="text-slate-300">•</span>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                Cross-Operator Consolidation Brokerage
              </h2>
              <Badge
                variant={
                  isFinalized
                    ? 'emerald'
                    : bothOperatorsAccepted
                    ? 'teal'
                    : 'amber'
                }
                size="sm"
              >
                {currentProposal?.status?.replace('_', ' ')?.toUpperCase() || 'DRAFT'}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              Corridor: <strong className="text-slate-900">{currentProposal?.route}</strong> • Departure Window:{' '}
              <span className="font-mono text-slate-700">18:00 - 18:15 IST (15m tolerance)</span> • Underbooking Threshold:{' '}
              <span className="font-semibold text-slate-800">&lt;{underbookingThreshold}%</span>
            </p>
          </div>

          <div className="flex items-center gap-5 text-sm pr-2">
            <div>
              <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Combined Demand</span>
              <span className="font-bold text-slate-900 text-lg md:text-xl">
                {currentProposal?.combinedDemand} / {currentProposal?.replacementCapacity} Seats
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Projected Occupancy</span>
              <span className="font-bold text-teal-700 text-lg md:text-xl">
                {currentProposal?.projectedOccupancyPercent}%
              </span>
            </div>
            <div>
              <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Gross Savings</span>
              <span className="font-bold text-emerald-700 text-lg md:text-xl">
                {formatCurrency(currentProposal?.financials?.grossOperatingSavings)}
              </span>
            </div>
          </div>
        </div>

        {/* GUIDED BROKER STEPPER */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2.5">
            {brokerStages.map((st) => {
              const isActive = activeBrokerStage === st.num;

              return (
                <button
                  key={st.num}
                  onClick={() => setActiveBrokerStage(st.num)}
                  className={`px-3.5 py-2.5 rounded-lg text-sm font-semibold flex items-center gap-2.5 transition-all text-left ${
                    isActive
                      ? 'bg-slate-900 text-white shadow-2xs'
                      : 'bg-slate-50 hover:bg-slate-100 text-slate-600 border border-slate-200/80'
                  }`}
                >
                  <span
                    className={`w-6 h-6 rounded-md flex items-center justify-center text-xs font-mono font-bold shrink-0 ${
                      isActive ? 'bg-teal-500 text-white' : 'bg-slate-200 text-slate-700'
                    }`}
                  >
                    {st.num}
                  </span>
                  <span className="truncate leading-tight text-xs md:text-sm">{st.label}</span>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* STAGE 1: TRIP SELECTION */}
      {activeBrokerStage === 1 && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stage 1: Underbooked Trips Selection on Corridor
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Automated detection identified services operating below the {underbookingThreshold}% threshold
              </p>
            </div>
            <button
              onClick={() => setActiveBrokerStage(2)}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>Compare Selected Services</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 text-sm">
            {trips
              .filter((t) => t.id === 'TRIP-201' || t.id === 'TRIP-202')
              .map((t) => (
                <div key={t.id} className="p-5 rounded-xl border border-slate-200 bg-slate-50/50 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-900 text-base">{t.id} • {t.operatorName}</span>
                    <Badge variant="amber" size="sm">
                      {t.occupancyPercent}% Occupancy
                    </Badge>
                  </div>
                  <div className="space-y-1.5 text-slate-600 text-sm">
                    <div className="flex justify-between">
                      <span>Departure Time:</span>
                      <span className="font-semibold text-slate-900">{t.departureTime} IST</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Confirmed Passengers:</span>
                      <span className="font-semibold text-amber-700">{t.confirmedBookings} of {t.capacity} seats</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Operating Cost:</span>
                      <span className="font-semibold text-slate-900">{formatCurrency(t.estCost || t.estOperatingCost || t.est_operating_cost)}</span>
                    </div>
                  </div>
                </div>
              ))}
          </div>
        </div>
      )}

      {/* STAGE 2: COMPATIBILITY & COMPARISON */}
      {activeBrokerStage === 2 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 2: Side-by-Side Service Comparison & Route Schedule Check
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (TRIP-201 12 pax + TRIP-202 15 pax = 27 combined demand on 40-seat coach)
              </span>
            </div>
            <button
              onClick={() => setActiveBrokerStage(3)}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>View Commercial Financials</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ProposalAnalysisCard proposal={currentProposal} />
        </div>
      )}

      {/* STAGE 3: COST & SAVINGS */}
      {activeBrokerStage === 3 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 3: Operating Costs & Potential Savings Calculation
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (Original Combined: ₹36,500 vs Consolidated: ₹20,200 = Gross Savings: ₹16,300)
              </span>
            </div>
            <button
              onClick={() => setActiveBrokerStage(4)}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>Open Operator Approvals</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ProposalAnalysisCard proposal={currentProposal} />
        </div>
      )}

      {/* STAGE 4: OPERATOR APPROVALS */}
      {activeBrokerStage === 4 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 4: Operator Approvals & Bilateral Terms Desk
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (Both operators must affirmatively accept terms before passenger offers can be dispatched)
              </span>
            </div>
            {bothOperatorsAccepted && (
              <button
                onClick={handleSendOffers}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
              >
                <span>Dispatch Passenger Offers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>

          <OperatorNegotiationPanel
            proposal={currentProposal}
            onSendOffers={handleSendOffers}
          />
        </div>
      )}

      {/* STAGE 5: PASSENGER CONSENT */}
      {activeBrokerStage === 5 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 5: Passenger Consent Tracking & 70% Viability Threshold Check
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (Consolidation requires affirmative passenger consent with guaranteed refund rights)
              </span>
            </div>
            <button
              onClick={handleFinalize}
              disabled={isFinalized}
              className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 transition-colors ${
                isFinalized
                  ? 'bg-emerald-50 text-emerald-800 border border-emerald-300'
                  : 'bg-teal-600 hover:bg-teal-700 text-white shadow-2xs'
              }`}
            >
              <span>{isFinalized ? 'Consolidation Confirmed' : 'Confirm Consolidation'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <PassengerConsentPanel
            proposal={currentProposal}
            onFinalize={handleFinalize}
          />
        </div>
      )}

      {/* STAGE 6: FINAL EXECUTION */}
      {activeBrokerStage === 6 && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <div className="flex items-center gap-2">
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <h3 className="text-base font-bold text-slate-900">
                  Stage 6: Final Consolidation Confirmation & Schedule Execution
                </h3>
              </div>
              <p className="text-sm text-slate-500 mt-0.5">
                Schedules updated, bus released to standby pool, and commercial settlement posted to audit ledger
              </p>
            </div>
            <Badge variant="emerald" size="sm">SERVICE CONSOLIDATED</Badge>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 md:p-5 rounded-xl bg-slate-50 border border-slate-200 space-y-1.5">
              <span className="text-slate-400 font-mono text-xs font-semibold uppercase">OPERATIONAL OUTCOME</span>
              <div className="font-bold text-slate-900 text-base">TRIP-201 Withdrawn</div>
              <p className="text-slate-600">Bus BUS-201 released back into operator standby pool.</p>
            </div>

            <div className="p-4 md:p-5 rounded-xl bg-teal-50 border border-teal-200 text-teal-900 space-y-1.5">
              <span className="text-teal-700 font-mono text-xs font-semibold uppercase">HOST SERVICE (TRIP-202)</span>
              <div className="font-bold text-teal-950 text-base">Active Consolidated Service</div>
              <p className="text-teal-800">Departing 18:15 IST • 27 Confirmed Bookings (67.5% occupancy).</p>
            </div>

            <div className="p-4 md:p-5 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 space-y-1.5">
              <span className="text-emerald-700 font-mono text-xs font-semibold uppercase">COMMERCIAL SETTLEMENT</span>
              <div className="font-bold text-emerald-950 text-base">₹16,300 Ecosystem Savings</div>
              <p className="text-emerald-800">Apex net +₹11,200 • Coastal margin +₹4,300 • Broker fee ₹800.</p>
            </div>
          </div>
        </div>
      )}

      {/* Validation Notification Banner if finalized or blocked */}
      {finalizeResult && (
        <div
          className={`p-3.5 rounded-lg border text-xs flex items-center justify-between ${
            finalizeResult.success
              ? 'bg-emerald-50 border-emerald-200 text-emerald-900'
              : 'bg-rose-50 border-rose-200 text-rose-900'
          }`}
        >
          <div className="flex items-center gap-2">
            {finalizeResult.success ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-rose-600 shrink-0" />
            )}
            <div>
              <h4 className="font-bold text-sm">
                {finalizeResult.success
                  ? 'Consolidation Successfully Finalized & Executed!'
                  : 'Consolidation Blocked by Invariant Check'}
              </h4>
              <p className="mt-0.5">
                {finalizeResult.success
                  ? 'TRIP-201 withdrawn. TRIP-202 confirmed with combined passenger manifest. Bus BUS-201 released for backup.'
                  : finalizeResult.reason}
              </p>
            </div>
          </div>

          <button
            onClick={() => setFinalizeResult(null)}
            className="text-xs font-semibold px-2.5 py-1 rounded bg-white border border-slate-200 text-slate-700 hover:bg-slate-50"
          >
            Dismiss
          </button>
        </div>
      )}
    </div>
  );
}
