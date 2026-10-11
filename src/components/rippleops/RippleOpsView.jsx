import React, { useState } from 'react';
import {
  ShieldAlert,
  Plus,
  Bus,
  MapPin,
  Clock,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  ArrowLeft,
  Users,
  Compass,
  FileText,
  Send,
  FileCheck,
  ChevronRight,
  Sparkles,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';
import { ReportBreakdownModal } from './ReportBreakdownModal';
import { CandidateBusesTable } from './CandidateBusesTable';
import { RecoveryPlanCard } from './RecoveryPlanCard';
import { ManifestReconciliationTable } from './ManifestReconciliationTable';

export function RippleOpsView() {
  const {
    currentIncident,
    buses,
    generateRecoveryPlan,
    sendRecoveryOffers,
    bookings,
  } = useFleetRipple();

  const [activeStage, setActiveStage] = useState(() => {
    if (currentIncident?.status === 'resolved' || currentIncident?.status === 'reconciled') return 5;
    if (currentIncident?.status === 'offers_sent') return 4;
    if (currentIncident?.recoveryPlan) return 3;
    return 2; // Default to Discovery & Screening
  });

  const [isReportModalOpen, setIsReportModalOpen] = useState(false);

  const candidates = buses.filter(
    (b) => b.id === 'BUS-102' || b.id === 'BUS-103' || b.id === 'BUS-104'
  );

  const handleGeneratePlan = () => {
    generateRecoveryPlan(currentIncident.id);
    setActiveStage(3);
  };

  const handleSendOffers = () => {
    sendRecoveryOffers(currentIncident.id);
    setActiveStage(4);
  };

  const stageStatus = currentIncident?.status || 'reported';
  const hasPlan = Boolean(currentIncident?.recoveryPlan);
  const offersSent =
    stageStatus === 'offers_sent' || stageStatus === 'reconciled' || stageStatus === 'resolved';

  const stages = [
    { num: 1, label: 'Incident Details', icon: ShieldAlert, ready: true },
    { num: 2, label: 'Replacement Discovery', icon: Compass, ready: true },
    { num: 3, label: 'Recovery Plan', icon: Users, ready: hasPlan },
    { num: 4, label: 'Passenger Consent', icon: Send, ready: offersSent },
    { num: 5, label: 'Final Reconciliation', icon: FileCheck, ready: offersSent },
  ];

  // Derived counts for incident status
  const incBookings = bookings.filter((b) => b.tripId === 'TRIP-101');
  const acceptedCount = incBookings
    .filter((b) => b.status === 'accepted')
    .reduce((sum, b) => sum + b.passengerCount, 0);
  const waitingCount = incBookings
    .filter((b) => b.status === 'waiting_alternative')
    .reduce((sum, b) => sum + b.passengerCount, 0);

  return (
    <div className="space-y-6">
      {/* 1. INCIDENT HEADER & METRICS BAR (Spacious, prominent enterprise style) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-5">
        <div className="flex flex-wrap items-center justify-between gap-5">
          <div className="space-y-1.5">
            <div className="flex items-center gap-2.5 flex-wrap">
              <span className="font-mono text-xs md:text-sm font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-md border border-rose-200">
                {currentIncident?.id}
              </span>
              <span className="text-slate-300">•</span>
              <h2 className="text-lg md:text-xl font-bold text-slate-900 tracking-tight">
                {currentIncident?.busId} ({currentIncident?.route})
              </h2>
              <Badge
                variant={
                  stageStatus === 'resolved'
                    ? 'emerald'
                    : stageStatus === 'reconciled'
                    ? 'teal'
                    : 'rose'
                }
                size="sm"
              >
                {stageStatus.toUpperCase()}
              </Badge>
            </div>
            <p className="text-sm text-slate-600">
              Breakdown at <strong className="text-slate-900">{currentIncident?.location}</strong> •{' '}
              Stage: <span className="font-semibold text-slate-800">{currentIncident?.stage}</span> • Reported at{' '}
              <span className="font-mono text-slate-600">{currentIncident?.reportedTime}</span>
            </p>
          </div>

          <div className="flex items-center gap-4">
            {/* Quick Metrics */}
            <div className="flex items-center gap-5 text-sm pr-4 border-r border-slate-200">
              <div>
                <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Stranded</span>
                <span className="font-bold text-rose-700 text-lg md:text-xl">
                  {currentIncident?.affectedPassengers} Pax
                </span>
              </div>
              <div>
                <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Reassigned</span>
                <span className="font-bold text-teal-700 text-lg md:text-xl">{acceptedCount} Pax</span>
              </div>
              {waitingCount > 0 && (
                <div>
                  <span className="text-slate-400 block text-xs uppercase font-mono font-semibold">Waiting</span>
                  <span className="font-bold text-amber-700 text-lg md:text-xl">{waitingCount} Pax</span>
                </div>
              )}
            </div>

            <button
              onClick={() => setIsReportModalOpen(true)}
              className="px-4 py-2 rounded-lg bg-white hover:bg-slate-50 text-slate-700 text-sm font-semibold flex items-center gap-2 border border-slate-200 transition-colors shadow-2xs"
            >
              <Plus className="w-4 h-4 text-slate-500" />
              <span>Report Breakdown</span>
            </button>
          </div>
        </div>

        {/* GUIDED STAGE STEPPER */}
        <div className="pt-4 border-t border-slate-100">
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2.5">
            {stages.map((st) => {
              const isActive = activeStage === st.num;

              return (
                <button
                  key={st.num}
                  onClick={() => setActiveStage(st.num)}
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

      {/* STAGE 1: INCIDENT DETAILS & MECHANICAL DIAGNOSTICS */}
      {activeStage === 1 && (
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Stage 1: Incident Telemetry & Diagnostic Report
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Logged by driver and corridor telemetry monitoring systems
              </p>
            </div>
            <button
              onClick={() => setActiveStage(2)}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>Screen Alternative Coaches</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-slate-400 text-xs font-mono font-semibold uppercase">Vehicle Asset</span>
              <div className="font-bold text-slate-900 text-base">
                {currentIncident?.busId} (Volvo 9600)
              </div>
              <p className="text-slate-600">Operator: Apex Express • Reg: AP 31 TX 4010</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-slate-400 text-xs font-mono font-semibold uppercase">Incident Location</span>
              <div className="font-bold text-slate-900 text-base">{currentIncident?.location}</div>
              <p className="text-slate-600">Corridor: NH-16 Km 34 Southbound</p>
            </div>

            <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 space-y-1.5">
              <span className="text-slate-400 text-xs font-mono font-semibold uppercase">Impact Assessment</span>
              <div className="font-bold text-rose-700 text-base">
                {currentIncident?.affectedPassengers} Stranded Passengers
              </div>
              <p className="text-slate-600">Passengers sheltered at toll rest bay.</p>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-50 border border-slate-200/80 text-sm space-y-2">
            <span className="font-bold text-slate-900 block">Mechanical Diagnostic Summary:</span>
            <p className="text-slate-700 leading-relaxed font-mono text-xs md:text-sm">
              {currentIncident?.description}
            </p>
          </div>
        </div>
      )}

      {/* STAGE 2: REPLACEMENT BUS DISCOVERY */}
      {activeStage === 2 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 2: Replacement Coach Screening & Route Compatibility Check
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (Google OR-Tools rules exclude divergent buses like BUS-104)
              </span>
            </div>
            <button
              onClick={handleGeneratePlan}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>Generate Recovery Plan</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <CandidateBusesTable
            candidates={candidates}
            onGeneratePlan={handleGeneratePlan}
            isPlanGenerated={hasPlan}
          />
        </div>
      )}

      {/* STAGE 3: RECOVERY PLAN OPTIMIZATION */}
      {activeStage === 3 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 3: Optimized Passenger Redistribution & Capacity Allocation
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (15 pax to BUS-102, 20 pax to BUS-103)
              </span>
            </div>
            <div className="flex items-center gap-2.5">
              <button
                onClick={() => setActiveStage(2)}
                className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
              >
                Back to Discovery
              </button>
              <button
                onClick={handleSendOffers}
                className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
              >
                <span>Dispatch Passenger Offers</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>

          <RecoveryPlanCard
            plan={currentIncident.recoveryPlan}
            onSendOffers={handleSendOffers}
            offersSent={offersSent}
          />
        </div>
      )}

      {/* STAGE 4: PASSENGER CONSENT */}
      {activeStage === 4 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 4: Passenger Response Tracking & Operational Ledger
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (Track acceptances, waitlist, and refund requests in real-time)
              </span>
            </div>
            <button
              onClick={() => setActiveStage(5)}
              className="px-4 py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shadow-2xs"
            >
              <span>Reconcile Manifest</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>

          <ManifestReconciliationTable incidentId={currentIncident.id} />
        </div>
      )}

      {/* STAGE 5: FINAL RECONCILIATION */}
      {activeStage === 5 && (
        <div className="space-y-5">
          <div className="flex flex-wrap items-center justify-between gap-3 bg-white px-5 py-4 rounded-xl border border-slate-200/90 text-sm">
            <div>
              <span className="font-bold text-slate-900 text-base">
                Stage 5: Final Passenger Manifest Reconciliation & Case Resolution
              </span>
              <span className="text-slate-500 ml-2 hidden sm:inline text-sm">
                (Invariant: Incident cannot close while any passenger remains unresolved)
              </span>
            </div>
            <button
              onClick={() => setActiveStage(4)}
              className="px-4 py-2 rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50 text-sm font-medium"
            >
              Review Responses
            </button>
          </div>

          <ManifestReconciliationTable incidentId={currentIncident.id} />
        </div>
      )}

      {/* Report Breakdown Modal */}
      <ReportBreakdownModal
        isOpen={isReportModalOpen}
        onClose={() => setIsReportModalOpen(false)}
      />
    </div>
  );
}
