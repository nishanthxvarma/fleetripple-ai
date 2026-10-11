import React, { useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts';
import {
  Banknote,
  Users,
  Percent,
  Clock,
  FileText,
  Search,
  Filter,
  CheckCircle2,
  ShieldCheck,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';
import { formatCurrency } from '../../utils/formatters';

export function AnalyticsView() {
  const {
    incidents,
    proposals,
    bookings,
    trips,
    auditLogs,
  } = useFleetRipple();

  const [logSearch, setLogSearch] = useState('');
  const [logFilter, setLogFilter] = useState('ALL');

  // Recovery Metrics
  const rippleBookings = bookings?.filter((b) => b.tripId === 'TRIP-101') || [];
  const rippleAssigned = rippleBookings.filter((b) => b.status === 'accepted').reduce((sum, b) => sum + b.passengerCount, 0);
  const rippleWaiting = rippleBookings.filter((b) => b.status === 'waiting_alternative').reduce((sum, b) => sum + b.passengerCount, 0);
  const rippleRefunds = rippleBookings.filter((b) => b.status === 'refund_requested').reduce((sum, b) => sum + b.passengerCount, 0);
  const unresolvedPax = rippleBookings.filter((b) => b.status === 'unassigned' || b.status === 'waiting_alternative').reduce((sum, b) => sum + (b.passengerCount || 1), 0);

  // Consolidation Metrics
  const totalIncidents = incidents?.length || 0;
  const resolvedIncidents = (incidents || []).filter((i) => i.status === 'resolved').length;
  const proposalsGenerated = proposals?.length || 0;
  const agreementsCompleted = (proposals || []).filter((p) => p.status === 'operator_approved' || p.status === 'finalized').length;

  const realizedSavings = (proposals || [])
    .filter((p) => p.status === 'finalized')
    .reduce((sum, p) => sum + (p.financials?.grossOperatingSavings || 0), 0);
  const estimatedSavings = (proposals || [])
    .filter((p) => p.status !== 'finalized' && p.status !== 'cancelled')
    .reduce((sum, p) => sum + (p.financials?.grossOperatingSavings || 16300), 0);

  const mergeBookings = (bookings || []).filter((b) => b.tripId === 'TRIP-201' || b.tripId === 'TRIP-202');
  const mergeAccepted = mergeBookings.filter((b) => b.status === 'consolidation_accepted').reduce((sum, b) => sum + b.passengerCount, 0);
  const mergeRefunds = mergeBookings.filter((b) => b.status === 'consolidation_refund_requested').reduce((sum, b) => sum + b.passengerCount, 0);

  // Fleet Occupancy Shift Data
  const occupancyComparisonData = [
    { name: 'TRIP-201 (Apex)', Before: 30.0, After: 0.0 },
    { name: 'TRIP-202 (Coastal)', Before: 37.5, After: 67.5 },
    { name: 'Corridor Average', Before: 33.75, After: 67.5 },
  ];

  // Passenger Consent Distribution Pie Data
  const consentData = [
    { name: 'Accepted Alternative/Merge', value: rippleAssigned + mergeAccepted, color: '#0d9488' },
    { name: 'Refunds Requested', value: rippleRefunds + mergeRefunds, color: '#e11d48' },
    { name: 'Awaiting Standby', value: rippleWaiting, color: '#d97706' },
    { name: 'Pending Initial Offer', value: Math.max(0, 62 - (rippleAssigned + mergeAccepted + rippleRefunds + mergeRefunds + rippleWaiting)), color: '#64748b' },
  ];

  // Filtered audit logs
  const filteredLogs = (auditLogs || []).filter((log) => {
    const q = logSearch.toLowerCase();
    const matchSearch =
      log.description.toLowerCase().includes(q) ||
      log.actor.toLowerCase().includes(q) ||
      log.type.toLowerCase().includes(q);

    let matchFilter = true;
    if (logFilter !== 'ALL') {
      matchFilter = log.type === logFilter;
    }

    return matchSearch && matchFilter;
  });

  return (
    <div className="space-y-6">
      {/* 1. TOP HEADER (Spacious Light Style) */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-base font-bold text-slate-900">
            Platform Intelligence & Operational Analytics
          </h2>
          <p className="text-sm text-slate-500 mt-0.5">
            Realized vs estimated savings, occupancy shift metrics, and chronological audit ledger
          </p>
        </div>
        <span className="text-xs font-mono bg-slate-100 text-slate-600 border border-slate-200 px-2.5 py-1 rounded font-semibold">
          Simulation Model v2.4
        </span>
      </div>

      {/* 2. OPERATIONAL METRICS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 md:gap-5">
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Estimated Net Savings
            </span>
            <Banknote className="w-5 h-5 text-teal-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-teal-700 tracking-tight">
              {formatCurrency(estimatedSavings)}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            {realizedSavings > 0 ? `Realized: ${formatCurrency(realizedSavings)}` : 'Brokerage model estimate'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Recovery Completion
            </span>
            <Users className="w-5 h-5 text-rose-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              {resolvedIncidents} / {totalIncidents}
            </span>
            <span className="text-xs font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded-full border border-rose-200">
              {unresolvedPax > 0 ? `${unresolvedPax} waiting` : 'All Reconciled'}
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            {unresolvedPax === 0 ? 'Zero unassigned passengers' : 'Active recovery in progress'}
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Average Delay
            </span>
            <Clock className="w-5 h-5 text-amber-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-slate-900 tracking-tight">
              +20m
            </span>
            <span className="text-xs font-medium text-slate-500">
              at Anakapalle bay
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            Within 30 min schedule tolerance
          </p>
        </div>

        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs">
          <div className="flex items-center justify-between text-slate-400">
            <span className="text-xs md:text-sm font-semibold uppercase tracking-wider text-slate-500">
              Corridor Utilization
            </span>
            <Percent className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-2 flex items-baseline gap-2.5">
            <span className="text-3xl md:text-4xl font-bold text-emerald-700 tracking-tight">
              67.5%
            </span>
            <span className="text-xs font-semibold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
              +33.8% Gain
            </span>
          </div>
          <p className="text-sm text-slate-500 mt-2 truncate">
            Consolidated from 30.0% & 37.5%
          </p>
        </div>
      </div>

      {/* 3. CHARTS GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Occupancy Shift Chart */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="card-title text-slate-900">
                Corridor Occupancy Shift (Before vs After Merge)
              </h3>
              <p className="secondary-text text-slate-500 mt-0.5">
                Occupancy percentage on Visakhapatnam ↔ Vijayawada evening departure
              </p>
            </div>
            <Badge variant="teal" size="sm">Demand Optimized</Badge>
          </div>

          <div className="h-72 w-full pt-2">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={occupancyComparisonData} margin={{ top: 10, right: 20, left: -10, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis dataKey="name" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <YAxis unit="%" tick={{ fontSize: 12, fill: '#64748b' }} axisLine={false} tickLine={false} />
                <Tooltip
                  formatter={(val) => [`${val}%`, 'Occupancy']}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
                <Bar dataKey="Before" fill="#94a3b8" radius={[4, 4, 0, 0]} name="Before Consolidation (%)" />
                <Bar dataKey="After" fill="#0d9488" radius={[4, 4, 0, 0]} name="After Consolidation (%)" />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Passenger Response Distribution */}
        <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <div>
              <h3 className="card-title text-slate-900">
                Passenger Consent Distribution
              </h3>
              <p className="secondary-text text-slate-500 mt-0.5">
                Aggregate passenger choices recorded across recovery and consolidation
              </p>
            </div>
            <Badge variant="blue" size="sm">Ledger Data</Badge>
          </div>

          <div className="h-72 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={consentData}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={85}
                  paddingAngle={3}
                  dataKey="value"
                >
                  {consentData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  formatter={(val, name) => [`${val} passengers`, name]}
                  contentStyle={{ backgroundColor: '#ffffff', borderRadius: '8px', border: '1px solid #e2e8f0', fontSize: '13px' }}
                />
                <Legend wrapperStyle={{ fontSize: '12px' }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* 4. FULL AUDIT EVENT TRAIL TABLE */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="p-5 md:p-6 border-b border-slate-100 flex flex-wrap items-center justify-between gap-4 bg-slate-50/70">
          <div>
            <h3 className="card-title text-slate-900">
              Chronological Audit Trail & Event Stream
            </h3>
            <p className="secondary-text text-slate-500 mt-1">
              Auditable log of constraint checks, operator negotiations, passenger responses, and final settlements
            </p>
          </div>

          {/* Search and filters */}
          <div className="flex items-center gap-3 text-sm">
            <div className="relative">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Filter logs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="pl-9 pr-3 py-1.5 text-sm border border-slate-200 rounded-lg bg-white text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-1 focus:ring-teal-600 shadow-2xs"
              />
            </div>

            <select
              value={logFilter}
              onChange={(e) => setLogFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-1.5 text-sm bg-white text-slate-700 font-medium shadow-2xs"
            >
              <option value="ALL">All Event Types</option>
              <option value="INCIDENT">INCIDENT</option>
              <option value="OPTIMIZATION">OPTIMIZATION</option>
              <option value="DISCOVERY">DISCOVERY</option>
              <option value="PASSENGER_ACTION">PASSENGER_ACTION</option>
              <option value="FINALIZATION">FINALIZATION</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto max-h-96">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/90 text-slate-500 font-semibold sticky top-0 border-b border-slate-100">
              <tr>
                <th className="px-5 py-3 w-32 text-xs uppercase tracking-wider">Time / ID</th>
                <th className="px-5 py-3 w-36 text-xs uppercase tracking-wider">Event Type</th>
                <th className="px-5 py-3 w-48 text-xs uppercase tracking-wider">Acting Entity</th>
                <th className="px-5 py-3 text-xs uppercase tracking-wider">Event Description</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredLogs.map((log) => (
                <tr key={log.id} className="hover:bg-slate-50/60 transition-colors">
                  <td className="px-5 py-3.5 text-slate-500 align-top">
                    <span className="font-semibold text-slate-800 block">{log.timestamp}</span>
                    <span className="text-xs font-mono text-slate-400 mt-0.5 block">{log.id}</span>
                  </td>
                  <td className="px-5 py-3.5 align-top">
                    <Badge
                      variant={
                        log.badgeColor === 'rose'
                          ? 'rose'
                          : log.badgeColor === 'teal'
                          ? 'teal'
                          : log.badgeColor === 'amber'
                          ? 'amber'
                          : log.badgeColor === 'indigo'
                          ? 'indigo'
                          : 'slate'
                      }
                      size="sm"
                    >
                      {log.type}
                    </Badge>
                  </td>
                  <td className="px-5 py-3.5 text-slate-800 font-medium align-top">
                    {log.actor}
                  </td>
                  <td className="px-5 py-3.5 text-slate-600 leading-relaxed align-top">
                    {log.description}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
