import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './auth/AuthContext.js';
import { LoginPage } from './pages/LoginPage.js';
import { Layout } from './components/layout/Layout.js';
import type { NavItemKey } from './components/layout/Sidebar.js';
import { DashboardView } from './pages/DashboardView.js';
import { ScanProductView } from './pages/ScanProductView.js';
import { InspectionsView } from './pages/InspectionsView.js';
import { ProductsView } from './pages/ProductsView.js';
import { ViolationsView } from './pages/ViolationsView.js';
import { ReportsView } from './pages/ReportsView.js';
import { AnalyticsView } from './pages/AnalyticsView.js';
import { RulesView } from './pages/RulesView.js';
import { SettingsView } from './pages/SettingsView.js';
import { ManufacturerPreCheckView } from './pages/ManufacturerPreCheckView.js';
import { LoadingState } from './components/ui/LoadingState.js';
import { NetworkSyncProvider } from './offline/NetworkSyncContext.js';

const AppShell: React.FC = () => {
  const { isAuthenticated, isLoading, canAccess } = useAuth();
  const [activeTab, setActiveTab] = useState<NavItemKey>('Dashboard');

  // Ensure user cannot stay on an unauthorized tab if their role changes
  useEffect(() => {
    if (!canAccess(activeTab)) {
      setActiveTab('Dashboard');
    }
  }, [canAccess, activeTab]);

  if (isLoading) {
    return (
      <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <LoadingState message="Verifying Government Security Credentials..." subtext="Loading Legal Metrology Session" />
      </div>
    );
  }

  if (!isAuthenticated) {
    return <LoginPage />;
  }

  const renderActiveView = () => {
    switch (activeTab) {
      case 'Dashboard':
        return <DashboardView onNavigate={setActiveTab} />;
      case 'Scan Product':
        return <ScanProductView />;
      case 'Pre-Check':
        return <ManufacturerPreCheckView />;
      case 'Inspections':
        return <InspectionsView />;
      case 'Products':
        return <ProductsView />;
      case 'Violations':
        return <ViolationsView />;
      case 'Reports':
        return <ReportsView />;
      case 'Analytics':
        return <AnalyticsView />;
      case 'Rules':
        return <RulesView />;
      case 'Settings':
        return <SettingsView />;
      default:
        return <DashboardView onNavigate={setActiveTab} />;
    }
  };

  return (
    <Layout activeTab={activeTab} onSelectTab={setActiveTab}>
      {renderActiveView()}
    </Layout>
  );
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <NetworkSyncProvider>
        <AppShell />
      </NetworkSyncProvider>
    </AuthProvider>
  );
};

export default App;
