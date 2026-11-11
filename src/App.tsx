/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Header } from './components/common/Header';
import { SidebarNav } from './components/common/SidebarNav';
import { MobileNav } from './components/common/MobileNav';

// View Components for the 14 Menu Sections
import { OverviewView } from './components/dashboard/OverviewView';
import { ClientsView } from './components/clients/ClientsView';
import { PackagesView } from './components/packages/PackagesView';
import { BillingView } from './components/billing/BillingView';
import { RecoveryView } from './components/recovery/RecoveryView';
import { ComplaintsView } from './components/complaints/ComplaintsView';
import { MaintenanceView } from './components/maintenance/MaintenanceView';
import { NetworkView } from './components/network/NetworkView';
import { DealersView } from './components/dealers/DealersView';
import { ExpensesView } from './components/expenses/ExpensesView';
import { InventoryView } from './components/inventory/InventoryView';
import { StaffView } from './components/staff/StaffView';
import { ReportsView } from './components/reports/ReportsView';
import { SettingsView } from './components/settings/SettingsView';

import { Client } from './types';

const MainContent: React.FC = () => {
  const { activeTab, setActiveTab, isMobileFieldMode, clients } = useApp();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const [paymentClientId, setPaymentClientId] = useState<string | undefined>(undefined);
  const [paymentTrigger, setPaymentTrigger] = useState<number>(0);
  const [alertTargetClient, setAlertTargetClient] = useState<Client | null>(null);

  const handleOpenQuickPayment = (clientId?: string) => {
    const targetId = clientId || clients.find(c => c.balanceDue > 0)?.id || clients[0]?.id;
    setPaymentClientId(targetId);
    setPaymentTrigger(prev => prev + 1);
    setActiveTab('customers');
  };

  const handleOpenPaymentAlert = (client: unknown) => {
    setAlertTargetClient(client as Client);
    setActiveTab('customers');
  };

  return (
    <div
      className={`h-screen w-full flex flex-col lg:flex-row bg-slate-50 text-slate-900 overflow-hidden ${
        isMobileFieldMode ? 'max-w-md mx-auto shadow-2xl border-x border-slate-300' : ''
      }`}
    >
      {/* 14-Item Left Sidebar Navigation: Fixed in place */}
      <SidebarNav
        isMobileOpen={isMobileMenuOpen}
        onCloseMobile={() => setIsMobileMenuOpen(false)}
      />

      {/* Main Column (Fixed Top Header + Dedicated Scrollable Content Area) */}
      <div className="flex-1 flex flex-col h-full min-w-0 overflow-hidden">
        {/* Top Header: Fixed, never scrolls with the page */}
        <Header
          onToggleMenu={() => setIsMobileMenuOpen(prev => !prev)}
          onOpenQuickPayment={() => handleOpenQuickPayment()}
        />

        {/* Scrollable View Area: Only this section scrolls up and down */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden flex flex-col min-h-0">
          <main className="flex-1 max-w-7xl w-full mx-auto px-3 sm:px-6 lg:px-8 pt-4 sm:pt-6 overflow-x-hidden">
            {(activeTab === 'dashboard' || activeTab === 'overview') && (
              <OverviewView
                onOpenQuickPayment={handleOpenQuickPayment}
                onOpenPaymentAlert={handleOpenPaymentAlert}
              />
            )}

            {(activeTab === 'customers' || activeTab === 'clients') && (
              <ClientsView
                initialSelectedClientId={paymentClientId}
                openPaymentTrigger={paymentTrigger}
                paymentAlertClient={alertTargetClient}
                onClosePaymentAlert={() => setAlertTargetClient(null)}
                onOpenQuickPayment={handleOpenQuickPayment}
              />
            )}

            {activeTab === 'packages' && <PackagesView />}

            {activeTab === 'billing' && (
              <BillingView onOpenQuickPayment={handleOpenQuickPayment} />
            )}

            {activeTab === 'recovery' && (
              <RecoveryView onOpenQuickPayment={handleOpenQuickPayment} />
            )}

            {(activeTab === 'complaints' || activeTab === 'alerts') && (
              <ComplaintsView />
            )}

            {(activeTab === 'operations' || activeTab === 'maintenance') && (
              <MaintenanceView />
            )}

            {(activeTab === 'network' || activeTab === 'topology' || activeTab === 'performance') && (
              <NetworkView />
            )}

            {activeTab === 'dealers' && <DealersView />}

            {(activeTab === 'accounts' || activeTab === 'expenses') && (
              <ExpensesView />
            )}

            {activeTab === 'inventory' && <InventoryView />}

            {activeTab === 'staff' && <StaffView />}

            {activeTab === 'reports' && <ReportsView />}

            {activeTab === 'settings' && <SettingsView />}
          </main>

          {/* Footer at bottom of scrollable content */}
          <footer className="bg-white border-t border-slate-200 py-4 text-center text-xs text-slate-500 mb-14 lg:mb-0 shrink-0">
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
        </div>

        {/* Mobile Bottom Navigation */}
        <MobileNav onOpenMenu={() => setIsMobileMenuOpen(true)} />
      </div>
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
