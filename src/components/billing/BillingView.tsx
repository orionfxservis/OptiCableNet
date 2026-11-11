import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Receipt,
  Banknote,
  Search,
  Filter,
  Download,
  AlertCircle,
  CheckCircle2,
  Phone,
  Printer,
  PlusCircle,
  MessageSquare,
  Clock,
  ArrowRight,
} from 'lucide-react';
import { exportToCsv, triggerPrintWindow } from '../../utils/exportUtils';
import { PaymentRecord } from '../../types';

interface BillingViewProps {
  onOpenQuickPayment: (clientId?: string) => void;
}

export const BillingView: React.FC<BillingViewProps> = ({ onOpenQuickPayment }) => {
  const { clients, payments } = useApp();
  const [tab, setTab] = useState<'all' | 'defaulters' | 'collections' | 'invoices'>('all');
  const [search, setSearch] = useState('');
  const [methodFilter, setMethodFilter] = useState('all');

  const totalBilled = clients.reduce((acc, c) => acc + c.monthlyFee, 0);
  const totalOutstanding = clients.reduce((acc, c) => acc + c.balanceDue, 0);
  const totalCollected = payments.reduce((acc, p) => acc + p.amount, 0);
  const defaultersCount = clients.filter(c => c.balanceDue > 0).length;

  const filteredClients = clients.filter(c => {
    if (tab === 'defaulters' && c.balanceDue <= 0) return false;
    const q = search.toLowerCase();
    return c.name.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.packageName.toLowerCase().includes(q);
  });

  const filteredPayments = payments.filter(p => {
    const matchesMethod = methodFilter === 'all' || p.paymentMethod === methodFilter;
    const q = search.toLowerCase();
    const matchesSearch = p.clientName.toLowerCase().includes(q) ||
      p.receiptNumber.toLowerCase().includes(q) ||
      p.collectorName.toLowerCase().includes(q);
    return matchesMethod && matchesSearch;
  });

  const handleExportInvoices = () => {
    const rows = clients.map(c => ({
      'Invoice No': `INV-${new Date().getFullYear()}-${c.id.replace('cli-', '')}`,
      'Customer Name': c.name,
      'Phone': c.phone,
      'Package': c.packageName,
      'Monthly Rate (Rs.)': c.monthlyFee,
      'Balance Due (Rs.)': c.balanceDue,
      'Billing Status': c.balanceDue > 0 ? 'Defaulter / Pending' : 'Paid',
      'Expiry Date': c.packageExpiryDate,
    }));
    exportToCsv(`Billing_Invoices_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Receipt className="w-6 h-6 text-emerald-600" />
            <span>Billing & Payments</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Customer invoices, real-time fee collections, payment receipts, and defaulter recovery ledger in Pak Rs.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handleExportInvoices}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-500" />
            <span>Export Invoices</span>
          </button>
          <button
            onClick={() => onOpenQuickPayment()}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Monthly Target</span>
            <Receipt className="w-3.5 h-3.5 text-sky-700" />
          </div>
          <div className="text-xl font-bold text-sky-950 font-mono">
            Rs. {totalBilled.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-800 mt-0.5">{clients.length} Subscribed Accounts</div>
        </div>

        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Collections (Paid)</span>
            <Banknote className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-emerald-950 font-mono">
            Rs. {totalCollected.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-800 mt-0.5">{payments.length} Receipts Logged</div>
        </div>

        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Defaulter Dues</span>
            <AlertCircle className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-xl font-bold text-amber-950 font-mono">
            Rs. {totalOutstanding.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-900 mt-0.5">{defaultersCount} Overdue Accounts</div>
        </div>

        <div className="bg-purple-50/90 border border-purple-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Realization Rate</span>
            <CheckCircle2 className="w-3.5 h-3.5 text-purple-700" />
          </div>
          <div className="text-xl font-bold text-purple-950 font-mono">
            {Math.round((totalCollected / Math.max(1, totalBilled)) * 100)}%
          </div>
          <div className="text-[11px] text-purple-900 mt-0.5">Recovery Efficiency</div>
        </div>
      </div>

      {/* Filter Tabs and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative w-full sm:w-72">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search invoice, client, receipt #..."
              value={search}
              onChange={e => setSearch(e.target.value)}
              className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
            <button
              onClick={() => setTab('all')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer text-xs ${
                tab === 'all' ? 'bg-white text-slate-900 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All Invoices ({clients.length})
            </button>
            <button
              onClick={() => setTab('defaulters')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer text-xs ${
                tab === 'defaulters' ? 'bg-white text-amber-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Defaulters Only ({defaultersCount})
            </button>
            <button
              onClick={() => setTab('collections')}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer text-xs ${
                tab === 'collections' ? 'bg-white text-emerald-800 shadow-2xs' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Collection Receipts ({payments.length})
            </button>
          </div>
        </div>

        {tab === 'collections' ? (
          /* Collections Ledger Table */
          <div className="w-full max-w-full overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Receipt No</th>
                  <th className="py-2.5 px-3">Client Name</th>
                  <th className="py-2.5 px-3">Payment Method</th>
                  <th className="py-2.5 px-3">Date</th>
                  <th className="py-2.5 px-3">Amount Paid</th>
                  <th className="py-2.5 px-3">Extension</th>
                  <th className="py-2.5 px-3">Collector</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredPayments.map(p => (
                  <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                    <td className="py-2.5 px-3 font-mono font-bold text-sky-700">{p.receiptNumber}</td>
                    <td className="py-2.5 px-3 font-semibold text-slate-900">{p.clientName}</td>
                    <td className="py-2.5 px-3">
                      <span className="inline-flex px-2 py-0.5 rounded text-[11px] font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {p.paymentMethod}
                      </span>
                    </td>
                    <td className="py-2.5 px-3 font-mono text-slate-500">{p.date}</td>
                    <td className="py-2.5 px-3 font-mono font-bold text-emerald-700">
                      Rs. {p.amount.toLocaleString()}
                    </td>
                    <td className="py-2.5 px-3 text-slate-600">+{p.packageExtendedMonths} mo</td>
                    <td className="py-2.5 px-3 text-slate-600">{p.collectorName}</td>
                    <td className="py-2.5 px-3 text-right">
                      <button
                        onClick={triggerPrintWindow}
                        className="px-2 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded cursor-pointer inline-flex items-center gap-1"
                      >
                        <Printer className="w-3 h-3 text-slate-500" />
                        <span>Print</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          /* Client Invoices & Defaulters Table */
          <div className="w-full max-w-full overflow-x-auto pt-2">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50 text-slate-600 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Invoice & Customer</th>
                  <th className="py-2.5 px-3">Package</th>
                  <th className="py-2.5 px-3">Monthly Rate</th>
                  <th className="py-2.5 px-3">Outstanding Balance</th>
                  <th className="py-2.5 px-3">Expiry Deadline</th>
                  <th className="py-2.5 px-3">Billing Status</th>
                  <th className="py-2.5 px-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClients.map(c => {
                  const isDefaulter = c.balanceDue > 0;
                  return (
                    <tr key={c.id} className="hover:bg-slate-50 transition-colors">
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{c.name}</div>
                        <div className="text-[11px] text-slate-500 font-mono">
                          INV-2026-{c.id.replace('cli-', '')} · {c.phone}
                        </div>
                      </td>
                      <td className="py-3 px-3">
                        <div className="font-medium text-slate-800">{c.packageName}</div>
                        <div className="text-[11px] text-slate-400">{c.bandwidthMbps} Mbps Fiber</div>
                      </td>
                      <td className="py-3 px-3 font-mono font-bold text-slate-800">
                        Rs. {c.monthlyFee.toLocaleString()}
                      </td>
                      <td className="py-3 px-3 font-mono">
                        <span className={`text-sm font-bold ${isDefaulter ? 'text-amber-600' : 'text-emerald-600'}`}>
                          Rs. {c.balanceDue.toLocaleString()}
                        </span>
                      </td>
                      <td className="py-3 px-3 font-mono text-slate-700">
                        {c.packageExpiryDate}
                      </td>
                      <td className="py-3 px-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                          isDefaulter
                            ? 'bg-amber-100 text-amber-900 border border-amber-300'
                            : 'bg-emerald-100 text-emerald-900 border border-emerald-300'
                        }`}>
                          {isDefaulter ? 'Defaulter / Pending' : 'Paid & Settled'}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-right">
                        <button
                          onClick={() => onOpenQuickPayment(c.id)}
                          className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg cursor-pointer transition-colors shadow-2xs"
                        >
                          Collect
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};
