import React, { useState } from 'react';
import {
  Truck,
  Search,
  Filter,
  MapPin,
  Clock,
  ArrowRight,
  X,
  AlertTriangle,
  GitMerge,
  ShieldCheck,
  CheckCircle2,
  Users,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';
import { Badge } from '../common/Badge';

export function FleetManagementView() {
  const { buses, operators, setActiveTab, updateVehicleStatus } = useFleetRipple();

  const [searchTerm, setSearchTerm] = useState('');
  const [operatorFilter, setOperatorFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [inspectedBusId, setInspectedBusId] = useState(null);

  const inspectedBus = buses.find((b) => b.id === inspectedBusId);

  const filteredBuses = buses.filter((bus) => {
    const query = searchTerm.toLowerCase();
    const id = (bus.id || '').toLowerCase();
    const reg = (bus.regNumber || bus.reg_number || '').toLowerCase();
    const route = (bus.route || '').toLowerCase();
    const op = (bus.operatorName || bus.operator_name || '').toLowerCase();
    const matchSearch = id.includes(query) || reg.includes(query) || route.includes(query) || op.includes(query);

    const matchOperator =
      operatorFilter === 'ALL' || bus.operatorId === operatorFilter;

    let matchStatus = true;
    if (statusFilter === 'AVAILABLE') {
      matchStatus = bus.isAvailable && bus.status !== 'Breakdown';
    } else if (statusFilter === 'UNAVAILABLE') {
      matchStatus = !bus.isAvailable || bus.status === 'Breakdown';
    } else if (statusFilter === 'UNDERBOOKED') {
      matchStatus = bus.status === 'Underbooked';
    }

    return matchSearch && matchOperator && matchStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Filter and Header Bar */}
      <div className="bg-white rounded-xl border border-slate-200/90 p-5 md:p-6 shadow-2xs space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <h2 className="text-base font-bold text-slate-900">
              Fleet Directory & Vehicle Telemetry
            </h2>
            <p className="text-sm text-slate-500 mt-0.5">
              Multi-operator inventory of active coaches operating along the NH-16 corridor
            </p>
          </div>

          <div className="flex items-center gap-2 text-xs md:text-sm font-mono text-slate-500">
            <span>Showing {filteredBuses.length} of {buses.length} vehicles</span>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="flex flex-wrap items-center gap-3.5 pt-3 border-t border-slate-100 text-sm">
          {/* Search Input */}
          <div className="relative flex-1 min-w-[240px]">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Search by Bus ID, Reg Number, Route, or Operator..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3.5 py-2 border border-slate-200 rounded-lg bg-slate-50 text-slate-800 placeholder-slate-400 focus:bg-white focus:outline-hidden focus:ring-1 focus:ring-teal-600 text-sm"
            />
          </div>

          {/* Operator Filter */}
          <div className="flex items-center gap-2">
            <span className="text-slate-500 text-xs font-semibold uppercase tracking-wider">Operator:</span>
            <select
              value={operatorFilter}
              onChange={(e) => setOperatorFilter(e.target.value)}
              className="border border-slate-200 rounded-lg px-3 py-2 bg-slate-50 text-slate-700 text-sm font-medium"
            >
              <option value="ALL">All Operators</option>
              {operators.map((op) => (
                <option key={op.id} value={op.id}>
                  {op.name}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-lg">
            {['ALL', 'AVAILABLE', 'UNAVAILABLE', 'UNDERBOOKED'].map((st) => (
              <button
                key={st}
                onClick={() => setStatusFilter(st)}
                className={`px-3 py-1.5 rounded-md text-xs font-bold transition-colors ${
                  statusFilter === st
                    ? 'bg-white text-slate-900 shadow-2xs'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {st.charAt(0) + st.slice(1).toLowerCase()}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Fleet Data Table */}
      <div className="bg-white rounded-xl border border-slate-200/90 overflow-hidden shadow-2xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-slate-50/80 text-slate-500 font-semibold border-b border-slate-100">
              <tr>
                <th className="px-5 py-3.5">Bus ID / Reg</th>
                <th className="px-5 py-3.5">Operator & Model</th>
                <th className="px-5 py-3.5">Route / Service</th>
                <th className="px-5 py-3.5 text-center">Capacity (Used/Total)</th>
                <th className="px-5 py-3.5">Vehicle Status</th>
                <th className="px-5 py-3.5">Simulated Location</th>
                <th className="px-5 py-3.5 text-right">Inspect</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredBuses.map((bus) => {
                const isBreakdown = bus.status === 'Breakdown';
                const isUnderbooked = bus.status === 'Underbooked';
                const isConsolidated = bus.status.includes('Consolidated');

                return (
                  <tr
                    key={bus.id}
                    onClick={() => setInspectedBusId(bus.id)}
                    className={`hover:bg-slate-50/60 cursor-pointer transition-colors ${
                      isBreakdown ? 'bg-rose-50/25' : isUnderbooked ? 'bg-amber-50/15' : ''
                    } ${inspectedBusId === bus.id ? 'bg-teal-50/40' : ''}`}
                  >
                    {/* Bus ID & Reg */}
                    <td className="px-5 py-4">
                      <div className="font-bold text-slate-900 font-mono text-base">{bus.id}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">{bus.regNumber}</div>
                    </td>

                    {/* Operator & Model */}
                    <td className="px-5 py-4">
                      <div className="font-semibold text-slate-800 text-sm">{bus.operatorName}</div>
                      <div className="text-xs text-slate-500 mt-0.5">{bus.model}</div>
                    </td>

                    {/* Route */}
                    <td className="px-5 py-4">
                      <div className="font-medium text-slate-800 text-sm">{bus.route}</div>
                      <div className="text-xs text-slate-400 font-mono mt-0.5">
                        {bus.currentTripId ? `Trip: ${bus.currentTripId}` : 'Standby Pool'}
                      </div>
                    </td>

                    {/* Capacity */}
                    <td className="px-5 py-4 text-center">
                      <div className="font-bold text-slate-900 font-mono text-sm">
                        {bus.confirmedBookings} / {bus.capacity}
                      </div>
                      <div
                        className={`text-xs font-semibold font-mono mt-0.5 ${
                          bus.availableSeats > 15
                            ? 'text-teal-700'
                            : bus.availableSeats > 0
                            ? 'text-blue-700'
                            : 'text-slate-400'
                        }`}
                      >
                        {bus.availableSeats} seats free
                      </div>
                    </td>

                    {/* Status Badge */}
                    <td className="px-5 py-4">
                      <Badge
                        variant={
                          isBreakdown
                            ? 'rose'
                            : isConsolidated
                            ? 'teal'
                            : isUnderbooked
                            ? 'amber'
                            : 'emerald'
                        }
                        size="sm"
                      >
                        {bus.status.toUpperCase()}
                      </Badge>
                    </td>

                    {/* Location */}
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-1.5 text-slate-700 text-sm">
                        <MapPin className="w-4 h-4 text-slate-400 shrink-0" />
                        <span className="line-clamp-1">{bus.location}</span>
                      </div>
                      <div className="text-xs text-slate-400 mt-0.5">{bus.direction}</div>
                    </td>

                    {/* Action */}
                    <td className="px-5 py-4 text-right">
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setInspectedBusId(bus.id);
                        }}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold text-xs transition-colors"
                      >
                        Details
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Slide-Over Vehicle Detail Panel / Inspection Drawer */}
      {inspectedBus && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-900/40 backdrop-blur-2xs">
          <div className="bg-white w-full max-w-md h-full shadow-2xl flex flex-col border-l border-slate-200 animate-in slide-in-from-right duration-200">
            {/* Drawer Header (Clean Light Style) */}
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/80 text-slate-900">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 flex items-center justify-center font-mono font-bold text-xs">
                  {inspectedBus.id.replace('BUS-', '')}
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">{inspectedBus.id}</h3>
                  <p className="text-xs text-slate-500">{inspectedBus.operatorName}</p>
                </div>
              </div>
              <button
                onClick={() => setInspectedBusId(null)}
                className="p-1 rounded-md text-slate-400 hover:text-slate-700 hover:bg-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Content */}
            <div className="flex-1 overflow-y-auto p-5 space-y-4 text-xs">
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <div className="flex justify-between">
                  <span className="text-slate-500">Registration Number:</span>
                  <span className="font-mono font-bold text-slate-900">{inspectedBus.regNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Coach Model:</span>
                  <span className="font-semibold text-slate-900">{inspectedBus.model}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Current Status:</span>
                  <Badge variant={inspectedBus.status === 'Breakdown' ? 'rose' : 'teal'}>
                    {inspectedBus.status}
                  </Badge>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block">Telemetry & Location:</span>
                <div className="text-slate-700 space-y-1 text-[11px]">
                  <div>Location: {inspectedBus.location}</div>
                  <div>Heading: {inspectedBus.direction}</div>
                  <div>Assigned Corridor: {inspectedBus.route}</div>
                </div>
              </div>

              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-1.5">
                <span className="font-bold text-slate-900 block">Seating Capacity Breakdown:</span>
                <div className="grid grid-cols-3 gap-2 text-center pt-1">
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase">Total</span>
                    <div className="font-bold text-sm text-slate-900">{inspectedBus.capacity}</div>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase">Booked</span>
                    <div className="font-bold text-sm text-slate-900">{inspectedBus.confirmedBookings}</div>
                  </div>
                  <div className="p-2 rounded bg-white border border-slate-200">
                    <span className="text-[10px] text-slate-400 uppercase">Free</span>
                    <div className="font-bold text-sm text-teal-700">{inspectedBus.availableSeats}</div>
                  </div>
                </div>
              </div>

              {/* Authorized Status Update Control */}
              <div className="p-3.5 rounded-lg bg-slate-50 border border-slate-200 space-y-2">
                <span className="font-bold text-slate-900 block">Operational Dispatch Override:</span>
                <p className="text-[11px] text-slate-500">
                  Update active service readiness or assign to standby relief pool.
                </p>
                <div className="grid grid-cols-2 gap-2 pt-1">
                  <button
                    disabled={inspectedBus.status === 'Breakdown'}
                    onClick={() => updateVehicleStatus(inspectedBus.id, 'Active', true)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                      inspectedBus.status === 'Active'
                        ? 'bg-emerald-600 text-white border-emerald-700 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    } ${inspectedBus.status === 'Breakdown' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Set Active
                  </button>
                  <button
                    disabled={inspectedBus.status === 'Breakdown'}
                    onClick={() => updateVehicleStatus(inspectedBus.id, 'Standby', true)}
                    className={`py-1.5 px-2 rounded-lg text-xs font-semibold border transition-colors ${
                      inspectedBus.status === 'Standby'
                        ? 'bg-blue-600 text-white border-blue-700 shadow-2xs'
                        : 'bg-white hover:bg-slate-100 text-slate-700 border-slate-200'
                    } ${inspectedBus.status === 'Breakdown' ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    Set Standby
                  </button>
                </div>
              </div>

              {/* Action buttons */}
              <div className="pt-2 space-y-2">
                {inspectedBus.status === 'Breakdown' ? (
                  <button
                    onClick={() => {
                      setInspectedBusId(null);
                      setActiveTab('rippleops');
                    }}
                    className="w-full py-2 rounded-lg bg-rose-600 hover:bg-rose-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs text-xs"
                  >
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Open RippleOps Recovery Workspace</span>
                  </button>
                ) : inspectedBus.status === 'Underbooked' ? (
                  <button
                    onClick={() => {
                      setInspectedBusId(null);
                      setActiveTab('tripmerge');
                    }}
                    className="w-full py-2 rounded-lg bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-colors flex items-center justify-center gap-2 shadow-2xs text-xs"
                  >
                    <GitMerge className="w-3.5 h-3.5" />
                    <span>Open in TripMerge Brokerage</span>
                  </button>
                ) : (
                  <div className="text-center text-slate-400 text-xs italic">
                    Vehicle currently operating on active schedule.
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
