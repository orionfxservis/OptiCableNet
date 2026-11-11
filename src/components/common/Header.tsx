import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Bell,
  Volume2,
  VolumeX,
  Smartphone,
  Laptop,
  RotateCcw,
  Menu,
} from 'lucide-react';
import { MENU_ITEMS } from './SidebarNav';

interface HeaderProps {
  onToggleMenu?: () => void;
  onOpenQuickPayment?: () => void;
}

export const Header: React.FC<HeaderProps> = ({ onToggleMenu }) => {
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

  const currentItem = MENU_ITEMS.find(
    i => i.id === activeTab || (i.aliases && i.aliases.includes(activeTab))
  ) || MENU_ITEMS[0];

  return (
    <header className="shrink-0 z-20 bg-white/95 backdrop-blur-xs border-b border-slate-200 w-full overflow-hidden">
      <div className="w-full px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between gap-3 h-16 w-full">
          {/* Left: Mobile Menu Trigger + Active Section Title */}
          <div className="flex items-center gap-3 min-w-0">
            <button
              onClick={onToggleMenu}
              className="p-2 -ml-1 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg lg:hidden cursor-pointer"
              aria-label="Toggle navigation menu"
            >
              <Menu className="w-5 h-5" />
            </button>

            {/* Mobile Brand Logo */}
            <button
              onClick={() => setActiveTab('dashboard')}
              className="lg:hidden shrink-0 flex items-center cursor-pointer"
            >
              <img
                src="./logo.png"
                alt="OptiCable Net"
                className="h-8 w-auto object-contain max-w-[140px]"
              />
            </button>

            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-400 hidden sm:inline">OptiCable Net /</span>
                <h2 className="text-sm sm:text-base font-bold text-slate-900 tracking-tight truncate">
                  {currentItem.title}
                </h2>
              </div>
              <p className="text-[11px] text-slate-500 truncate hidden md:block">
                {currentItem.subtitle}
              </p>
            </div>
          </div>

          {/* Right: Quick Controls */}
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
              onClick={() => setActiveTab('complaints')}
              className={`relative p-1.5 sm:p-2 rounded-lg transition-colors cursor-pointer ${
                activeTab === 'complaints' || activeTab === 'alerts'
                  ? 'bg-slate-100 text-slate-900'
                  : 'text-slate-500 hover:text-slate-800 hover:bg-slate-100'
              }`}
              title="Automated Network & Ticket Alerts"
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
