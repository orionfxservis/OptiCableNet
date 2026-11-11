import React from 'react';
import { useApp } from '../../context/AppContext';
import {
  Users,
  Banknote,
  Activity,
  AlertTriangle,
  ArrowRight,
  Clock,
  MessageSquare,
  Wrench,
  CheckCircle,
  Play,
  Zap,
  PlusCircle,
} from 'lucide-react';
import { DashboardCharts } from './DashboardCharts';
import { WorkflowPipeline } from './WorkflowPipeline';
import { PaymentGatewaysCard } from './PaymentGatewaysCard';
import { Client } from '../../types';

interface OverviewViewProps {
  onOpenQuickPayment: (clientId?: string) => void;
  onOpenPaymentAlert: (client: Client) => void;
}

export const OverviewView: React.FC<OverviewViewProps> = ({
  onOpenQuickPayment,
  onOpenPaymentAlert,
}) => {
  const {
    clients,
    nodes,
    cableRuns,
    inventory,
    alerts,
    maintenance,
    expenses,
    payments,
    setActiveTab,
    simulateFiberCut,
    simulateLatencySpike,
  } = useApp();

  // Metrics computation
  const totalSubscribers = clients.length;
  const activeSubscribers = clients.filter(c => c.status === 'active').length;
  const expiringSoonSubscribers = clients.filter(c => c.status === 'expiring_soon');
  const expiredSubscribers = clients.filter(c => c.status === 'expired' || c.status === 'suspended');

  const totalOutstandingDues = clients.reduce((acc, c) => acc + c.balanceDue, 0);
  const totalMonthlyBilled = clients.reduce((acc, c) => acc + c.monthlyFee, 0);
  const currentMonthCollections = payments.reduce((acc, p) => acc + p.amount, 0);

  const totalCableLengthMeters = cableRuns.reduce((acc, c) => acc + c.lengthMeters, 0);
  const onlineNodesCount = nodes.filter(n => n.status === 'online').length;
  const totalNodesCount = nodes.length;

  const lowStockItems = inventory.filter(i => i.quantityInStock <= i.minimumThreshold);
  const unresolvedAlerts = alerts.filter(a => !a.resolved);
  const criticalAlerts = unresolvedAlerts.filter(a => a.severity === 'critical');

  const totalExpenses = expenses.reduce((acc, e) => acc + e.amount, 0);

  return (
    <div className="space-y-6 pb-20">
      {/* Critical Alert Warning Strip if active */}
      {criticalAlerts.length > 0 && (
        <div className="bg-rose-50 border border-rose-200 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 bg-rose-100 text-rose-700 rounded-lg shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <div className="text-sm font-bold text-rose-950">
                Critical Connection Failure Detected ({criticalAlerts.length})
              </div>
              <div className="text-xs text-rose-800">
                {criticalAlerts[0].title} — {criticalAlerts[0].description}
              </div>
            </div>
          </div>
          <button
            onClick={() => setActiveTab('alerts')}
            className="px-3.5 py-1.5 text-xs font-semibold text-rose-900 bg-white border border-rose-300 rounded-lg hover:bg-rose-100 transition-colors shrink-0 self-start sm:self-auto cursor-pointer"
          >
            Review Alerts
          </button>
        </div>
      )}

      {/* Top Header & Simulation Testing Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Network Operations & Billing Overview
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time optical cable monitoring, subscriber lifecycle, and cash flow ledger.
          </p>
        </div>

        {/* Quick Testing & Action buttons */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Record Payment moved here under the menu */}
          <button
            onClick={() => onOpenQuickPayment()}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 shadow-2xs cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => {
              const testCable = cableRuns.find(c => c.status === 'nominal');
              if (testCable) simulateFiberCut(testCable.id);
            }}
            title="Simulate a real-time fiber cable cut to test alerts"
            className="px-3 py-1.5 text-xs font-medium text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Play className="w-3.5 h-3.5 text-rose-600" />
            <span>Simulate Fiber Cut</span>
          </button>

          <button
            onClick={() => {
              const targetNode = nodes.find(n => n.type === 'FDH' || n.type === 'FDB');
              if (targetNode) simulateLatencySpike(targetNode.id);
            }}
            title="Simulate high ping latency spike"
            className="px-3 py-1.5 text-xs font-medium text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 text-amber-600" />
            <span>Simulate Latency Spike</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Height reduced by 15%, filled with standard domain colors) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Subscribers - Standard Blue */}
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Subscribers</span>
            <div className="p-1 rounded-md bg-sky-100/80 text-sky-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-sky-950 tabular-nums leading-tight">
            {totalSubscribers}
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium">
            <span className="text-sky-900 font-semibold">{activeSubscribers} Active</span>
            <span>·</span>
            <span className="text-amber-800">{expiringSoonSubscribers.length} Expiring</span>
          </div>
        </div>

        {/* Outstanding Dues - Standard Amber */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Outstanding Dues</span>
            <div className="p-1 rounded-md bg-amber-100/80 text-amber-800">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight">
            Rs. {totalOutstandingDues.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium">
            <span>Billed: Rs. {totalMonthlyBilled.toLocaleString()}/mo</span>
            <span>·</span>
            <span className="text-emerald-800 font-semibold">Rs. {currentMonthCollections.toLocaleString()} Paid</span>
          </div>
        </div>

        {/* Network & Optical Nodes - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Node Health</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <Activity className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight">
            {onlineNodesCount} / {totalNodesCount}
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium">
            <span className="text-emerald-900 font-semibold">
              {Math.round((onlineNodesCount / totalNodesCount) * 100)}% Operational
            </span>
            <span>·</span>
            <span>{(totalCableLengthMeters / 1000).toFixed(1)} km Fiber</span>
          </div>
        </div>

        {/* Critical Alerts & Low Stock - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Action Items</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight">
            {unresolvedAlerts.length} Alerts
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium">
            <span className={lowStockItems.length > 0 ? 'text-amber-800 font-bold' : 'text-rose-800'}>
              {lowStockItems.length} Low Stock Item{lowStockItems.length !== 1 ? 's' : ''}
            </span>
            <span>·</span>
            <span>{maintenance.filter(m => m.status === 'scheduled').length} Maint</span>
          </div>
        </div>
      </div>

      {/* Operational Workflow Pipeline Graphic */}
      <WorkflowPipeline
        clients={clients}
        nodes={nodes}
        cableRuns={cableRuns}
        inventory={inventory}
        maintenance={maintenance}
        payments={payments}
        onNavigateTab={setActiveTab}
        onOpenQuickPayment={onOpenQuickPayment}
      />

      {/* Interactive Pie / Donut Charts & Real-Time System Gauges */}
      <DashboardCharts
        clients={clients}
        payments={payments}
        nodes={nodes}
        cableRuns={cableRuns}
        totalMonthlyBilled={totalMonthlyBilled}
        currentMonthCollections={currentMonthCollections}
        totalOutstandingDues={totalOutstandingDues}
        onNavigateTab={setActiveTab}
      />

      {/* Main Split: Left - Urgent Package Expiry & Alerts; Right - Cable & Signal Monitor */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column (7 cols): Clients Expiring Soon & Payment Reminder Generator */}
        <div className="lg:col-span-7 space-y-4">
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Package Expiry & Payment Alerts
                </h2>
                <p className="text-xs text-slate-500">
                  Subscribers due for renewal within 3 days. Send WhatsApp/SMS reminder or record cash.
                </p>
              </div>
              <button
                onClick={() => setActiveTab('clients')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 flex items-center gap-1 cursor-pointer"
              >
                View All Clients
                <ArrowRight className="w-3 h-3" />
              </button>
            </div>

            {/* List of Expiring or Expired Subscribers */}
            <div className="space-y-3">
              {[...expiringSoonSubscribers, ...expiredSubscribers.slice(0, 2)].map(client => {
                const isExpired = client.status === 'expired' || client.status === 'suspended';
                return (
                  <div
                    key={client.id}
                    className="p-3.5 rounded-lg border border-slate-100 hover:border-slate-200 hover:bg-slate-50/50 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {client.name}
                        </span>
                        <span
                          className={`text-[11px] font-medium px-2 py-0.5 rounded-md ${
                            isExpired
                              ? 'bg-rose-50 text-rose-700 border border-rose-200'
                              : 'bg-amber-50 text-amber-700 border border-amber-200'
                          }`}
                        >
                          {isExpired ? 'Expired' : 'Expiring Soon'}
                        </span>
                      </div>
                      <div className="text-xs text-slate-500 flex flex-wrap items-center gap-2">
                        <span>{client.packageName}</span>
                        <span>·</span>
                        <span className="font-mono tabular-nums text-slate-700">
                          Expiry: {client.packageExpiryDate}
                        </span>
                        <span>·</span>
                        <span className="font-semibold text-amber-600">
                          Due: Rs. {client.balanceDue.toLocaleString()}
                        </span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {client.phone} · {client.zone}
                      </div>
                    </div>

                    {/* Action buttons: Alert & Collect */}
                    <div className="flex items-center gap-2 self-start sm:self-auto shrink-0">
                      <button
                        onClick={() => onOpenPaymentAlert(client)}
                        className="px-2.5 py-1.5 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                        title="Generate WhatsApp / SMS payment alert"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                        <span>Send Alert</span>
                      </button>

                      <button
                        onClick={() => onOpenQuickPayment(client.id)}
                        className="px-2.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                      >
                        Collect
                      </button>
                    </div>
                  </div>
                );
              })}

              {expiringSoonSubscribers.length === 0 && expiredSubscribers.length === 0 && (
                <div className="py-8 text-center text-slate-500 text-xs">
                  <CheckCircle className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                  All subscriber packages are active and up to date!
                </div>
              )}
            </div>
          </div>

          {/* Upcoming Maintenance Schedules Summary */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
                <Wrench className="w-4 h-4 text-sky-600" />
                Upcoming Maintenance Schedules
              </h2>
              <button
                onClick={() => setActiveTab('maintenance')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                Schedule & Calendar →
              </button>
            </div>

            <div className="space-y-2.5">
              {maintenance.slice(0, 3).map(m => (
                <div
                  key={m.id}
                  className="p-3 rounded-lg border border-slate-100 bg-slate-50/60 flex flex-col sm:flex-row sm:items-center justify-between gap-2"
                >
                  <div>
                    <div className="text-xs font-bold text-slate-900">{m.title}</div>
                    <div className="text-[11px] text-slate-500 mt-0.5 flex flex-wrap items-center gap-2">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-400" />
                        {m.scheduledDate}
                      </span>
                      <span>·</span>
                      <span>Assigned: {m.assignedTechnician}</span>
                      <span>·</span>
                      <span className="font-semibold text-slate-700">
                        {m.affectedClientsCount} clients affected
                      </span>
                    </div>
                  </div>
                  <span
                    className={`text-[10px] font-semibold px-2 py-0.5 rounded-full uppercase shrink-0 ${
                      m.priority === 'high'
                        ? 'bg-rose-100 text-rose-800'
                        : 'bg-sky-100 text-sky-800'
                    }`}
                  >
                    {m.priority} Priority
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Payment Mode & Gateway Details (Cash at Doorstep, Easypaisa, JazzCash) */}
          <PaymentGatewaysCard
            payments={payments}
            onOpenQuickPayment={onOpenQuickPayment}
            onNavigateTab={setActiveTab}
          />
        </div>

        {/* Right Column (5 cols): Network Performance, Cable Attenuation & Hardware Inventory Alert */}
        <div className="lg:col-span-5 space-y-4">
          {/* Signal & Optical Power Summary Card */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div>
                <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                  Optical Signal & Cable Health
                </h2>
                <p className="text-xs text-slate-500">Live fiber attenuation and ping metrics</p>
              </div>
              <button
                onClick={() => setActiveTab('performance')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                Monitor Details →
              </button>
            </div>

            <div className="space-y-3.5">
              {/* Node Optical Power Table */}
              {nodes.slice(0, 4).map(node => {
                const rx = node.rxPowerDbm ?? -20;
                // Nominal range: -18 to -24 dBm. High loss: <-25 dBm
                const isDegraded = rx < -25 || node.status === 'degraded' || node.status === 'offline';
                return (
                  <div
                    key={node.id}
                    className="p-2.5 rounded-lg border border-slate-100 flex items-center justify-between"
                  >
                    <div>
                      <div className="text-xs font-semibold text-slate-900 truncate max-w-[190px]">
                        {node.name}
                      </div>
                      <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                        <span className="font-mono tabular-nums">{node.latencyMs}ms</span>
                        <span>·</span>
                        <span>{node.type}</span>
                        <span>·</span>
                        <span className="capitalize">{node.zone}</span>
                      </div>
                    </div>
                    <div className="text-right">
                      <div
                        className={`text-xs font-bold font-mono tabular-nums ${
                          isDegraded ? 'text-rose-600' : 'text-emerald-600'
                        }`}
                      >
                        {rx.toFixed(1)} dBm
                      </div>
                      <span className="text-[10px] text-slate-400 block">
                        {isDegraded ? 'Loss Warning' : 'Optimal'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Link to Topology Map */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Fiber Splicing & Cable Runs</span>
              <button
                onClick={() => setActiveTab('topology')}
                className="font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                Open Network Topology Map →
              </button>
            </div>
          </div>

          {/* Hardware Inventory Status & Audit Quick Strip */}
          <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs">
            <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-3">
              <h2 className="text-sm font-bold text-slate-900 tracking-tight">
                Hardware Stock & Audits
              </h2>
              <button
                onClick={() => setActiveTab('inventory')}
                className="text-xs font-semibold text-sky-600 hover:text-sky-700 cursor-pointer"
              >
                Full Stock Audit →
              </button>
            </div>

            <div className="space-y-2">
              {lowStockItems.length > 0 ? (
                lowStockItems.map(item => (
                  <div
                    key={item.id}
                    className="p-2.5 rounded-lg bg-amber-50/70 border border-amber-200 flex items-center justify-between text-xs"
                  >
                    <div>
                      <span className="font-bold text-amber-950 block">{item.name}</span>
                      <span className="text-[11px] text-amber-800">
                        Remaining: {item.quantityInStock} {item.unit} (Min: {item.minimumThreshold})
                      </span>
                    </div>
                    <span className="text-[10px] font-bold uppercase text-amber-900 bg-amber-200/70 px-2 py-0.5 rounded">
                      Reorder
                    </span>
                  </div>
                ))
              ) : (
                <div className="text-xs text-slate-500 py-3 text-center">
                  All inventory items are within safe stock levels.
                </div>
              )}
            </div>

            {/* Quick cash flow banner */}
            <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-500">Expenses this month</span>
              <span className="font-bold text-slate-800 font-mono tabular-nums">
                Rs. {totalExpenses.toLocaleString()}
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
