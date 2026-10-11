import React, { useState } from 'react';
import {
  RotateCcw,
  CheckCircle2,
  ChevronRight,
  FileText,
  Menu,
  PanelLeft,
  Radio,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';

export function Header({ onOpenAuditDrawer, onToggleSidebar, isSidebarCollapsed }) {
  const {
    resetDemo,
    activeTab,
    auditLogs,
    isBackendConnected,
    isLoading,
  } = useFleetRipple();

  const [resetConfirm, setResetConfirm] = useState(false);

  const handleReset = async () => {
    try {
      await resetDemo();
      setResetConfirm(true);
      setTimeout(() => setResetConfirm(false), 2500);
    } catch {
      // Handled in context
    }
  };

  const breadcrumbs = {
    overview: {
      title: 'Command Centre',
      subtitle: 'Corridor telemetry, active incidents & prioritized operational action queue',
    },
    rippleops: {
      title: 'RippleOps AI',
      subtitle: 'Breakdown recovery, candidate bus screening & passenger manifest reconciliation',
    },
    tripmerge: {
      title: 'TripMerge Guardian',
      subtitle: 'Cross-operator trip consolidation, commercial terms & passenger consent ledger',
    },
    passenger: {
      title: 'Passenger Communications',
      subtitle: 'Individual passenger offers, responses, boarding passes & refund ledger',
    },
    fleet: {
      title: 'Fleet Directory',
      subtitle: 'Multi-operator bus inventory, route directions & seat capacity breakdown',
    },
    analytics: {
      title: 'Analytics & Activity',
      subtitle: 'Realized vs estimated savings, occupancy shift & platform event audit trail',
    },
  };

  const current = breadcrumbs[activeTab] || breadcrumbs.overview;

  return (
    <header className="bg-white border-b border-slate-200/90 px-4 py-3.5 md:px-8 md:py-4 flex items-center justify-between sticky top-0 z-30 select-none">
      {/* Left: Mobile Toggle + Page Heading */}
      <div className="flex items-center gap-3.5 min-w-0">
        <button
          onClick={onToggleSidebar}
          className="w-9 h-9 rounded-lg text-slate-500 hover:text-slate-800 hover:bg-slate-100 flex items-center justify-center transition-colors shrink-0"
          title="Toggle Navigation"
          aria-label="Toggle Navigation"
        >
          <Menu className="w-5 h-5 lg:hidden" />
          <PanelLeft className="w-5 h-5 hidden lg:block" />
        </button>

        <div className="min-w-0">
          <div className="flex items-center gap-1.5 text-xs text-slate-400 font-medium">
            <span>FleetRipple</span>
            <ChevronRight className="w-3.5 h-3.5 text-slate-300" />
            <span className="text-slate-700 font-semibold truncate">{current.title}</span>
          </div>
          <h1 className="text-xl md:text-2xl font-bold text-slate-900 tracking-tight leading-snug truncate">
            {current.title}
          </h1>
          <p className="text-sm text-slate-500 leading-normal hidden sm:block truncate">
            {current.subtitle}
          </p>
        </div>
      </div>

      {/* Right: Actions, Corridor Pill, Backend Status, Reset Demo */}
      <div className="flex items-center gap-2.5 md:gap-3 text-xs shrink-0">
        {/* Corridor Pill */}
        <div className="hidden xl:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-slate-50 border border-slate-200 text-slate-600 text-xs font-medium">
          <span className="w-2 h-2 rounded-full bg-teal-600" />
          <span>NH-16 Corridor</span>
          <span className="text-slate-400 font-mono text-xs">(Vizag ↔ Vijayawada)</span>
        </div>

        {/* Backend Live Status Pill */}
        <div
          className={`flex items-center gap-2 px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
            isBackendConnected
              ? 'bg-emerald-50/80 border-emerald-200 text-emerald-800'
              : 'bg-amber-50 border-amber-200 text-amber-800'
          }`}
          title={isBackendConnected ? 'FastAPI + SQLite backend connected' : 'Connecting to backend...'}
        >
          <span
            className={`w-2 h-2 rounded-full ${
              isBackendConnected ? 'bg-emerald-600' : 'bg-amber-500 animate-pulse'
            }`}
          />
          <span className="font-semibold hidden sm:inline">
            {isBackendConnected ? 'FastAPI Connected' : 'Connecting...'}
          </span>
          <span className="font-semibold sm:hidden">
            {isBackendConnected ? 'Live' : '...'}
          </span>
        </div>

        {/* Audit Drawer Trigger */}
        <button
          onClick={onOpenAuditDrawer}
          className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium text-slate-700 bg-white hover:bg-slate-50 rounded-lg border border-slate-200 transition-colors shadow-2xs"
          title="Open platform audit stream"
        >
          <FileText className="w-4 h-4 text-slate-500" />
          <span className="hidden md:inline">Activity</span>
          <span className="text-xs bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded font-mono font-semibold">
            {auditLogs.length}
          </span>
        </button>

        {/* Reset Demo Action */}
        <button
          onClick={handleReset}
          disabled={isLoading || resetConfirm}
          className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-lg border transition-colors shadow-2xs ${
            resetConfirm
              ? 'bg-emerald-50 border-emerald-300 text-emerald-800'
              : 'bg-white hover:bg-slate-50 border-slate-200 text-slate-700'
          }`}
          title="Reset database to baseline demonstration state"
        >
          {resetConfirm ? (
            <>
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span className="hidden sm:inline">Reset Applied</span>
            </>
          ) : (
            <>
              <RotateCcw className={`w-4 h-4 text-slate-400 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Reset Demo</span>
            </>
          )}
        </button>
      </div>
    </header>
  );
}
