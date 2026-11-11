import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  LayoutDashboard,
  Network,
  Activity,
  Users,
  Boxes,
  Wrench,
  Banknote,
  AlertTriangle,
} from 'lucide-react';

export const MobileNav: React.FC = () => {
  const { activeTab, setActiveTab, alerts } = useApp();
  const unreadAlerts = alerts.filter(a => !a.resolved).length;

  const items = [
    { id: 'overview', label: 'Home', icon: LayoutDashboard },
    { id: 'topology', label: 'Topology', icon: Network },
    { id: 'performance', label: 'Monitor', icon: Activity },
    { id: 'clients', label: 'Clients', icon: Users },
    { id: 'inventory', label: 'Stock', icon: Boxes },
    { id: 'alerts', label: 'Alerts', icon: AlertTriangle, badge: unreadAlerts },
    { id: 'maintenance', label: 'Maint', icon: Wrench },
    { id: 'expenses', label: 'Expenses', icon: Banknote },
  ];

  return (
    <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-slate-200 shadow-lg px-2 py-1.5 safe-area-bottom w-full max-w-full box-border">
      <div className="flex items-center justify-around overflow-x-auto gap-1 max-w-full">
        {items.map(item => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg text-[10px] font-medium transition-colors shrink-0 relative cursor-pointer ${
                isActive
                  ? 'text-sky-600 bg-sky-50'
                  : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
              }`}
            >
              <Icon className="w-4 h-4 mb-0.5" />
              <span className="whitespace-nowrap">{item.label}</span>
              {Boolean(item.badge && item.badge > 0) && (
                <span className="absolute top-0.5 right-1 w-3.5 h-3.5 text-[9px] font-bold text-white bg-rose-500 rounded-full flex items-center justify-center">
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};
