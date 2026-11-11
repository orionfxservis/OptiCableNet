import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Users,
  Package,
  Receipt,
  ShieldAlert,
  LifeBuoy,
  Wrench,
  Server,
  Users2,
  Wallet,
  Boxes,
  UserCheck,
  BarChart3,
  Settings,
  ChevronRight,
  Wifi,
  X,
} from 'lucide-react';

export interface MenuItem {
  id: string;
  aliases?: string[];
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: string;
  badgeColor?: string;
}

export const MENU_ITEMS: MenuItem[] = [
  {
    id: 'dashboard',
    aliases: ['overview'],
    title: 'Dashboard',
    subtitle: 'Business overview and statistics',
    icon: LayoutDashboard,
  },
  {
    id: 'customers',
    aliases: ['clients'],
    title: 'Customers',
    subtitle: 'Subscribers, new connections, customer portal',
    icon: Users,
  },
  {
    id: 'packages',
    title: 'Packages',
    subtitle: 'Internet and cable TV packages',
    icon: Package,
  },
  {
    id: 'billing',
    title: 'Billing & Payments',
    subtitle: 'Invoices, collections, defaulters',
    icon: Receipt,
  },
  {
    id: 'recovery',
    title: 'Recovery',
    subtitle: 'Recovery staff and field collections',
    icon: ShieldAlert,
    badge: 'Field',
    badgeColor: 'bg-rose-100 text-rose-700',
  },
  {
    id: 'complaints',
    title: 'Complaints',
    subtitle: 'Tickets and technical support',
    icon: LifeBuoy,
  },
  {
    id: 'operations',
    aliases: ['maintenance'],
    title: 'Field Operations',
    subtitle: 'Technicians, installations and jobs',
    icon: Wrench,
  },
  {
    id: 'network',
    aliases: ['topology', 'performance'],
    title: 'Network',
    subtitle: 'MikroTik, PPPoE, OLT and ONU',
    icon: Server,
  },
  {
    id: 'dealers',
    title: 'Dealers',
    subtitle: 'Resellers and commissions',
    icon: Users2,
  },
  {
    id: 'accounts',
    aliases: ['expenses'],
    title: 'Accounts',
    subtitle: 'Income, expenses and reports',
    icon: Wallet,
  },
  {
    id: 'inventory',
    title: 'Inventory',
    subtitle: 'Equipment and stock',
    icon: Boxes,
  },
  {
    id: 'staff',
    title: 'HR & Staff',
    subtitle: 'Attendance and payroll',
    icon: UserCheck,
  },
  {
    id: 'reports',
    title: 'Reports',
    subtitle: 'Business and performance analytics',
    icon: BarChart3,
  },
  {
    id: 'settings',
    title: 'Settings',
    subtitle: 'Company, users, roles and integrations',
    icon: Settings,
  },
];

interface SidebarNavProps {
  isMobileOpen?: boolean;
  onCloseMobile?: () => void;
}

export const SidebarNav: React.FC<SidebarNavProps> = ({ isMobileOpen, onCloseMobile }) => {
  const { activeTab, setActiveTab } = useApp();

  const isCurrentActive = (item: MenuItem) => {
    if (activeTab === item.id) return true;
    if (item.aliases && item.aliases.includes(activeTab)) return true;
    return false;
  };

  const handleSelect = (itemId: string) => {
    setActiveTab(itemId);
    if (onCloseMobile) onCloseMobile();
  };

  const navContent = (
    <div className="flex flex-col h-full bg-white border-r border-slate-200 select-none">
      {/* Brand Header */}
      <div className="p-4 border-b border-slate-200 flex items-center justify-between">
        <button
          onClick={() => handleSelect('dashboard')}
          className="flex items-center text-left group cursor-pointer focus:outline-none"
        >
          <img
            src="./logo.png"
            alt="OptiCable Net"
            className="h-11 w-auto max-w-[210px] object-contain group-hover:scale-[1.02] transition-transform"
          />
        </button>

        {onCloseMobile && (
          <button
            onClick={onCloseMobile}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 lg:hidden cursor-pointer"
            aria-label="Close navigation"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      {/* Navigation Scroll Area */}
      <div className="flex-1 overflow-y-auto py-3 px-2.5 space-y-1">
        {/* Section Header: Suggested */}
        <div className="px-2.5 pt-1 pb-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-slate-400">
            Suggested
          </span>
        </div>

        {/* 14 Menu Items with Title and Subtitle */}
        {MENU_ITEMS.map(item => {
          const active = isCurrentActive(item);
          const Icon = item.icon;

          return (
            <button
              key={item.id}
              onClick={() => handleSelect(item.id)}
              className={`w-full text-left rounded-xl p-2.5 transition-all flex items-start gap-3 cursor-pointer group relative ${
                active
                  ? 'bg-sky-50/80 text-sky-950 font-semibold shadow-xs ring-1 ring-sky-500/20'
                  : 'text-slate-700 hover:bg-slate-50 hover:text-slate-900'
              }`}
            >
              {/* Active left bar indicator */}
              {active && (
                <div className="absolute left-0 top-2 bottom-2 w-1 bg-sky-600 rounded-r-full" />
              )}

              {/* Icon */}
              <div
                className={`p-2 rounded-lg shrink-0 transition-colors ${
                  active
                    ? 'bg-sky-600 text-white shadow-xs'
                    : 'bg-slate-100 text-slate-600 group-hover:bg-slate-200 group-hover:text-slate-900'
                }`}
              >
                <Icon className="w-4 h-4" />
              </div>

              {/* Title & Subtitle */}
              <div className="flex-1 min-w-0 pr-1">
                <div className="flex items-center justify-between gap-1">
                  <span
                    className={`text-xs tracking-tight truncate block ${
                      active ? 'font-bold text-slate-900' : 'font-semibold text-slate-800'
                    }`}
                  >
                    {item.title}
                  </span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full uppercase shrink-0 ${
                        item.badgeColor || 'bg-slate-100 text-slate-600'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </div>
                <span className="text-[11px] text-slate-500 leading-tight line-clamp-1 mt-0.5 block font-normal">
                  {item.subtitle}
                </span>
              </div>
            </button>
          );
        })}
      </div>

      {/* Footer info within sidebar */}
      <div className="p-3 border-t border-slate-200 bg-slate-50/70 text-[10px] text-slate-500">
        <div className="font-semibold text-slate-700 truncate">
          Orionfx.net Systems
        </div>
        <div className="text-slate-400 truncate">
          Operational Currency: Pak Rs. (Rs.)
        </div>
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="hidden lg:block w-72 shrink-0 h-full z-30">
        {navContent}
      </aside>

      {/* Mobile Drawer Overlay */}
      {isMobileOpen && (
        <div className="fixed inset-0 z-50 lg:hidden">
          <div
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-xs transition-opacity"
            onClick={onCloseMobile}
          />
          <div className="fixed inset-y-0 left-0 w-80 max-w-[85vw] bg-white shadow-2xl z-10 animate-in slide-in-from-left duration-200">
            {navContent}
          </div>
        </div>
      )}
    </>
  );
};
