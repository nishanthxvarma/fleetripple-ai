import React, { useState } from 'react';
import { FleetRippleProvider, useFleetRipple } from './context/FleetRippleContext';
import { Sidebar } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { AuditDrawer } from './components/layout/AuditDrawer';
import { OverviewDashboard } from './components/overview/OverviewDashboard';
import { RippleOpsView } from './components/rippleops/RippleOpsView';
import { TripMergeView } from './components/tripmerge/TripMergeView';
import { PassengerPortalView } from './components/passenger/PassengerPortalView';
import { FleetManagementView } from './components/fleet/FleetManagementView';
import { AnalyticsView } from './components/analytics/AnalyticsView';
import { ErrorBoundary } from './components/common/ErrorBoundary';

function AppContent() {
  const { activeTab } = useFleetRipple();
  const [isAuditDrawerOpen, setIsAuditDrawerOpen] = useState(false);
  const [isSidebarCollapsed, setIsSidebarCollapsed] = useState(false);
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex h-screen bg-[#F8FAFC] overflow-hidden text-slate-900 font-sans antialiased">
      {/* Sidebar Navigation (Collapsible & Mobile Responsive) */}
      <Sidebar
        isCollapsed={isSidebarCollapsed}
        onToggleCollapse={() => setIsSidebarCollapsed((prev) => !prev)}
        isMobileOpen={isMobileSidebarOpen}
        onCloseMobile={() => setIsMobileSidebarOpen(false)}
      />

      {/* Main Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden bg-[#F8FAFC]">
        {/* Header with Title and Global Demo Controls */}
        <Header
          onOpenAuditDrawer={() => setIsAuditDrawerOpen(true)}
          onToggleSidebar={() => {
            // If window is mobile, toggle mobile drawer; else toggle collapse
            if (window.innerWidth < 1024) {
              setIsMobileSidebarOpen((prev) => !prev);
            } else {
              setIsSidebarCollapsed((prev) => !prev);
            }
          }}
          isSidebarCollapsed={isSidebarCollapsed}
        />

        {/* Dynamic Workflow Views */}
        <main className="flex-1 overflow-y-auto px-4 py-5 md:px-8 md:py-6">
          <div className="max-w-7xl mx-auto pb-16">
            <ErrorBoundary>
              {activeTab === 'overview' && <OverviewDashboard />}
              {activeTab === 'rippleops' && <RippleOpsView />}
              {activeTab === 'tripmerge' && <TripMergeView />}
              {activeTab === 'passenger' && <PassengerPortalView />}
              {activeTab === 'fleet' && <FleetManagementView />}
              {activeTab === 'analytics' && <AnalyticsView />}
            </ErrorBoundary>
          </div>
        </main>
      </div>

      {/* Real-time Audit & Activity Log Drawer */}
      <AuditDrawer
        isOpen={isAuditDrawerOpen}
        onClose={() => setIsAuditDrawerOpen(false)}
      />
    </div>
  );
}

export default function App() {
  return (
    <FleetRippleProvider>
      <AppContent />
    </FleetRippleProvider>
  );
}
