import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  BarChart3,
  TrendingUp,
  Download,
  Printer,
  Calendar,
  DollarSign,
  Users,
  Activity,
  Zap,
  CheckCircle2,
  AlertCircle,
  FileSpreadsheet,
} from 'lucide-react';
import { exportToCsv, triggerPrintWindow } from '../../utils/exportUtils';

export const ReportsView: React.FC = () => {
  const { clients, expenses, payments, alerts } = useApp();
  const [reportPeriod, setReportPeriod] = useState('current_month');

  const totalMonthlyBilled = clients.reduce((acc, c) => acc + c.monthlyFee, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const netOperatingProfit = totalCollected - totalExpenses;
  const collectionRate = totalMonthlyBilled > 0 ? ((totalCollected / totalMonthlyBilled) * 100).toFixed(1) : '0';

  const activeSubscribers = clients.filter(c => c.status === 'active').length;
  const suspendedSubscribers = clients.filter(c => c.status === 'suspended').length;
  const resolvedAlertsCount = alerts.filter(a => a.resolved).length;

  const monthlyBreakdown = [
    { month: 'Jun 2026', billed: 420000, collected: 405000, expenses: 145000 },
    { month: 'Jul 2026', billed: 450000, collected: 432000, expenses: 152000 },
    { month: 'Aug 2026', billed: 480000, collected: 461000, expenses: 160000 },
    { month: 'Sep 2026', billed: 510000, collected: 492000, expenses: 168000 },
    { month: 'Oct 2026', billed: 540000, collected: 525000, expenses: 175000 },
    { month: 'Nov 2026', billed: totalMonthlyBilled, collected: totalCollected, expenses: totalExpenses },
  ];

  const handleExportSummary = () => {
    const rows = monthlyBreakdown.map(m => ({
      Month: m.month,
      'Billed (Rs)': m.billed,
      'Collected (Rs)': m.collected,
      'Operating Expenses (Rs)': m.expenses,
      'Net Profit (Rs)': m.collected - m.expenses,
      'Realization %': ((m.collected / m.billed) * 100).toFixed(1) + '%',
    }));
    exportToCsv(`OptiCableNet_Financial_Report_${new Date().toISOString().split('T')[0]}`, rows);
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-teal-50 text-teal-700">
                <BarChart3 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Reports & Business Analytics
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Revenue collection efficiency, profit margins, ARPU, and network uptime audit in Pak Rs.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handleExportSummary}
              className="px-3.5 py-2 bg-white border border-slate-300 hover:bg-slate-50 text-slate-700 rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Download className="w-4 h-4 text-slate-500" />
              <span>Export CSV</span>
            </button>
            <button
              onClick={triggerPrintWindow}
              className="px-3.5 py-2 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
            >
              <Printer className="w-4 h-4" />
              <span>Print Executive Summary</span>
            </button>
          </div>
        </div>

        {/* 4 Financial Highlight Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Total Collections</span>
            <span className="text-lg font-bold text-emerald-600">Rs. {totalCollected.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">{collectionRate}% collection rate</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Total OpEx Expenses</span>
            <span className="text-lg font-bold text-rose-600">Rs. {totalExpenses.toLocaleString()}</span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Bandwidth, fuel, staff</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Net Operating Margin</span>
            <span className="text-lg font-bold text-teal-700">Rs. {netOperatingProfit.toLocaleString()}</span>
            <span className="text-[11px] text-emerald-600 font-semibold block mt-0.5">+Positive Cashflow</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Average ARPU</span>
            <span className="text-lg font-bold text-slate-900">
              Rs. {clients.length > 0 ? Math.round(totalMonthlyBilled / clients.length).toLocaleString() : 0}
            </span>
            <span className="text-[11px] text-slate-400 block mt-0.5">Per subscriber / month</span>
          </div>
        </div>
      </div>

      {/* Multi-Month Financial Realization Table */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div>
            <h3 className="text-sm font-bold text-slate-900">6-Month Financial Ledger & Realization</h3>
            <p className="text-xs text-slate-500">Billed tariffs vs cash collections vs operational expenditures</p>
          </div>
          <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1 rounded">
            Audit Compliant
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Billing Cycle</th>
                <th className="px-4 py-3">Gross Billed (Pak Rs.)</th>
                <th className="px-4 py-3">Cash Collected (Pak Rs.)</th>
                <th className="px-4 py-3">OpEx Expenses (Pak Rs.)</th>
                <th className="px-4 py-3">Net Realized Profit</th>
                <th className="px-4 py-3 text-right">Collection Efficiency</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {monthlyBreakdown.map(item => {
                const profit = item.collected - item.expenses;
                const eff = ((item.collected / item.billed) * 100).toFixed(1);
                return (
                  <tr key={item.month} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900">{item.month}</td>
                    <td className="px-4 py-3 font-mono text-slate-700">Rs. {item.billed.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono font-semibold text-emerald-600">
                      Rs. {item.collected.toLocaleString()}
                    </td>
                    <td className="px-4 py-3 font-mono text-rose-600">Rs. {item.expenses.toLocaleString()}</td>
                    <td className="px-4 py-3 font-mono font-bold text-slate-900">Rs. {profit.toLocaleString()}</td>
                    <td className="px-4 py-3 text-right">
                      <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200 text-xs">
                        {eff}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Operational SLA and Incident MTTR */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Subscriber Retention & Churn</h3>
          <p className="text-xs text-slate-500 mb-4">Live active subscriber health breakdown</p>

          <div className="space-y-3">
            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Active Paid Subscribers</span>
                <span className="text-emerald-600">{activeSubscribers} ({((activeSubscribers / (clients.length || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-emerald-500 h-full rounded-full"
                  style={{ width: `${(activeSubscribers / (clients.length || 1)) * 100}%` }}
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between text-xs font-semibold mb-1">
                <span className="text-slate-700">Suspended / Overdue Subscribers</span>
                <span className="text-rose-600">{suspendedSubscribers} ({((suspendedSubscribers / (clients.length || 1)) * 100).toFixed(0)}%)</span>
              </div>
              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                <div
                  className="bg-rose-500 h-full rounded-full"
                  style={{ width: `${(suspendedSubscribers / (clients.length || 1)) * 100}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
          <h3 className="text-sm font-bold text-slate-900 mb-1">Network Reliability & SLA Audit</h3>
          <p className="text-xs text-slate-500 mb-4">Fiber uptime and Mean Time To Repair (MTTR)</p>

          <div className="grid grid-cols-2 gap-3 text-center">
            <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block font-medium">Core Network Uptime</span>
              <span className="text-lg font-bold text-emerald-600">99.88%</span>
              <span className="text-[10px] text-slate-500 block">Tier-3 SLA target met</span>
            </div>
            <div className="bg-slate-50 border border-slate-200/70 rounded-lg p-3">
              <span className="text-[11px] text-slate-400 block font-medium">Average Fiber MTTR</span>
              <span className="text-lg font-bold text-sky-600">42 Minutes</span>
              <span className="text-[10px] text-slate-500 block">From OTDR alert to splice</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
