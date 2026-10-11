import React, { useState } from 'react';
import {
  MapPin,
  AlertTriangle,
  Bus,
  CheckCircle2,
  XCircle,
  Navigation,
  Info,
  Clock,
  Users,
} from 'lucide-react';
import { Badge } from './Badge';

export function CorridorRouteMap({ selectedVehicleId, onSelectVehicle }) {
  const [activePin, setActivePin] = useState(selectedVehicleId || 'BUS-101');

  const stops = [
    { id: 'VIZAG', name: 'Visakhapatnam', km: 0, x: 8, y: 35, role: 'Origin Terminal' },
    { id: 'ANAKAPALLE', name: 'Anakapalle', km: 34, x: 22, y: 35, role: 'Breakdown Bay' },
    { id: 'SANKARAM', name: 'Sankaram', km: 42, x: 32, y: 35, role: 'Highway Bypass' },
    { id: 'TUNI', name: 'Tuni', km: 105, x: 48, y: 35, role: 'Midpoint Transit' },
    { id: 'KATHIPUDI', name: 'Kathipudi Junction', km: 130, x: 60, y: 35, role: 'Branch Point' },
    { id: 'RAJAHMUNDRY', name: 'Rajahmundry', km: 200, x: 74, y: 35, role: 'Godavari Hub' },
    { id: 'ELURU', name: 'Eluru', km: 285, x: 86, y: 35, role: 'Intercity Stop' },
    { id: 'VIJAYAWADA', name: 'Vijayawada', km: 350, x: 96, y: 35, role: 'Destination Hub' },
  ];

  // Vehicles with positions
  const vehicles = [
    {
      id: 'BUS-101',
      operator: 'Apex Express',
      model: 'Volvo 9600 Multi-Axle',
      status: 'Breakdown',
      x: 22,
      y: 20,
      location: 'Anakapalle Toll Plaza (Km 34)',
      direction: 'Southbound to Vijayawada',
      passengers: '35 Stranded',
      availableSeats: 0,
      eta: 'Stationary (Coolant Line Failure)',
      isCompatible: false,
      color: 'rose',
      pulse: true,
      description: 'Vehicle halted at emergency bay. Requires 35-seat passenger evacuation.',
    },
    {
      id: 'BUS-102',
      operator: 'Coastal Cruiser',
      model: 'Scania Metrolink HD',
      status: 'En Route',
      x: 17,
      y: 48,
      location: 'Sankaram North (8 km to incident)',
      direction: 'Southbound to Vijayawada',
      passengers: '25 on board',
      availableSeats: 15,
      eta: '+20 mins to Anakapalle',
      isCompatible: true,
      color: 'teal',
      pulse: false,
      description: 'Fully compatible trunk service. 15 available seats assigned for recovery.',
    },
    {
      id: 'BUS-103',
      operator: 'Southern Starline',
      model: 'BharatBenz Sleeper',
      status: 'En Route',
      x: 12,
      y: 24,
      location: 'Gajuwaka Highway (14 km to incident)',
      direction: 'Southbound to Vijayawada',
      passengers: '20 on board',
      availableSeats: 20,
      eta: '+35 mins to Anakapalle',
      isCompatible: true,
      color: 'teal',
      pulse: false,
      description: 'Fully compatible service via Eluru corridor. 20 available seats assigned for recovery.',
    },
    {
      id: 'BUS-104',
      operator: 'Eastern Intercity',
      model: 'Tata Marcopolo',
      status: 'Diverging Route',
      x: 64,
      y: 72,
      location: 'Kathipudi / Kakinada Branch (Km 145)',
      direction: 'Southwest to Kakinada / Yanam',
      passengers: '30 on board',
      availableSeats: 10,
      eta: 'Divergent Direction',
      isCompatible: false,
      color: 'slate',
      pulse: false,
      description: 'ROUTE INCOMPATIBLE: Branches off at Kathipudi towards Kakinada. Cannot serve Vijayawada passenger destinations.',
    },
    {
      id: 'BUS-201',
      operator: 'Apex Express',
      model: 'Ashok Leyland Oyster',
      status: 'Underbooked (30%)',
      x: 8,
      y: 18,
      location: 'Dwaraka Complex (Vizag)',
      direction: 'Scheduled 18:00 Departure',
      passengers: '12 Booked (40 Cap)',
      availableSeats: 28,
      eta: 'Departure at 18:00',
      isCompatible: true,
      color: 'amber',
      pulse: false,
      description: 'Candidate for TripMerge consolidation with Coastal Cruiser TRIP-202.',
    },
    {
      id: 'BUS-202',
      operator: 'Coastal Cruiser',
      model: 'Volvo B11R Multi-Axle',
      status: 'Underbooked (37.5%)',
      x: 8,
      y: 52,
      location: 'Dwaraka Complex (Vizag)',
      direction: 'Scheduled 18:15 Departure',
      passengers: '15 Booked (40 Cap)',
      availableSeats: 25,
      eta: 'Departure at 18:15',
      isCompatible: true,
      color: 'teal',
      pulse: false,
      description: 'Designated replacement coach for merged 27-passenger consolidated trip.',
    },
  ];

  const currentVehicle = vehicles.find((v) => v.id === activePin) || vehicles[0];

  const handleSelect = (id) => {
    setActivePin(id);
    if (onSelectVehicle) onSelectVehicle(id);
  };

  return (
    <div className="bg-[#0B132B] rounded-2xl border border-slate-800 text-white overflow-hidden shadow-md">
      {/* Top Corridor Status Bar */}
      <div className="px-5 py-3 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3 bg-[#070D1D]/70">
        <div className="flex items-center gap-2.5">
          <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
          <span className="text-xs font-bold tracking-wider uppercase text-slate-300">
            Corridor Route Telemetry
          </span>
          <span className="text-slate-500">•</span>
          <span className="text-xs font-semibold text-teal-400">
            NH-16 Trunk (Visakhapatnam ↔ Vijayawada, 350 km)
          </span>
        </div>

        <div className="flex items-center gap-3 text-xs">
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-rose-500" />
            <span className="text-slate-400 text-[11px]">Breakdown Incident</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-teal-400" />
            <span className="text-slate-400 text-[11px]">Compatible Relief</span>
          </div>
          <div className="flex items-center gap-1.5">
            <span className="w-2.5 h-2.5 rounded-full bg-slate-500" />
            <span className="text-slate-400 text-[11px]">Incompatible Branch</span>
          </div>
        </div>
      </div>

      {/* Interactive Map Visual Surface */}
      <div className="relative p-6 pt-10 pb-12 overflow-x-auto min-h-[220px]">
        {/* SVG Route Topology */}
        <svg
          className="w-full min-w-[700px] h-32"
          viewBox="0 0 1000 120"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          {/* Main NH-16 Highway Trunk Line */}
          <line
            x1="80"
            y1="50"
            x2="960"
            y2="50"
            stroke="#1E293B"
            strokeWidth="10"
            strokeLinecap="round"
          />
          <line
            x1="80"
            y1="50"
            x2="960"
            y2="50"
            stroke="#0EA5E9"
            strokeWidth="3"
            strokeDasharray="6 4"
            className="opacity-70"
          />

          {/* Diverging branch line at Kathipudi towards Kakinada (Incompatible route) */}
          <path
            d="M 600 50 C 620 50, 640 85, 720 95"
            stroke="#475569"
            strokeWidth="4"
            strokeDasharray="4 4"
          />
          <text x="690" y="112" fill="#94A3B8" fontSize="11" fontFamily="sans-serif">
            Branch to Kakinada / Yanam (Divergent)
          </text>

          {/* Render Stops */}
          {stops.map((stop) => {
            const cx = stop.x * 10;
            const isIncidentStop = stop.id === 'ANAKAPALLE';

            return (
              <g key={stop.id} className="cursor-pointer">
                {/* Station Node Outer Ring */}
                <circle
                  cx={cx}
                  cy="50"
                  r={isIncidentStop ? '9' : '6'}
                  fill={isIncidentStop ? '#FEF2F2' : '#0F172A'}
                  stroke={isIncidentStop ? '#EF4444' : '#38BDF8'}
                  strokeWidth={isIncidentStop ? '3' : '2'}
                />
                {/* Center dot */}
                <circle
                  cx={cx}
                  cy="50"
                  r="3"
                  fill={isIncidentStop ? '#DC2626' : '#FFFFFF'}
                />
                {/* Station Label */}
                <text
                  x={cx}
                  y="74"
                  textAnchor="middle"
                  fill="#F8FAFC"
                  fontSize="11"
                  fontWeight="600"
                  fontFamily="sans-serif"
                >
                  {stop.name}
                </text>
                {/* KM Marker */}
                <text
                  x={cx}
                  y="88"
                  textAnchor="middle"
                  fill="#64748B"
                  fontSize="9"
                  fontFamily="monospace"
                >
                  Km {stop.km}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Dynamic Vehicle Interactive Pins */}
        <div className="absolute inset-0 pointer-events-none min-w-[700px]">
          {vehicles.map((v) => {
            const isSelected = activePin === v.id;
            const leftPct = v.x;
            const topPct = v.y;

            return (
              <div
                key={v.id}
                onClick={() => handleSelect(v.id)}
                className="absolute pointer-events-auto transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-transform hover:scale-110 z-20"
                style={{ left: `${leftPct}%`, top: `${topPct}%` }}
              >
                <div className="relative group">
                  {/* Pin Circle */}
                  <div
                    className={`flex items-center gap-1.5 px-2 py-1 rounded-lg text-xs font-bold border transition-all ${
                      v.color === 'rose'
                        ? 'bg-rose-950/90 text-rose-300 border-rose-500 shadow-rose-900/40 shadow-lg'
                        : v.color === 'teal'
                        ? 'bg-teal-950/90 text-teal-300 border-teal-400 shadow-teal-900/40 shadow-lg'
                        : v.color === 'amber'
                        ? 'bg-amber-950/90 text-amber-300 border-amber-400 shadow-amber-900/40 shadow-lg'
                        : 'bg-slate-900/90 text-slate-300 border-slate-500 shadow-slate-900/40 shadow-lg'
                    } ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                  >
                    <Bus className="w-3.5 h-3.5 shrink-0" />
                    <span className="font-mono text-[11px]">{v.id}</span>
                    {v.pulse && (
                      <span className="w-2 h-2 rounded-full bg-rose-500 animate-ping absolute -top-1 -right-1" />
                    )}
                  </div>

                  {/* Micro label below */}
                  <div className="absolute left-1/2 -translate-x-1/2 top-full mt-1 bg-black/80 px-1.5 py-0.5 rounded text-[9px] text-slate-300 whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none">
                    {v.operator} ({v.status})
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Selected Vehicle Telemetry Drawer / Footer */}
      <div className="px-5 py-3.5 bg-[#070D1D] border-t border-slate-800 text-xs flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold font-mono text-sm border ${
              currentVehicle.color === 'rose'
                ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                : currentVehicle.color === 'teal'
                ? 'bg-teal-500/10 text-teal-400 border-teal-500/30'
                : currentVehicle.color === 'amber'
                ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                : 'bg-slate-800 text-slate-300 border-slate-700'
            }`}
          >
            {currentVehicle.id.replace('BUS-', '')}
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="font-bold text-white text-sm">{currentVehicle.id}</span>
              <span className="text-slate-400">• {currentVehicle.operator}</span>
              <Badge
                variant={
                  currentVehicle.color === 'rose'
                    ? 'rose'
                    : currentVehicle.color === 'teal'
                    ? 'teal'
                    : currentVehicle.color === 'amber'
                    ? 'amber'
                    : 'slate'
                }
                size="xs"
              >
                {currentVehicle.status}
              </Badge>
            </div>
            <p className="text-[11px] text-slate-400 mt-0.5">{currentVehicle.description}</p>
          </div>
        </div>

        {/* Quick Stats Grid */}
        <div className="flex items-center gap-5 text-[11px]">
          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Location</span>
            <span className="font-semibold text-slate-200">{currentVehicle.location}</span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Capacity</span>
            <span
              className={`font-semibold ${
                currentVehicle.availableSeats > 0 ? 'text-teal-400' : 'text-slate-400'
              }`}
            >
              {currentVehicle.availableSeats} Free Seats
            </span>
          </div>

          <div>
            <span className="text-slate-500 block text-[10px] uppercase font-mono">Timing / ETA</span>
            <span className="font-semibold text-slate-200">{currentVehicle.eta}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
