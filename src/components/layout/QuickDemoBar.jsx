import React from 'react';
import { Sparkles, ShieldAlert, GitMerge, MessageSquareCheck, ArrowRight } from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';

export function QuickDemoBar() {
  const { setActiveTab } = useFleetRipple();

  return (
    <div className="bg-[#070D1D] text-slate-300 px-6 py-2.5 flex flex-wrap items-center justify-between text-xs border-b border-slate-800 gap-2">
      <div className="flex items-center gap-2.5">
        <span className="flex items-center gap-1.5 font-bold text-teal-400 bg-teal-950 px-2 py-0.5 rounded border border-teal-800/80 text-[11px] font-mono">
          <Sparkles className="w-3.5 h-3.5" />
          Interactive Demo Flow
        </span>
        <span className="text-slate-400 hidden md:inline text-[11px]">
          Simulate end-to-end fleet recovery and operator brokerage:
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setActiveTab('rippleops')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors text-[11px] font-medium"
        >
          <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
          <span>1. Test RippleOps Recovery</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>

        <button
          onClick={() => setActiveTab('tripmerge')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors text-[11px] font-medium"
        >
          <GitMerge className="w-3.5 h-3.5 text-teal-400" />
          <span>2. Test TripMerge Brokerage</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>

        <button
          onClick={() => setActiveTab('passenger')}
          className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-slate-800/90 hover:bg-slate-700 text-slate-200 hover:text-white border border-slate-700 transition-colors text-[11px] font-medium"
        >
          <MessageSquareCheck className="w-3.5 h-3.5 text-amber-400" />
          <span>3. Test Passenger Companion</span>
          <ArrowRight className="w-3 h-3 text-slate-400" />
        </button>
      </div>
    </div>
  );
}
