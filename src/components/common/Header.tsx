import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Laptop,
  PlusCircle,
  RotateCcw,
} from 'lucide-react';

interface HeaderProps {
  onOpenQuickPayment?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onOpenQuickPayment }) => {
  const {
    activeTab,
    setActiveTab,
    alerts,
    soundEnabled,
    setSoundEnabled,
    isMobileFieldMode,
    setIsMobileFieldMode,
    resetDemoData,
  } = useApp();

  const activeAlertsCount = alerts.filter(a => !a.resolved).length;
  const criticalAlertsCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;

  const navItems = [
    { id: 'overview', label: 'Dashboard' },
    { id: 'topology', label: 'Network Map' },
    { id: 'performance', label: 'Device Status' },
    { id: 'clients', label: 'Clients & Billing' },
    { id: 'inventory', label: 'Inventory & Audits' },
    { id: 'maintenance', label: 'Maintenance' },
    { id: 'staff', label: 'Staff' },
    { id: 'expenses', label: 'Expenses' },
  ];

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 w-full max-w-full overflow-hidden">
      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 w-full">
        <div className="flex items-center justify-between gap-2 sm:gap-4 lg:gap-6 h-16 w-full">
          {/* Zone 1: Brand Wordmark (Single text element) */}
          <div className="flex items-center gap-2 shrink-0">
            <button
              onClick={() => setActiveTab('overview')}
              className="text-left group cursor-pointer focus:outline-none flex items-center gap-2"
            >
              <div className="w-8 h-8 rounded-lg bg-sky-600 text-white flex items-center justify-center font-bold text-sm tracking-wider shadow-sm shrink-0">
                OC
              </div>
              <div>
                <span className="text-base font-bold text-slate-900 tracking-tight whitespace-nowrap block">
                  OptiCable Net
                </span>
                <span className="text-[10px] text-slate-500 font-medium whitespace-nowrap hidden sm:block">
                  Cable & ISP Operations
                </span>
              </div>
            </button>
          </div>

          {/* Zone 2: Clean single-line navigation links */}
          <nav className="hidden lg:flex items-center gap-2 xl:gap-4 text-xs xl:text-sm font-medium text-slate-600 overflow-hidden">
            {navItems.map(item => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={`cursor-pointer whitespace-nowrap transition-colors py-1 px-1 ${
                    isActive
                      ? 'text-sky-600 font-semibold border-b-2 border-sky-600'
                      : 'hover:text-slate-900'
                  }`}
                >
                  {item.label}
                </button>
              );
            })}
          </nav>

          {/* Zone 3: Quick Controls (Utilities only, Record Payment moved under menu) */}
          <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
            {/* Audio chime toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              title={soundEnabled ? 'Mute alert sound' : 'Enable alert sound'}
              aria-label={soundEnabled ? 'Mute alert sound' : 'Enable alert sound'}
              className="p-1.5 sm:p-2 text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer"
            >
              {soundEnabled ? (
                <Volume2 className="w-4 h-4 text-sky-600" />
              ) : (
                <VolumeX className="w-4 h-4 text-slate-400" />
              )}
            </button>

            {/* Field Tech Mobile Mode toggle */}
            <button
              onClick={() => setIsMobileFieldMode(!isMobileFieldMode)}
              title={isMobileFieldMode ? 'Exit Field Lineman Mode' : 'Switch to Field Lineman Touch Mode'}
              className={`hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 text-xs font-medium rounded-lg border transition-colors cursor-pointer ${
                isMobileFieldMode
                  ? 'bg-amber-50 border-amber-200 text-amber-900'
                  : 'bg-white border-slate-200 text-slate-700 hover:bg-slate-50'
              }`}
            >
              {isMobileFieldMode ? (
                <>
                  <Laptop className="w-3.5 h-3.5" />
                  <span>Desktop View</span>
                </>
              ) : (
                <>
                  <Smartphone className="w-3.5 h-3.5" />
                  <span>Field Mode</span>
                </>
              )}
            </button>

            {/* Alert Bell Button */}
            <button
              onClick={() => setActiveTab('alerts')}
              className={`relative p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'alerts'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Automated Network Alerts"
            >
              <Bell className="w-4 h-4" />
              {activeAlertsCount > 0 && (
                <span
                  className={`absolute top-0.5 right-0.5 sm:top-1 sm:right-1 w-4 h-4 text-[10px] font-bold text-white rounded-full flex items-center justify-center ${
                    criticalAlertsCount > 0 ? 'bg-rose-500' : 'bg-amber-500'
                  }`}
                >
                  {activeAlertsCount}
                </span>
              )}
            </button>

            {/* Reset Demo Data button */}
            <button
              onClick={() => {
                if (window.confirm('Reset sample records to initial state?')) {
                  resetDemoData();
                }
              }}
              title="Reset Sample Data"
              className="p-1.5 sm:p-2 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition-colors cursor-pointer hidden md:block"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};
