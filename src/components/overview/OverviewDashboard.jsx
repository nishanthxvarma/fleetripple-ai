import React, { useState } from 'react';
import {
  AlertTriangle,
  Users,
  GitMerge,
  Truck,
  ArrowRight,
  CheckCircle2,
  XCircle,
  Clock,
  MapPin,
  ChevronRight,
  ShieldAlert,
  Radio,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';
import { CorridorRouteMap } from '../common/CorridorRouteMap';
import { formatCurrency, formatNumber } from '../../utils/formatters';

export function OverviewDashboard() {
  const {
    activeBreakdownsCount,
    unassignedPassengersCount,
    pendingOperatorAgreementsCount,
    buses,
    incidents,
    proposals,
    bookings,
    auditLogs,
    setActiveTab,
    setActiveIncidentId,
    setActiveProposalId,
  } = useFleetRipple();

  const [selectedMapVehicle, setSelectedMapVehicle] = useState('BUS-101');

  const activeInc = incidents && incidents.length > 0 ? incidents[0] : null;
  const activeProp = proposals && proposals.length > 0 ? proposals[0] : null;

  // Passenger response counts for breakdown
  const rippleBookings = bookings ? bookings.filter((b) => b.tripId === 'TRIP-101') : [];
  const rippleAccepted = rippleBookings
    .filter((b) => b.status === 'accepted')
    .reduce((sum, b) => sum + (b.passengerCount || 1), 0);

  // Available replacement seats on compatible corridor coaches
  const compatibleBuses = buses.filter((b) => b.id === 'BUS-102' || b.id === 'BUS-103');
  const totalCompatibleSeats = compatibleBuses.reduce((sum, b) => sum + (b.availableSeats || 0), 0);

  // Consolidation agreements check
  const opAgreements = activeProp?.operatorAgreements || activeProp?.operator_agreements || {};
  const op1Accepted = opAgreements?.['OP-1']?.status === 'accepted';
  const op2Accepted = opAgreements?.['OP-2']?.status === 'accepted';
  const bothOpsAccepted = Boolean(op1Accepted && op2Accepted);

  // Prioritized Action Queue
  const actionQueue = [
    {
      id: 'ACT-01',
      priority: 'CRITICAL',
      title: `Bus Breakdown: ${activeInc?.busId || 'BUS-101'} stranded on NH-16`,
      description: `${activeInc?.affectedPassengers || 35} passengers at Anakapalle. 35 replacement seats identified across BUS-102 (15) and BUS-103 (20).`,
      actionLabel: 'Launch Recovery Plan',
      status: activeInc?.status === 'resolved' ? 'Resolved' : 'Requires Dispatch Action',
      isResolved: activeInc?.status === 'resolved',
      onAction: () => {
        if (activeInc) setActiveIncidentId(activeInc.id);
        setActiveTab('rippleops');
      },
    },
    {
      id: 'ACT-02',
      priority: 'HIGH',
      title: `Underbooked Trip Merge: Proposal ${activeProp?.id || 'PROP-2026-402'}`,
      description: bothOpsAccepted
        ? 'Mutual agreement achieved between Apex Express & Coastal Cruiser. Awaiting passenger consent.'
        : 'Commercial consolidation terms pending operator signatures between Apex Express and Coastal Cruiser.',
      actionLabel: bothOpsAccepted ? 'View Agreement' : 'Open Negotiation Desk',
      status: bothOpsAccepted ? 'Operator Agreed' : 'Awaiting Signatures',
      isResolved: bothOpsAccepted,
      onAction: () => {
        if (activeProp) setActiveProposalId(activeProp.id);
        setActiveTab('tripmerge');
      },
    },
    {
      id: 'ACT-03',
      priority: 'MEDIUM',
      title: 'Passenger Communications Ledger',
      description: `${rippleAccepted} breakdown passengers accepted replacement coaches. Individual passenger offers dispatched.`,
      actionLabel: 'Inspect Consent Ledger',
      status: 'Live Responses',
      isResolved: false,
      onAction: () => {
        setActiveTab('passenger');
      },
    },
  ];

  return (
    <div className="space-y-7">
      {/* 1. TOP METRIC STRIP (Spacious, high-contrast, prominent values) */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div
          onClick={() => setActiveTab('rippleops')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Active Disruptions
            </span>
            <AlertTriangle className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {activeBreakdownsCount}
            </span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {activeBreakdownsCount > 0 ? 'Stranded' : 'Clear'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            {activeBreakdownsCount > 0 ? 'BUS-101 at Anakapalle' : 'All corridors on schedule'}
          </p>
        </div>

        <div
          onClick={() => setActiveTab('rippleops')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Passengers To Reassign
            </span>
            <Users className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {unassignedPassengersCount}
            </span>
            <span className="text-xs font-medium text-slate-500">
              of 35 total
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            {rippleAccepted} transferred to replacement buses
          </p>
        </div>

        <div
          onClick={() => setActiveTab('tripmerge')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Pending Consolidations
            </span>
            <GitMerge className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {pendingOperatorAgreementsCount}
            </span>
            <span className="text-xs font-semibold text-teal-800 bg-teal-50 px-2 py-0.5 rounded-full border border-teal-200">
              &lt;50% Occupancy
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            TRIP-201 & TRIP-202 eligible on NH-16
          </p>
        </div>

        <div
          onClick={() => setActiveTab('fleet')}
          className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 cursor-pointer hover:border-slate-300 hover:shadow-sm transition-all"
        >
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Relief Capacity Free
            </span>
            <Truck className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {totalCompatibleSeats}
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              Seats Ready
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            Across BUS-102 (15) and BUS-103 (20)
          </p>
        </div>
      </div>

      {/* 2. ACTIVE INCIDENT HIGHLIGHT PANEL */}
      {activeInc && activeInc.status !== 'resolved' && (
        <div className="bg-white rounded-xl border-l-4 border-l-rose-600 border-y border-r border-slate-200 p-5 md:p-6 shadow-2xs">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="space-y-1.5">
              <div className="flex items-center gap-2.5 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-rose-600 animate-pulse" />
                <span className="text-sm font-bold font-mono text-rose-700">
                  {activeInc.id}
                </span>
                <span className="text-slate-300">•</span>
                <span className="text-base font-bold text-slate-900">
                  {activeInc.busId} ({activeInc.route})
                </span>
                <Badge variant="rose" size="sm">
                  {activeInc.status.toUpperCase()}
                </Badge>
              </div>
              <p className="text-sm text-slate-700 leading-relaxed">
                Stranded at <strong className="text-slate-900">{activeInc.location}</strong> with{' '}
                <strong className="text-rose-700">{activeInc.affectedPassengers} passengers</strong>.
                Diagnostic: {activeInc.description}
              </p>
            </div>

            <button
              onClick={() => {
                setActiveIncidentId(activeInc.id);
                setActiveTab('rippleops');
              }}
              className="px-4 py-2.5 rounded-lg bg-rose-600 hover:bg-rose-700 text-white text-sm font-semibold flex items-center gap-2 transition-colors shrink-0 shadow-2xs"
            >
              <span>Manage Recovery</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* 3. OPERATIONAL ACTION QUEUE (Clean spacious list) */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Prioritized Action Queue
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Decisions requiring operator authorization or dispatch verification
            </p>
          </div>
          <span className="text-xs font-mono font-semibold px-2.5 py-1 rounded-md bg-slate-100 text-slate-700">
            {actionQueue.filter((a) => !a.isResolved).length} Pending
          </span>
        </div>

        <div className="divide-y divide-slate-100">
          {actionQueue.map((act) => (
            <div
              key={act.id}
              className="p-5 flex flex-col md:flex-row md:items-center justify-between gap-4 hover:bg-slate-50/60 transition-colors"
            >
              <div className="space-y-1.5 min-w-0">
                <div className="flex items-center gap-2.5 flex-wrap">
                  <span
                    className={`w-2.5 h-2.5 rounded-full shrink-0 ${
                      act.isResolved
                        ? 'bg-emerald-500'
                        : act.priority === 'CRITICAL'
                        ? 'bg-rose-500'
                        : act.priority === 'HIGH'
                        ? 'bg-teal-500'
                        : 'bg-amber-500'
                    }`}
                  />
                  <span className="text-base font-semibold text-slate-900">{act.title}</span>
                  <Badge
                    variant={
                      act.isResolved
                        ? 'emerald'
                        : act.priority === 'CRITICAL'
                        ? 'rose'
                        : act.priority === 'HIGH'
                        ? 'teal'
                        : 'amber'
                    }
                    size="sm"
                  >
                    {act.status}
                  </Badge>
                </div>
                <p className="text-sm text-slate-600 leading-relaxed pl-5">
                  {act.description}
                </p>
              </div>

              <button
                onClick={act.onAction}
                className={`px-4 py-2 rounded-lg text-sm font-semibold flex items-center gap-2 shrink-0 transition-colors self-start md:self-center shadow-2xs ${
                  act.isResolved
                    ? 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                    : act.priority === 'CRITICAL'
                    ? 'bg-rose-600 hover:bg-rose-700 text-white'
                    : 'bg-slate-900 hover:bg-slate-800 text-white'
                }`}
              >
                <span>{act.actionLabel}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* 4. CORRIDOR OVERVIEW & COMPATIBLE COACHES SPLIT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Corridor Route Map Visual (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                NH-16 Corridor Telemetry
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Active bus positions and waypoint checkpoints along Visakhapatnam ↔ Vijayawada
              </p>
            </div>
            <button
              onClick={() => setActiveTab('fleet')}
              className="text-xs md:text-sm font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
            >
              <span>Fleet Directory</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <CorridorRouteMap
            selectedVehicleId={selectedMapVehicle}
            onSelectVehicle={(id) => setSelectedMapVehicle(id)}
          />
        </div>

        {/* Right: Candidate Replacement Fleet Status Table (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="border-b border-slate-100 pb-3 flex items-center justify-between">
            <div>
              <h3 className="text-base font-bold text-slate-900">
                Nearby Replacement Fleet
              </h3>
              <p className="text-sm text-slate-500 mt-0.5">
                Evaluated by Google OR-Tools constraint engine
              </p>
            </div>
            <span className="text-xs font-mono font-medium text-slate-400">Rule-Ranked</span>
          </div>

          <div className="space-y-3">
            {/* BUS-102 */}
            <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">BUS-102</span>
                  <span className="text-xs md:text-sm text-slate-500">• Coastal Cruiser</span>
                </div>
                <div className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Sankaram Junction • ETA +20 mins
                </div>
              </div>
              <div className="text-right">
                <Badge variant="teal" size="sm">15 Free Seats</Badge>
                <div className="text-xs text-emerald-700 font-semibold mt-1">Compatible ✓</div>
              </div>
            </div>

            {/* BUS-103 */}
            <div className="p-3.5 rounded-lg border border-slate-200/80 bg-slate-50/50 flex items-center justify-between">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-bold text-slate-900">BUS-103</span>
                  <span className="text-xs md:text-sm text-slate-500">• Southern Starline</span>
                </div>
                <div className="text-xs md:text-sm text-slate-500 mt-0.5">
                  Gajuwaka Highway • ETA +35 mins
                </div>
              </div>
              <div className="text-right">
                <Badge variant="teal" size="sm">20 Free Seats</Badge>
                <div className="text-xs text-emerald-700 font-semibold mt-1">Compatible ✓</div>
              </div>
            </div>

            {/* BUS-104 (Excluded) */}
            <div className="p-3 rounded-lg border border-rose-200 bg-rose-50/30 flex items-center justify-between text-sm">
              <div>
                <div className="font-semibold text-slate-800">BUS-104 • Eastern Intercity</div>
                <div className="text-xs text-rose-700 mt-0.5">
                  Excluded: Diverges at Kathipudi towards Kakinada
                </div>
              </div>
              <Badge variant="rose" size="sm">Incompatible ✕</Badge>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs md:text-sm text-slate-500">
            <span>Capacity Target: 35 Seats</span>
            <span className="font-semibold text-emerald-700">100% Demand Met (15 + 20)</span>
          </div>
        </div>
      </div>

      {/* 5. RECENT OPERATIONAL ACTIVITY STREAM */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="px-6 py-4 border-b border-slate-100 flex items-center justify-between">
          <div>
            <h3 className="text-base font-bold text-slate-900">
              Recent Operational Events
            </h3>
            <p className="text-sm text-slate-500 mt-0.5">
              Chronological log of constraint checks, operator decisions, and system telemetry
            </p>
          </div>
          <button
            onClick={() => setActiveTab('analytics')}
            className="text-xs md:text-sm font-semibold text-teal-700 hover:text-teal-900 flex items-center gap-1"
          >
            <span>Full Audit Trail</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 w-32">Timestamp</th>
                <th className="px-5 py-3 w-36">Type</th>
                <th className="px-5 py-3 w-48">Actor</th>
                <th className="px-5 py-3">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {auditLogs.slice(0, 5).map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/50">
                  <td className="px-5 py-3.5 font-mono text-xs text-slate-500">{log.timestamp}</td>
                  <td className="px-5 py-3.5">
                    <Badge
                      variant={
                        log.badgeColor === 'rose'
                          ? 'rose'
                          : log.badgeColor === 'teal'
                          ? 'teal'
                          : log.badgeColor === 'amber'
                          ? 'amber'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {log.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 font-medium text-slate-900">{log.actor}</td>
                  <td className="px-5 py-3.5 text-slate-600">{log.description}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
