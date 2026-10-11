import React from 'react';
import { Bus, CheckCircle2, XCircle, Clock, ShieldCheck } from 'lucide-react';
import { Badge } from '../common/Badge';

export function CandidateBusesTable({ candidates = [], onGeneratePlan, isPlanGenerated }) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
      <div className="p-5 border-b border-slate-100 flex flex-wrap items-center justify-between gap-3 bg-slate-50/70">
        <div>
          <h3 className="text-base font-bold text-[#0B132B]">
            Nearby Candidate Replacement Fleet
          </h3>
          <p className="text-sm text-slate-500 mt-0.5">
            Multi-constraint rule filtering applied across geographic corridor (NH-16)
          </p>
        </div>
        <div className="flex items-center gap-2.5">
          <Badge variant="teal" size="sm">Rule-Based Ranking Active</Badge>
          <span className="text-xs text-slate-400 font-mono">Simulated Telemetry</span>
        </div>
      </div>

      <div className="overflow-x-auto">
        <table className="w-full text-left text-sm">
          <thead className="bg-slate-50 text-slate-500 font-semibold border-b border-slate-200/80">
            <tr>
              <th className="px-5 py-3.5">Rank / Bus ID</th>
              <th className="px-5 py-3.5">Operator</th>
              <th className="px-5 py-3.5">Route & Direction</th>
              <th className="px-5 py-3.5">Distance & Location</th>
              <th className="px-5 py-3.5">Est. Arrival (ETA)</th>
              <th className="px-5 py-3.5 text-center">Available Capacity</th>
              <th className="px-5 py-3.5">Compatibility Status</th>
              <th className="px-5 py-3.5">Delay Impact</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {candidates.map((bus, index) => {
              const isCompatible = bus.isCompatible !== false;
              const rank = isCompatible ? `#${index + 1}` : 'EXCLUDED';

              return (
                <tr
                  key={bus.id}
                  className={`hover:bg-slate-50 transition-colors ${
                    !isCompatible ? 'bg-rose-50/25 opacity-90' : ''
                  }`}
                >
                  {/* Bus ID & Rank */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-2.5">
                      <span
                        className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          isCompatible
                            ? 'bg-teal-50 text-teal-800 border border-teal-200'
                            : 'bg-rose-100 text-rose-800 border border-rose-200'
                        }`}
                      >
                        {rank}
                      </span>
                      <div>
                        <div className="font-bold text-[#0B132B] font-mono text-base">{bus.id}</div>
                        <div className="text-xs text-slate-400 font-mono">{bus.regNumber}</div>
                      </div>
                    </div>
                  </td>

                  {/* Operator */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800 text-sm">{bus.operatorName}</div>
                    <div className="text-xs text-slate-500 mt-0.5">{bus.model}</div>
                  </td>

                  {/* Route & Direction */}
                  <td className="px-5 py-4">
                    <div className="font-medium text-slate-800 text-sm">{bus.route}</div>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <span>Dir:</span>
                      <span className={isCompatible ? 'text-slate-600' : 'text-rose-600 font-medium'}>
                        {bus.direction}
                      </span>
                    </div>
                  </td>

                  {/* Distance & Location */}
                  <td className="px-5 py-4">
                    <div className="font-semibold text-slate-800 text-sm">{bus.distanceKm} km away</div>
                    <div className="text-xs text-slate-500 line-clamp-1 mt-0.5">{bus.location}</div>
                  </td>

                  {/* ETA */}
                  <td className="px-5 py-4">
                    <div className="flex items-center gap-1.5 text-slate-800 font-semibold text-sm">
                      <Clock className="w-4 h-4 text-teal-600" />
                      <span>+{bus.etaMinutes} mins</span>
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">Sched: {bus.departureTime}</div>
                  </td>

                  {/* Available Capacity */}
                  <td className="px-5 py-4 text-center">
                    <div className="inline-block px-3 py-1.5 rounded-lg bg-teal-50 border border-teal-200 text-teal-800 font-bold font-mono text-sm">
                      {bus.availableSeats} seats
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      of {bus.capacity} total
                    </div>
                  </td>

                  {/* Compatibility Status & Reason */}
                  <td className="px-5 py-4 max-w-xs">
                    {isCompatible ? (
                      <div>
                        <Badge variant="teal" size="sm">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Fully Compatible</span>
                        </Badge>
                        <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                          {bus.compatibilityNote}
                        </p>
                      </div>
                    ) : (
                      <div>
                        <Badge variant="rose" size="sm">
                          <XCircle className="w-3.5 h-3.5" />
                          <span>Incompatible Route</span>
                        </Badge>
                        <p className="text-xs text-rose-700 font-medium mt-1 leading-relaxed">
                          {bus.compatibilityNote}
                        </p>
                      </div>
                    )}
                  </td>

                  {/* Additional Passenger Waiting Time */}
                  <td className="px-5 py-4">
                    {isCompatible ? (
                      <span className="font-medium text-slate-700 text-sm">
                        +{bus.etaMinutes} mins arrival
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-sm">N/A (Divergent)</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>

      <div className="p-5 bg-slate-50 border-t border-slate-100 flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm text-slate-600 max-w-xl leading-relaxed">
          <strong className="text-[#0B132B]">Constraint Engine Validation: </strong>
          BUS-104 excluded due to destination divergence at Kathipudi. Combined compatible capacity:{' '}
          <strong className="text-teal-700">35 seats</strong> (15 on BUS-102 + 20 on BUS-103)
          matches all 35 affected passengers exactly.
        </div>

        <button
          onClick={onGeneratePlan}
          className={`px-4 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 transition-all ${
            isPlanGenerated
              ? 'bg-slate-200 text-slate-700 hover:bg-slate-300'
              : 'bg-[#0B132B] hover:bg-slate-800 text-white shadow-2xs'
          }`}
        >
          <ShieldCheck className="w-4 h-4 text-teal-400" />
          <span>{isPlanGenerated ? 'Re-run Optimization Engine' : 'Generate Recovery Plan'}</span>
        </button>
      </div>
    </div>
  );
}
