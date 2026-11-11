/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { MobileNav } from './components/common/MobileNav';
import { OverviewView } from './components/dashboard/OverviewView';
import { TopologyView } from './components/topology/TopologyView';
import { PerformanceView } from './components/performance/PerformanceView';
import { AlertsView } from './components/alerts/AlertsView';
import { InventoryView } from './components/inventory/InventoryView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { ClientsView } from './components/clients/ClientsView';
import { StaffView } from './components/staff/StaffView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { Client } from './types';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isMobileFieldMode, clients } = useApp();

  const [paymentClientId, setPaymentClientId] = useState<string | undefined>(undefined);
  const [paymentTrigger, setPaymentTrigger] = useState<number>(0);
  const [alertTargetClient, setAlertTargetClient] = useState<Client | null>(null);

  const handleOpenQuickPayment = (clientId?: string) => {
    const targetId = clientId || clients.find(c => c.balanceDue > 0)?.id || clients[0]?.id;
    setPaymentClientId(targetId);
    setPaymentTrigger(prev => prev + 1);
    setActiveTab('clients');
  };

  const handleOpenPaymentAlert = (client: unknown) => {
    setAlertTargetClient(client as Client);
    setActiveTab('clients');
  };

  return (
    <div className={`min-h-screen bg-slate-50 text-slate-900 flex flex-col w-full max-w-full overflow-x-hidden ${isMobileFieldMode ? 'max-w-md mx-auto shadow-2xl border-x border-slate-300' : ''}`}>
      {/* Top Header */}
      <Header />

      {/* Main View Area (Strictly vertical scrolling) */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 overflow-x-hidden">
        {activeTab === 'overview' && (
          <OverviewView
            onOpenQuickPayment={handleOpenQuickPayment}
            onOpenPaymentAlert={handleOpenPaymentAlert}
          />
        )}
        {activeTab === 'topology' && <TopologyView />}
        {activeTab === 'performance' && <PerformanceView />}
        {activeTab === 'alerts' && <AlertsView />}
        {activeTab === 'inventory' && <InventoryView />}
        {activeTab === 'maintenance' && <MaintenanceView />}
        {activeTab === 'clients' && (
          <ClientsView
            initialSelectedClientId={paymentClientId}
            openPaymentTrigger={paymentTrigger}
            paymentAlertClient={alertTargetClient}
            onClosePaymentAlert={() => setAlertTargetClient(null)}
            onOpenQuickPayment={handleOpenQuickPayment}
          />
        )}
        {activeTab === 'staff' && <StaffView />}
        {activeTab === 'expenses' && <ExpensesView />}
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mb-14 lg:mb-0">
        <div className="max-w-7xl mx-auto px-4 flex flex-col sm:flex-row items-center justify-between gap-2">
          <span>
            OptiCable Net Management System · Real-Time ISP & Cable Operations - All Rights Reserve - Project of{' '}
            <a
              href="https://orionfx.net"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-slate-700 hover:text-sky-600 transition-colors"
            >
              Orionfx.net
            </a>
          </span>
          <span className="font-mono text-[11px] text-slate-400">
            Network Status: Nominal · Low Optical Loss Guarantee
          </span>
        </div>
      </footer>

      {/* Mobile Bottom Navigation */}
      <MobileNav />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainContent />
    </AppProvider>
  );
}
