import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { InventoryCategory, InventoryItem } from '../../types';
import {
  Boxes,
  PlusCircle,
  FileSpreadsheet,
  Printer,
  Download,
  AlertTriangle,
  Search,
  ArrowUpRight,
  ArrowDownRight,
  Wrench,
  CheckCircle2,
  Banknote,
  Layers,
  Cpu,
} from 'lucide-react';
import { exportToCsv, exportToJson, triggerPrintWindow } from '../../utils/exportUtils';

export const InventoryView: React.FC = () => {
  const {
    inventory,
    transactions,
    staff,
    addInventoryItem,
    transactInventory,
  } = useApp();

  const [activeCategory, setActiveCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showStockModal, setShowStockModal] = useState(false);
  const [showAddItemModal, setShowAddItemModal] = useState(false);
  const [showAuditModal, setShowAuditModal] = useState(false);

  // Stock In / Out form state
  const [selectedItemId, setSelectedItemId] = useState<string>('');
  const [txType, setTxType] = useState<'stock_in' | 'stock_out'>('stock_out');
  const [txQty, setTxQty] = useState<number>(1);
  const [txTech, setTxTech] = useState<string>('');
  const [txPurpose, setTxPurpose] = useState<string>('');

  // Add Item form state
  const [newItemSku, setNewItemSku] = useState('');
  const [newItemName, setNewItemName] = useState('');
  const [newItemCategory, setNewItemCategory] = useState<InventoryCategory>('cables');
  const [newItemUnit, setNewItemUnit] = useState<InventoryItem['unit']>('meters');
  const [newItemQty, setNewItemQty] = useState<number>(100);
  const [newItemMin, setNewItemMin] = useState<number>(50);
  const [newItemCost, setNewItemCost] = useState<number>(150);
  const [newItemLoc, setNewItemLoc] = useState('');

  // Computations
  const totalValuation = inventory.reduce((acc, i) => acc + i.quantityInStock * i.unitCost, 0);
  const lowStockItems = inventory.filter(i => i.quantityInStock <= i.minimumThreshold);
  const totalCablesMeters = inventory
    .filter(i => i.category === 'cables')
    .reduce((acc, i) => acc + i.quantityInStock, 0);
  const totalActiveDevices = inventory
    .filter(i => i.category === 'active_devices')
    .reduce((acc, i) => acc + i.quantityInStock, 0);

  const filteredInventory = inventory.filter(item => {
    const matchesCat = activeCategory === 'all' || item.category === activeCategory;
    const matchesQuery =
      item.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.location.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleStockTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedItemId || txQty <= 0) return;
    transactInventory({
      itemId: selectedItemId,
      type: txType,
      quantity: Number(txQty),
      technicianName: txTech,
      purpose: txPurpose || `${txType === 'stock_out' ? 'Dispatched for field operations' : 'Received in warehouse'}`,
    });
    setShowStockModal(false);
    setSelectedItemId('');
    setTxQty(1);
    setTxPurpose('');
  };

  const handleCreateItem = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newItemName || !newItemSku) return;
    addInventoryItem({
      sku: newItemSku,
      name: newItemName,
      category: newItemCategory,
      unit: newItemUnit,
      quantityInStock: Number(newItemQty),
      minimumThreshold: Number(newItemMin),
      unitCost: Number(newItemCost),
      location: newItemLoc || 'Warehouse Main Bay',
      condition: 'new',
      lastAuditDate: new Date().toISOString().split('T')[0],
    });
    setShowAddItemModal(false);
    setNewItemName('');
    setNewItemSku('');
  };

  // Export audit report to CSV
  const handleExportCsvAudit = () => {
    const rows = inventory.map(item => ({
      'SKU / Code': item.sku,
      'Item Description': item.name,
      'Category': item.category,
      'Quantity In Stock': item.quantityInStock,
      'Unit': item.unit,
      'Unit Cost (Rs.)': item.unitCost,
      'Total Value (Rs.)': +(item.quantityInStock * item.unitCost).toFixed(2),
      'Min Reorder Threshold': item.minimumThreshold,
      'Status': item.quantityInStock <= item.minimumThreshold ? 'LOW STOCK - REORDER' : 'NOMINAL',
      'Location': item.location,
      'Condition': item.condition,
      'Last Audit Date': item.lastAuditDate,
    }));
    exportToCsv(`Hardware_Audit_Report_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Inventory Tracking & Hardware Audits
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time stock of fiber reels, ONUs, passive splitters, and exportable monthly audit reports.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Monthly Hardware Audit Report Button */}
          <button
            onClick={() => setShowAuditModal(true)}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-600" />
            <span>Monthly Hardware Audit</span>
          </button>

          {/* Issue / Receive Material */}
          <button
            onClick={() => {
              if (inventory.length > 0) setSelectedItemId(inventory[0].id);
              setShowStockModal(true);
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <ArrowDownRight className="w-3.5 h-3.5 text-sky-600" />
            <span>Stock In / Out</span>
          </button>

          {/* Add Item */}
          <button
            onClick={() => setShowAddItemModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Add Item</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Same compact size & standard color fill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Asset Valuation - Standard Sky */}
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Total Valuation</span>
            <div className="p-1 rounded-md bg-sky-100/80 text-sky-700">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-sky-950 tabular-nums leading-tight font-mono">
            Rs. {totalValuation.toLocaleString()}
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-sky-900 font-semibold">{inventory.length} SKUs</span>
            <span>·</span>
            <span>Warehouse Main Bay</span>
          </div>
        </div>

        {/* Cable Spool Stock - Standard Amber */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Cable Spool Stock</span>
            <div className="p-1 rounded-md bg-amber-100/80 text-amber-800">
              <Layers className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight font-mono">
            {totalCablesMeters.toLocaleString()} <span className="text-xs font-sans font-medium text-amber-900">m</span>
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span>24C, 12C Fiber</span>
            <span>·</span>
            <span className="text-amber-950 font-semibold">Drop & Coaxial</span>
          </div>
        </div>

        {/* ONUs & Active Devices - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Active Devices</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <Cpu className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight font-mono">
            {totalActiveDevices} <span className="text-xs font-sans font-medium text-emerald-900">units</span>
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-emerald-950 font-semibold">XPON & SFP+</span>
            <span>·</span>
            <span>Gigabit Routers</span>
          </div>
        </div>

        {/* Low Stock Items - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Reorder Warnings</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight">
            {lowStockItems.length} {lowStockItems.length === 1 ? 'Item' : 'Items'}
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className={lowStockItems.length > 0 ? 'text-rose-950 font-bold' : 'text-emerald-900'}>
              {lowStockItems.length > 0 ? 'Below minimum threshold' : 'All stocks healthy'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter toolbar & Search */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by SKU, item name, or location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Category Filter Pills */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-slate-100 rounded-lg">
            {[
              { id: 'all', label: 'All Items' },
              { id: 'cables', label: 'Cables & Fiber' },
              { id: 'active_devices', label: 'Active Devices' },
              { id: 'passive_components', label: 'Splitters & Closures' },
              { id: 'tools_splicing', label: 'Splicers & Tools' },
              { id: 'power_ups', label: 'Power & UPS' },
            ].map(cat => (
              <button
                key={cat.id}
                onClick={() => setActiveCategory(cat.id)}
                className={`px-2.5 py-1 text-xs font-medium rounded-md transition-colors cursor-pointer ${
                  activeCategory === cat.id
                    ? 'bg-white text-slate-900 shadow-2xs font-semibold'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>
        </div>

        {/* Inventory Table */}
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">SKU & Item Name</th>
                <th className="py-2.5 px-3">Category</th>
                <th className="py-2.5 px-3">In Stock</th>
                <th className="py-2.5 px-3">Unit Cost</th>
                <th className="py-2.5 px-3">Total Value</th>
                <th className="py-2.5 px-3">Storage Location</th>
                <th className="py-2.5 px-3">Condition</th>
                <th className="py-2.5 px-3 text-right">Quick Stock</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredInventory.map(item => {
                const isLow = item.quantityInStock <= item.minimumThreshold;
                const value = item.quantityInStock * item.unitCost;

                return (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{item.name}</div>
                      <div className="text-[11px] font-mono text-slate-400">{item.sku}</div>
                    </td>
                    <td className="py-3 px-3">
                      <span className="capitalize px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[11px]">
                        {item.category.replace('_', ' ')}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      <div className="flex items-center gap-1.5">
                        <span className={`font-bold ${isLow ? 'text-amber-600' : 'text-slate-900'}`}>
                          {item.quantityInStock.toLocaleString()} {item.unit}
                        </span>
                        {isLow && (
                          <span className="text-[10px] font-bold text-amber-700 bg-amber-100 px-1.5 py-0.2 rounded">
                            Low
                          </span>
                        )}
                      </div>
                      <div className="text-[10px] text-slate-400">Min: {item.minimumThreshold}</div>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      Rs. {item.unitCost.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums font-semibold text-slate-900">
                      Rs. {value.toLocaleString()}
                    </td>
                    <td className="py-3 px-3 text-slate-600">
                      {item.location}
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          item.condition === 'new'
                            ? 'bg-emerald-100 text-emerald-800'
                            : item.condition === 'deployed'
                            ? 'bg-sky-100 text-sky-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {item.condition}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => {
                          setSelectedItemId(item.id);
                          setShowStockModal(true);
                        }}
                        className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                      >
                        Adjust
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Recent Inventory Transactions Log */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-3">
        <h3 className="text-sm font-bold text-slate-900 tracking-tight">Recent Dispatch & Receipt Log</h3>
        <div className="space-y-2">
          {transactions.slice(0, 5).map(tx => (
            <div
              key={tx.id}
              className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs"
            >
              <div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-bold px-1.5 py-0.5 rounded text-[10px] uppercase ${
                      tx.type === 'stock_in'
                        ? 'bg-emerald-100 text-emerald-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {tx.type === 'stock_in' ? 'Received' : 'Dispatched'}
                  </span>
                  <span className="font-bold text-slate-900">{tx.itemName}</span>
                  <span className="font-mono font-bold text-slate-800">({tx.quantity} units)</span>
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5">
                  {tx.purpose} {tx.technicianName && `· Lineman: ${tx.technicianName}`}
                </div>
              </div>
              <span className="text-[11px] font-mono text-slate-400 shrink-0">{tx.date}</span>
            </div>
          ))}
        </div>
      </div>

      {/* MONTHLY HARDWARE AUDIT REPORT MODAL (Exportable CSV, JSON & Printable) */}
      {showAuditModal && (
        <div className="fixed inset-0 z-50 bg-black/50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl border border-slate-200 max-w-4xl w-full p-6 shadow-2xl space-y-5 my-8">
            <div className="flex items-start justify-between pb-3 border-b border-slate-200">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-sky-600">
                  Compliance & Physical Stock Verification
                </span>
                <h2 className="text-lg font-bold text-slate-900">Monthly Hardware Audit Report</h2>
                <p className="text-xs text-slate-500">
                  Period: {new Date().toLocaleString('default', { month: 'long', year: 'numeric' })} · Warehouse Facility: Central Headend
                </p>
              </div>

              {/* Action buttons */}
              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportCsvAudit}
                  className="px-3 py-1.5 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>Download CSV</span>
                </button>

                <button
                  onClick={() => exportToJson(`Hardware_Audit_${new Date().toISOString().slice(0, 10)}`, inventory)}
                  className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <span>Export JSON</span>
                </button>

                <button
                  onClick={triggerPrintWindow}
                  className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg flex items-center gap-1.5 cursor-pointer"
                >
                  <Printer className="w-3.5 h-3.5" />
                  <span>Print Audit Sheet</span>
                </button>

                <button
                  onClick={() => setShowAuditModal(false)}
                  className="text-slate-400 hover:text-slate-700 cursor-pointer p-1.5 font-bold"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Audit Summary Statistics */}
            <div className="grid grid-cols-3 gap-4 text-xs bg-slate-50 p-3.5 rounded-lg border border-slate-200">
              <div>
                <span className="text-slate-500 block">Total Catalog Items</span>
                <span className="text-base font-bold text-slate-900 font-mono">{inventory.length} SKUs</span>
              </div>
              <div>
                <span className="text-slate-500 block">Total Inventory Valuation</span>
                <span className="text-base font-bold text-slate-900 font-mono">
                  Rs. {totalValuation.toLocaleString()}
                </span>
              </div>
              <div>
                <span className="text-slate-500 block">Low Stock / Action Items</span>
                <span className="text-base font-bold text-amber-600 font-mono">{lowStockItems.length} Reorders</span>
              </div>
            </div>

            {/* Audit Table */}
            <div className="overflow-x-auto max-h-96 border border-slate-200 rounded-lg">
              <table className="w-full text-left text-xs border-collapse">
                <thead className="sticky top-0 bg-slate-100 border-b border-slate-200">
                  <tr className="text-slate-700 uppercase font-semibold text-[10px]">
                    <th className="py-2 px-3">SKU</th>
                    <th className="py-2 px-3">Item Description</th>
                    <th className="py-2 px-3">Stock Count</th>
                    <th className="py-2 px-3">Unit Cost</th>
                    <th className="py-2 px-3">Total Value</th>
                    <th className="py-2 px-3">Audit Condition</th>
                    <th className="py-2 px-3">Audit Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {inventory.map(item => {
                    const isLow = item.quantityInStock <= item.minimumThreshold;
                    const val = item.quantityInStock * item.unitCost;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/50">
                        <td className="py-2.5 px-3 font-mono font-bold text-slate-800">{item.sku}</td>
                        <td className="py-2.5 px-3 font-medium text-slate-900">{item.name}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">
                          {item.quantityInStock} {item.unit}
                        </td>
                        <td className="py-2.5 px-3 font-mono tabular-nums">Rs. {item.unitCost.toLocaleString()}</td>
                        <td className="py-2.5 px-3 font-mono tabular-nums font-bold text-slate-900">
                          Rs. {val.toLocaleString()}
                        </td>
                        <td className="py-2.5 px-3 capitalize">{item.condition}</td>
                        <td className="py-2.5 px-3">
                          {isLow ? (
                            <span className="text-amber-700 font-bold text-[10px] bg-amber-100 px-2 py-0.5 rounded">
                              REORDER NEEDED
                            </span>
                          ) : (
                            <span className="text-emerald-700 font-semibold text-[10px] bg-emerald-100 px-2 py-0.5 rounded">
                              VERIFIED
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="flex justify-end pt-2 border-t border-slate-100">
              <button
                onClick={() => setShowAuditModal(false)}
                className="px-4 py-2 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Close Audit Report
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stock In / Out Modal */}
      {showStockModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleStockTransaction}
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Record Stock Dispatch or Receipt</h3>
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Select Item</label>
                <select
                  value={selectedItemId}
                  onChange={e => setSelectedItemId(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                >
                  {inventory.map(item => (
                    <option key={item.id} value={item.id}>
                      {item.name} ({item.quantityInStock} {item.unit} available)
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Transaction Type</label>
                  <select
                    value={txType}
                    onChange={e => setTxType(e.target.value as 'stock_in' | 'stock_out')}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                  >
                    <option value="stock_out">Stock Out (Dispatch to Field)</option>
                    <option value="stock_in">Stock In (Received from Supplier)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Quantity</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={txQty}
                    onChange={e => setTxQty(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Technician / Lineman</label>
                <select
                  value={txTech}
                  onChange={e => setTxTech(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                >
                  <option value="">Select Lineman (Optional)</option>
                  {staff.map(s => (
                    <option key={s.id} value={s.name}>
                      {s.name} ({s.role})
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Purpose / Ticket / Location</label>
                <input
                  type="text"
                  placeholder="e.g. Splicing repair on Oak St or New FTTH install"
                  value={txPurpose}
                  onChange={e => setTxPurpose(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowStockModal(false)}
                className="px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
              >
                Save Transaction
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Add New Inventory Item Modal */}
      {showAddItemModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateItem}
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Inventory Item</h3>
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">SKU / Code</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. CAB-FBR-48C"
                    value={newItemSku}
                    onChange={e => setNewItemSku(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={newItemCategory}
                    onChange={e => setNewItemCategory(e.target.value as InventoryCategory)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                  >
                    <option value="cables">Cables & Fiber</option>
                    <option value="active_devices">Active Devices (ONU/SFP)</option>
                    <option value="passive_components">Passive (Splitters/Closures)</option>
                    <option value="tools_splicing">Tools & Splicers</option>
                    <option value="power_ups">Power & UPS</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Item Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. 48-Core Armored Single Mode Fiber Cable Reel"
                  value={newItemName}
                  onChange={e => setNewItemName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit</label>
                  <select
                    value={newItemUnit}
                    onChange={e => setNewItemUnit(e.target.value as InventoryItem['unit'])}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                  >
                    <option value="meters">Meters</option>
                    <option value="pcs">Pcs</option>
                    <option value="reels">Reels</option>
                    <option value="kits">Kits</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Initial Stock</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={newItemQty}
                    onChange={e => setNewItemQty(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Min Threshold</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newItemMin}
                    onChange={e => setNewItemMin(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Unit Cost (Pak Rs.)</label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    required
                    value={newItemCost}
                    onChange={e => setNewItemCost(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Warehouse Storage Location</label>
                  <input
                    type="text"
                    placeholder="e.g. Warehouse Bay 3, Shelf B"
                    value={newItemLoc}
                    onChange={e => setNewItemLoc(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowAddItemModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
              >
                Save Item
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
