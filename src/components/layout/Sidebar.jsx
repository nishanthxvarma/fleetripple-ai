import React from 'react';
import {
  Compass,
  ShieldAlert,
  GitMerge,
  MessageSquareCheck,
  Truck,
  BarChart2,
  Waves,
  Radio,
  ChevronLeft,
  ChevronRight,
  X,
} from 'lucide-react';
import { useFleetRipple } from '../../context/FleetRippleContext';

export function Sidebar({
  isCollapsed = false,
  onToggleCollapse,
  isMobileOpen = false,
  onCloseMobile,
}) {
  const {
    activeTab,
    setActiveTab,
    activeBreakdownsCount,
    unassignedPassengersCount,
    pendingOperatorAgreementsCount,
  } = useFleetRipple();

  const navItems = [
    {
      id: 'overview',
      label: 'Command Centre',
      icon: Compass,
      urgentCount: null,
    },
    {
      id: 'rippleops',
      label: 'RippleOps AI',
      icon: ShieldAlert,
      urgentCount: activeBreakdownsCount > 0 ? activeBreakdownsCount : null,
      urgentColor: 'rose',
    },
    {
      id: 'tripmerge',
      label: 'TripMerge Guardian',
      icon: GitMerge,
      urgentCount: pendingOperatorAgreementsCount > 0 ? pendingOperatorAgreementsCount : null,
      urgentColor: 'teal',
    },
    {
      id: 'passenger',
      label: 'Passenger Communications',
      icon: MessageSquareCheck,
      urgentCount: unassignedPassengersCount > 0 ? unassignedPassengersCount : null,
      urgentColor: 'amber',
    },
    {
      id: 'fleet',
      label: 'Fleet Directory',
      icon: Truck,
      urgentCount: null,
    },
    {
      id: 'analytics',
      label: 'Analytics & Activity',
      icon: BarChart2,
      urgentCount: null,
    },
  ];

  const handleNavClick = (id) => {
    setActiveTab(id);
    if (onCloseMobile) onCloseMobile();
  };

  return (
    <>
      {/* Mobile Backdrop Overlay */}
      {isMobileOpen && (
        <div
          onClick={onCloseMobile}
          className="fixed inset-0 bg-slate-900/40 z-40 lg:hidden backdrop-blur-2xs transition-opacity"
        />
      )}

      {/* Sidebar Container */}
      <aside
        className={`fixed lg:static inset-y-0 left-0 z-50 bg-white border-r border-slate-200/90 flex flex-col shrink-0 select-none transition-all duration-200 ease-in-out ${
          isMobileOpen
            ? 'translate-x-0 w-64 shadow-xl'
            : '-translate-x-full lg:translate-x-0'
        } ${isCollapsed ? 'lg:w-[68px]' : 'lg:w-64'}`}
      >
        {/* Brand Header */}
        <div className="h-16 px-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0 shadow-2xs">
              <Waves className="w-5 h-5 stroke-[2.4]" />
            </div>
            {!isCollapsed && (
              <div className="truncate">
                <div className="flex items-center gap-1.5">
                  <span className="text-[15px] font-bold text-slate-900 tracking-tight">FleetRipple</span>
                  <span className="text-xs font-mono font-semibold px-1.5 py-0.5 rounded bg-slate-100 text-slate-600 border border-slate-200">
                    AI
                  </span>
                </div>
                <p className="text-xs text-slate-400 font-medium truncate">Operations & Brokerage</p>
              </div>
            )}
          </div>

          {/* Desktop Collapse Button */}
          <div className="flex items-center">
            <button
              onClick={onToggleCollapse}
              className="hidden lg:flex w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 items-center justify-center transition-colors"
              title={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
              aria-label={isCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
              {isCollapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
            </button>

            {/* Mobile Close Button */}
            <button
              onClick={onCloseMobile}
              className="lg:hidden w-8 h-8 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 flex items-center justify-center"
              aria-label="Close sidebar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation List */}
        <nav className="p-3 space-y-1.5 flex-1 overflow-y-auto">
          {!isCollapsed && (
            <div className="px-3 pt-2 pb-1 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Workspaces
            </div>
          )}

          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                title={isCollapsed ? item.label : undefined}
                className={`w-full text-left rounded-lg transition-all flex items-center justify-between group ${
                  isCollapsed ? 'p-3 justify-center' : 'px-3.5 py-2.5'
                } ${
                  isActive
                    ? 'bg-slate-100 text-slate-900 font-semibold'
                    : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900 font-normal'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-5 h-5 shrink-0 transition-colors ${
                      isActive
                        ? 'text-teal-700'
                        : 'text-slate-400 group-hover:text-slate-600'
                    }`}
                  />
                  {!isCollapsed && (
                    <span className="truncate leading-tight text-[15px]">{item.label}</span>
                  )}
                </div>

                {!isCollapsed && item.urgentCount && (
                  <span
                    className={`ml-2 text-xs px-2 py-0.5 rounded-full font-mono font-bold shrink-0 ${
                      item.urgentColor === 'rose'
                        ? 'bg-rose-50 text-rose-700 border border-rose-200'
                        : item.urgentColor === 'teal'
                        ? 'bg-teal-50 text-teal-700 border border-teal-200'
                        : 'bg-amber-50 text-amber-700 border border-amber-200'
                    }`}
                  >
                    {item.urgentCount}
                  </span>
                )}
              </button>
            );
          })}
        </nav>

        {/* Corridor Indicator Footer */}
        <div className="p-3 border-t border-slate-100 text-xs bg-slate-50/60">
          {!isCollapsed ? (
            <div className="p-2.5 rounded-lg bg-white border border-slate-200/80 shadow-2xs space-y-1">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-xs font-semibold text-slate-700">
                  <Radio className="w-3.5 h-3.5 text-emerald-600" />
                  Corridor Live
                </span>
                <span className="text-xs font-mono text-teal-700 bg-teal-50 px-1.5 py-0.5 rounded border border-teal-200 font-medium">
                  NH-16
                </span>
              </div>
              <p className="text-xs text-slate-500 font-medium truncate">
                Vizag ↔ Vijayawada
              </p>
            </div>
          ) : (
            <div className="flex justify-center" title="NH-16 Corridor Live">
              <Radio className="w-4 h-4 text-emerald-600" />
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
