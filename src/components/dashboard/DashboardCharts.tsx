import React, { useState } from 'react';
import { Client, PaymentRecord, NetworkNode, CableRun } from '../../types';
import { Banknote, Users, Activity, TrendingUp, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

interface DashboardChartsProps {
  clients: Client[];
  payments: PaymentRecord[];
  nodes: NetworkNode[];
  cableRuns: CableRun[];
  totalMonthlyBilled: number;
  currentMonthCollections: number;
  totalOutstandingDues: number;
  onNavigateTab: (tabId: string) => void;
}

export const DashboardCharts: React.FC<DashboardChartsProps> = ({
  clients,
  payments,
  nodes,
  totalMonthlyBilled,
  currentMonthCollections,
  totalOutstandingDues,
  onNavigateTab,
}) => {
  const [hoveredSubSlice, setHoveredSubSlice] = useState<string | null>(null);
  const [hoveredPaySlice, setHoveredPaySlice] = useState<string | null>(null);

  // 1. Subscriber Status Calculation
  const activeCount = clients.filter(c => c.status === 'active').length;
  const expiringCount = clients.filter(c => c.status === 'expiring_soon').length;
  const expiredCount = clients.filter(c => c.status === 'expired' || c.status === 'suspended').length;
  const totalClients = Math.max(1, clients.length);

  const subscriberSlices = [
    {
      id: 'active',
      label: 'Active & Paid',
      value: activeCount,
      color: '#10b981', // emerald-500
      bgClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      dotClass: 'bg-emerald-500',
    },
    {
      id: 'expiring',
      label: 'Expiring Soon (<=3d)',
      value: expiringCount,
      color: '#f59e0b', // amber-500
      bgClass: 'bg-amber-50 text-amber-800 border-amber-200',
      dotClass: 'bg-amber-500',
    },
    {
      id: 'expired',
      label: 'Expired / Grace',
      value: expiredCount,
      color: '#f43f5e', // rose-500
      bgClass: 'bg-rose-50 text-rose-800 border-rose-200',
      dotClass: 'bg-rose-500',
    },
  ];

  // 2. Payment Method Revenue Breakdown Calculation
  const methodTotals: Record<string, number> = {
    'Cash at Doorstep': 0,
    'Bank Wire / Transfer': 0,
    'Easypaisa': 0,
    'JazzCash': 0,
  };

  payments.forEach(p => {
    if (methodTotals[p.paymentMethod] !== undefined) {
      methodTotals[p.paymentMethod] += p.amount;
    } else {
      // Map legacy or unassigned
      if (p.paymentMethod.toLowerCase().includes('cash')) {
        methodTotals['Cash at Doorstep'] += p.amount;
      } else if (p.paymentMethod.toLowerCase().includes('bank')) {
        methodTotals['Bank Wire / Transfer'] += p.amount;
      } else if (p.paymentMethod.toLowerCase().includes('easy')) {
        methodTotals['Easypaisa'] += p.amount;
      } else if (p.paymentMethod.toLowerCase().includes('jazz')) {
        methodTotals['JazzCash'] += p.amount;
      } else {
        methodTotals['Bank Wire / Transfer'] += p.amount;
      }
    }
  });

  const totalCollectedFromMethods = Math.max(
    1,
    Object.values(methodTotals).reduce((a, b) => a + b, 0)
  );

  const paymentSlices = [
    {
      id: 'Cash at Doorstep',
      label: 'Cash at Doorstep',
      value: methodTotals['Cash at Doorstep'],
      color: '#f59e0b', // amber-500
      dotClass: 'bg-amber-500',
    },
    {
      id: 'Bank Wire / Transfer',
      label: 'Bank Wire / Transfer',
      value: methodTotals['Bank Wire / Transfer'],
      color: '#0284c7', // sky-600
      dotClass: 'bg-sky-600',
    },
    {
      id: 'Easypaisa',
      label: 'Easypaisa',
      value: methodTotals['Easypaisa'],
      color: '#10b981', // emerald-500
      dotClass: 'bg-emerald-500',
    },
    {
      id: 'JazzCash',
      label: 'JazzCash',
      value: methodTotals['JazzCash'],
      color: '#e11d48', // rose-600
      dotClass: 'bg-rose-600',
    },
  ];

  // Optical Node Health Status
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const degradedNodes = nodes.filter(n => n.status === 'degraded').length;
  const offlineNodes = nodes.filter(n => n.status === 'offline').length;

  // Collection Target Progress %
  const collectionTargetPercent = Math.min(
    100,
    Math.round((currentMonthCollections / Math.max(1, totalMonthlyBilled)) * 100)
  );

  // SVG Donut Math
  const radius = 42;
  const circumference = 2 * Math.PI * radius;

  // Compute SVG stroke-dasharray offsets for subscribers
  let accumulatedSubPercent = 0;
  const subDonutSegments = subscriberSlices.map(slice => {
    const percent = slice.value / totalClients;
    const strokeLength = percent * circumference;
    const offset = -accumulatedSubPercent * circumference;
    accumulatedSubPercent += percent;
    return {
      ...slice,
      percent,
      strokeLength,
      offset,
    };
  });

  // Compute SVG stroke-dasharray offsets for payments
  let accumulatedPayPercent = 0;
  const payDonutSegments = paymentSlices.map(slice => {
    const percent = slice.value / totalCollectedFromMethods;
    const strokeLength = percent * circumference;
    const offset = -accumulatedPayPercent * circumference;
    accumulatedPayPercent += percent;
    return {
      ...slice,
      percent,
      strokeLength,
      offset,
    };
  });

  return (
    <div className="space-y-4">
      {/* Live System Details & Workflow Overview Strip */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
              <Activity className="w-4 h-4 text-sky-600" />
              <span>Real-Time System Workflow & Analytics</span>
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Live client lifecycle distribution, collection channels in Pak Rs., and optical network throughput.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <span className="flex items-center gap-1.5 text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-md font-medium border border-emerald-200/80">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span>System Live: 100% Synced</span>
            </span>
          </div>
        </div>

        {/* Live System Progress Gauges */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-3.5">
          {/* Target 1: Monthly Collection Pace */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Monthly Billing Target</span>
              <span className="font-bold font-mono text-emerald-700">{collectionTargetPercent}%</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-emerald-500 h-2 rounded-full transition-all duration-500"
                style={{ width: `${collectionTargetPercent}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
              <span>Collected: <strong className="text-slate-800">Rs. {currentMonthCollections.toLocaleString()}</strong></span>
              <span>Target: <strong className="text-slate-800">Rs. {totalMonthlyBilled.toLocaleString()}</strong></span>
            </div>
          </div>

          {/* Target 2: Optical Distribution Health */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Optical Nodes Online</span>
              <span className="font-bold font-mono text-sky-700">{onlineNodes} / {nodes.length}</span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden flex">
              <div
                className="bg-emerald-500 h-2"
                style={{ width: `${(onlineNodes / Math.max(1, nodes.length)) * 100}%` }}
              />
              <div
                className="bg-amber-400 h-2"
                style={{ width: `${(degradedNodes / Math.max(1, nodes.length)) * 100}%` }}
              />
              <div
                className="bg-rose-500 h-2"
                style={{ width: `${(offlineNodes / Math.max(1, nodes.length)) * 100}%` }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
              <span className="text-emerald-700 font-medium">{onlineNodes} Optimal</span>
              <span className="text-amber-700 font-medium">{degradedNodes} High Loss</span>
              <span className="text-rose-700 font-medium">{offlineNodes} Cut</span>
            </div>
          </div>

          {/* Target 3: Outstanding vs Collected Ratio */}
          <div className="bg-slate-50/70 border border-slate-200/80 rounded-lg p-3">
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="font-semibold text-slate-700">Dues Realization</span>
              <span className="font-bold font-mono text-amber-700">
                Rs. {totalOutstandingDues.toLocaleString()} Pending
              </span>
            </div>
            <div className="w-full bg-slate-200 rounded-full h-2 overflow-hidden">
              <div
                className="bg-sky-500 h-2 rounded-full transition-all duration-500"
                style={{
                  width: `${Math.round(
                    (currentMonthCollections /
                      Math.max(1, currentMonthCollections + totalOutstandingDues)) *
                      100
                  )}%`,
                }}
              />
            </div>
            <div className="flex justify-between items-center text-[11px] text-slate-500 mt-1.5">
              <span className="text-sky-700 font-medium">Active Dues Ledger</span>
              <button
                onClick={() => onNavigateTab('clients')}
                className="text-[11px] font-semibold text-sky-600 hover:text-sky-700 inline-flex items-center gap-0.5 cursor-pointer"
              >
                <span>View Dues</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Two Graphical Visualizations (Donut/Pie Charts) */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* CHART 1: Client Subscription & Expiry Distribution */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Users className="w-4 h-4 text-sky-600" />
                  <span>Subscriber Lifecycle Breakdown</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Active vs expiring vs overdue client accounts.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('clients')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Client List</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Graphic Donut + Stats Layout */}
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  {subDonutSegments.map(segment => (
                    <circle
                      key={segment.id}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth={hoveredSubSlice === segment.id ? '16' : '14'}
                      strokeDasharray={`${segment.strokeLength} ${circumference}`}
                      strokeDashoffset={segment.offset}
                      strokeLinecap="butt"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredSubSlice(segment.id)}
                      onMouseLeave={() => setHoveredSubSlice(null)}
                    />
                  ))}
                </svg>
                {/* Donut Center Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none">
                  <span className="text-xl font-bold font-mono text-slate-900 leading-tight">
                    {clients.length}
                  </span>
                  <span className="text-[10px] uppercase font-bold tracking-wider text-slate-400">
                    Clients
                  </span>
                </div>
              </div>

              {/* Legend & Details */}
              <div className="space-y-2.5 flex-1 w-full text-xs">
                {subDonutSegments.map(seg => {
                  const isHovered = hoveredSubSlice === seg.id;
                  const pct = Math.round(seg.percent * 100);
                  return (
                    <div
                      key={seg.id}
                      onMouseEnter={() => setHoveredSubSlice(seg.id)}
                      onMouseLeave={() => setHoveredSubSlice(null)}
                      className={`p-2 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isHovered
                          ? 'border-slate-400 bg-slate-50/80 shadow-2xs'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-3 h-3 rounded-full ${seg.dotClass}`} />
                        <span className="font-semibold text-slate-800">{seg.label}</span>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="font-bold text-slate-900 font-mono">{seg.value}</span>
                        <span className="text-slate-400 text-[11px] w-9 text-right font-mono">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Health Index: <strong className="text-emerald-700 font-semibold">{Math.round((activeCount / totalClients) * 100)}% On Track</strong>
            </span>
            <span className="text-amber-700 font-medium">
              {expiringCount} Due within 72 hrs
            </span>
          </div>
        </div>

        {/* CHART 2: Revenue Collection Breakdown by Payment Method */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h3 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                  <Banknote className="w-4 h-4 text-emerald-600" />
                  <span>Payment Method Distribution</span>
                </h3>
                <p className="text-xs text-slate-500">
                  Collected volume by channel in Pak Rs.
                </p>
              </div>
              <button
                onClick={() => onNavigateTab('clients')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                <span>Payment Table</span>
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* Graphic Donut + Stats Layout */}
            <div className="flex flex-col sm:flex-row items-center gap-6 py-2">
              {/* SVG Donut */}
              <div className="relative w-36 h-36 shrink-0 flex items-center justify-center">
                <svg className="w-36 h-36 -rotate-90 transform" viewBox="0 0 100 100">
                  <circle
                    cx="50"
                    cy="50"
                    r={radius}
                    fill="transparent"
                    stroke="#f1f5f9"
                    strokeWidth="14"
                  />
                  {payDonutSegments.map(segment => (
                    <circle
                      key={segment.id}
                      cx="50"
                      cy="50"
                      r={radius}
                      fill="transparent"
                      stroke={segment.color}
                      strokeWidth={hoveredPaySlice === segment.id ? '16' : '14'}
                      strokeDasharray={`${segment.strokeLength} ${circumference}`}
                      strokeDashoffset={segment.offset}
                      strokeLinecap="butt"
                      className="transition-all duration-300 cursor-pointer"
                      onMouseEnter={() => setHoveredPaySlice(segment.id)}
                      onMouseLeave={() => setHoveredPaySlice(null)}
                    />
                  ))}
                </svg>
                {/* Donut Center Info */}
                <div className="absolute inset-0 flex flex-col items-center justify-center text-center pointer-events-none px-2">
                  <span className="text-xs font-bold font-mono text-emerald-800 leading-tight">
                    Rs. {(currentMonthCollections / 1000).toFixed(1)}k
                  </span>
                  <span className="text-[9px] uppercase font-bold tracking-wider text-slate-400">
                    Collected
                  </span>
                </div>
              </div>

              {/* Legend & Details */}
              <div className="space-y-2 flex-1 w-full text-xs">
                {payDonutSegments.map(seg => {
                  const isHovered = hoveredPaySlice === seg.id;
                  const pct = Math.round(seg.percent * 100);
                  return (
                    <div
                      key={seg.id}
                      onMouseEnter={() => setHoveredPaySlice(seg.id)}
                      onMouseLeave={() => setHoveredPaySlice(null)}
                      className={`p-1.5 px-2.5 rounded-lg border transition-all flex items-center justify-between cursor-pointer ${
                        isHovered
                          ? 'border-slate-400 bg-slate-50/80 shadow-2xs'
                          : 'border-slate-100 hover:border-slate-200'
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`w-2.5 h-2.5 rounded-full ${seg.dotClass}`} />
                        <span className="font-semibold text-slate-800 truncate max-w-[130px]">
                          {seg.label}
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-mono text-[11px]">
                          Rs. {seg.value.toLocaleString()}
                        </span>
                        <span className="text-slate-400 text-[10px] w-7 text-right font-mono">
                          {pct}%
                        </span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 mt-2 flex items-center justify-between text-[11px] text-slate-500">
            <span>
              Total Receipts: <strong className="text-slate-800 font-semibold">{payments.length} Logged</strong>
            </span>
            <span className="text-emerald-700 font-semibold">
              Rs. {currentMonthCollections.toLocaleString()} Total Paid
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};
