import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { ExpenseCategory, ExpenseItem } from '../../types';
import {
  Banknote,
  PlusCircle,
  Download,
  Search,
  Filter,
  Trash2,
  TrendingUp,
  TrendingDown,
  PieChart,
  Calendar,
} from 'lucide-react';
import { exportToCsv } from '../../utils/exportUtils';

export const ExpensesView: React.FC = () => {
  const { expenses, clients, payments, addExpense, deleteExpense } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form State
  const [title, setTitle] = useState('');
  const [category, setCategory] = useState<ExpenseCategory>('pole_rental');
  const [amount, setAmount] = useState<number>(150);
  const [paidTo, setPaidTo] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<ExpenseItem['paymentMethod']>('Bank_Transfer');
  const [receiptRef, setReceiptRef] = useState('');
  const [notes, setNotes] = useState('');
  const [expenseDate, setExpenseDate] = useState(
    new Date().toISOString().split('T')[0]
  );

  // Financial aggregates
  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);
  const totalCollections = payments.reduce((acc, p) => acc + p.amount, 0);
  const totalBilled = clients.reduce((acc, c) => acc + c.monthlyFee, 0);
  const netMargin = totalCollections - totalExpenses;

  const filteredExpenses = expenses.filter(e => {
    const matchesCat = categoryFilter === 'all' || e.category === categoryFilter;
    const matchesQuery =
      e.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      e.paidTo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (e.receiptRef && e.receiptRef.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCat && matchesQuery;
  });

  const handleCreateExpense = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || amount <= 0) return;

    addExpense({
      date: expenseDate,
      category,
      title,
      amount: Number(amount),
      paidTo: paidTo || 'Vendor',
      paymentMethod,
      receiptRef,
      notes,
    });

    setShowAddModal(false);
    setTitle('');
    setAmount(15000);
    setPaidTo('');
    setReceiptRef('');
  };

  const handleExportCsv = () => {
    const rows = expenses.map(e => ({
      'Date': e.date,
      'Title / Description': e.title,
      'Category': e.category,
      'Amount (Rs.)': e.amount,
      'Paid To': e.paidTo,
      'Payment Method': e.paymentMethod,
      'Receipt Reference': e.receiptRef || '',
      'Notes': e.notes || '',
    }));
    exportToCsv(`Expenses_Ledger_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Operating Expenses & Cash Flow
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Log utility pole rental, transit bandwidth invoices, generator fuel, and hardware maintenance.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export Expenses</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Expense</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Same compact size & standard color fill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Collections - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Total Collections</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <TrendingUp className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight font-mono">
            Rs. {totalCollections.toLocaleString()}
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-emerald-950 font-semibold">{payments.length} Payments</span>
            <span>·</span>
            <span>Recorded Cash & Wire</span>
          </div>
        </div>

        {/* Operating Expenses - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Operating Expenses</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <TrendingDown className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight font-mono">
            Rs. {totalExpenses.toLocaleString()}
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-rose-950 font-semibold">{expenses.length} Invoices</span>
            <span>·</span>
            <span>Poles, Transit & Fuel</span>
          </div>
        </div>

        {/* Net Cash Flow - Standard Sky */}
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Net Cash Flow</span>
            <div className="p-1 rounded-md bg-sky-100/80 text-sky-700">
              <PieChart className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className={`text-xl font-bold tabular-nums leading-tight font-mono ${netMargin >= 0 ? 'text-sky-950' : 'text-rose-900'}`}>
            Rs. {netMargin.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-sky-900 font-semibold">{netMargin >= 0 ? 'Profitable' : 'Deficit'}</span>
            <span>·</span>
            <span>Margin Balance</span>
          </div>
        </div>

        {/* Total Monthly Billed - Standard Amber */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Monthly Billed Target</span>
            <div className="p-1 rounded-md bg-amber-100/80 text-amber-800">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight font-mono">
            Rs. {totalBilled.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-amber-950 font-semibold">{clients.length} Subscribers</span>
            <span>·</span>
            <span>Active Subscriptions</span>
          </div>
        </div>
      </div>

      {/* Filter Toolbar & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search expenses, vendors, receipts..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'all', label: 'All' },
              { id: 'pole_rental', label: 'Pole Rental' },
              { id: 'bandwidth_transit', label: 'Transit Bandwidth' },
              { id: 'electricity_generator', label: 'Power & Fuel' },
              { id: 'splicing_materials', label: 'Splicing Supplies' },
              { id: 'fuel_transport', label: 'Bike Fuel' },
            ].map(tab => (
              <button
                key={tab.id}
                onClick={() => setCategoryFilter(tab.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  categoryFilter === tab.id
                    ? 'bg-white text-slate-900 font-semibold shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Expenses Table */}
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">Date</th>
                <th className="py-2.5 px-3">Description & Vendor</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">Payment Method</th>
                <th className="py-2.5 px-3">Receipt Ref</th>
                <th className="py-2.5 px-3">Amount</th>
                <th className="py-2.5 px-3 text-right">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredExpenses.map(item => (
                <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                  <td className="py-3 px-3 font-mono tabular-nums text-slate-600">
                    {item.date}
                  </td>
                  <td className="py-3 px-3">
                    <div className="font-bold text-slate-900">{item.title}</div>
                    <div className="text-[11px] text-slate-500">Paid to: {item.paidTo}</div>
                  </td>
                  <td className="py-3 px-3">
                    <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                      {item.category.replace('_', ' ')}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-slate-600">
                    {item.paymentMethod.replace('_', ' ')}
                  </td>
                  <td className="py-3 px-3 font-mono text-[11px] text-slate-500">
                    {item.receiptRef || '—'}
                  </td>
                  <td className="py-3 px-3 font-mono tabular-nums font-bold text-slate-900 text-sm">
                    Rs. {item.amount.toLocaleString()}
                  </td>
                  <td className="py-3 px-3 text-right">
                    <button
                      onClick={() => deleteExpense(item.id)}
                      className="p-1 text-slate-400 hover:text-rose-600 rounded transition-colors cursor-pointer"
                      title="Delete record"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Record Expense Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateExpense}
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Record Operating Expense</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Expense Title / Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Utility Pole Rental Attachment (Q4)"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as ExpenseCategory)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                  >
                    <option value="pole_rental">Pole Rental</option>
                    <option value="bandwidth_transit">Bandwidth Transit Uplink</option>
                    <option value="electricity_generator">Electricity & Diesel</option>
                    <option value="splicing_materials">Splicing Consumables</option>
                    <option value="fuel_transport">Lineman Bike Fuel</option>
                    <option value="equipment_maintenance">Equipment Maintenance</option>
                    <option value="office_supplies">Office & Warehouse Rent</option>
                    <option value="miscellaneous">Miscellaneous</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Amount (Pak Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="1"
                    required
                    value={amount}
                    onChange={e => setAmount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Paid To (Vendor)</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. City Power Corp"
                    value={paidTo}
                    onChange={e => setPaidTo(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Date</label>
                  <input
                    type="date"
                    required
                    value={expenseDate}
                    onChange={e => setExpenseDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                  <select
                    value={paymentMethod}
                    onChange={e => setPaymentMethod(e.target.value as ExpenseItem['paymentMethod'])}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="Bank_Transfer">Bank Wire / Transfer</option>
                    <option value="Cash">Cash (Petty Cash)</option>
                    <option value="Card">Debit / Credit Card</option>
                    <option value="Online">Online Payment Gateway</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Invoice / Receipt Reference</label>
                  <input
                    type="text"
                    placeholder="e.g. INV-2026-902"
                    value={receiptRef}
                    onChange={e => setReceiptRef(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
              >
                Save Expense
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
