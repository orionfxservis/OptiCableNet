import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Receipt,
  ShieldAlert,
  Server,
  Menu,
} from 'lucide-react';

interface MobileNavProps {
  onOpenMenu?: () => void;
}

export const MobileNav: React.FC<MobileNavProps> = ({ onOpenMenu }) => {
  const { activeTab, setActiveTab } = useApp();

  const isTabActive = (tabId: string, aliases: string[] = []) => {
    return activeTab === tabId || aliases.includes(activeTab);
  };

  const quickItems = [
    { id: 'dashboard', aliases: ['overview'], label: 'Dashboard', icon: LayoutDashboard },
    { id: 'customers', aliases: ['clients'], label: 'Customers', icon: Users },
    { id: 'billing', aliases: [], label: 'Billing', icon: Receipt },
    { id: 'recovery', aliases: [], label: 'Recovery', icon: ShieldAlert },
    { id: 'network', aliases: ['topology', 'performance'], label: 'Network', icon: Server },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-slate-200 shadow-lg px-2 py-1 safe-area-bottom w-full max-w-full box-border">
      <div className="flex items-center justify-around gap-1 max-w-full">
        {quickItems.map(item => {
          const Icon = item.icon;
          const isActive = isTabActive(item.id, item.aliases);
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-medium transition-colors shrink-0 cursor-pointer ${
                isActive
                  ? 'text-sky-600 font-bold bg-sky-50'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="whitespace-nowrap">{item.label}</span>
            </button>
          );
        })}

        {/* All 14 Menu items trigger */}
        <button
          onClick={onOpenMenu}
          className="flex flex-col items-center justify-center py-1.5 px-2 rounded-lg text-[10px] font-semibold text-slate-700 hover:text-sky-600 hover:bg-slate-50 transition-colors shrink-0 cursor-pointer"
        >
          <Menu className="w-4 h-4 mb-0.5" />
          <span className="whitespace-nowrap">All Menu</span>
        </button>
      </div>
    </nav>
  );
};
