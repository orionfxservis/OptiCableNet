import React, { useState } from 'react';
import {
  Users,
  Network,
  BellRing,
  Banknote,
  Wrench,
  CheckCircle2,
  ChevronRight,
  ArrowRight,
  Layers,
  Sparkles,
} from 'lucide-react';
import { Client, NetworkNode, CableRun, InventoryItem, MaintenanceSchedule, PaymentRecord } from '../../types';

interface WorkflowPipelineProps {
  clients: Client[];
  nodes: NetworkNode[];
  cableRuns: CableRun[];
  inventory: InventoryItem[];
  maintenance: MaintenanceSchedule[];
  payments: PaymentRecord[];
  onNavigateTab: (tabId: string) => void;
  onOpenQuickPayment: () => void;
}

export const WorkflowPipeline: React.FC<WorkflowPipelineProps> = ({
  clients,
  nodes,
  cableRuns,
  inventory,
  maintenance,
  payments,
  onNavigateTab,
  onOpenQuickPayment,
}) => {
  const [selectedStage, setSelectedStage] = useState<number | null>(null);

  // Real-time calculated workflow metrics
  const activeClients = clients.filter(c => c.status === 'active').length;
  const expiringClients = clients.filter(c => c.status === 'expiring_soon').length;
  const totalKm = (cableRuns.reduce((acc, c) => acc + c.lengthMeters, 0) / 1000).toFixed(1);
  const onlineNodes = nodes.filter(n => n.status === 'online').length;
  const totalCollections = payments.reduce((acc, p) => acc + p.amount, 0);
  const pendingDues = clients.reduce((acc, c) => acc + c.balanceDue, 0);
  const lowStock = inventory.filter(i => i.quantityInStock <= i.minimumThreshold).length;
  const scheduledMaint = maintenance.filter(m => m.status === 'scheduled').length;

  const stages = [
    {
      step: '01',
      title: 'Customer Onboarding',
      shortTitle: 'Onboarding & ONU',
      icon: Users,
      color: 'sky',
      badgeClass: 'bg-sky-50 text-sky-800 border-sky-200',
      barColor: 'bg-sky-500',
      actionLabel: 'Client Records',
      targetTab: 'clients',
      metrics: [
        { label: 'Subscribers', value: `${clients.length} Registered` },
        { label: 'Active Lines', value: `${activeClients} Connected` },
      ],
      description: 'Customer profile registration, static IP assignment, ONU MAC configuration, and package setup.',
    },
    {
      step: '02',
      title: 'Optical Distribution',
      shortTitle: 'Core Fiber & Splitters',
      icon: Network,
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barColor: 'bg-emerald-500',
      actionLabel: 'Topology Map',
      targetTab: 'topology',
      metrics: [
        { label: 'Network Nodes', value: `${onlineNodes}/${nodes.length} Online` },
        { label: 'Fiber Cable', value: `${totalKm} km Plant` },
      ],
      description: 'Real-time telemetry, OLT/FDH/FDB splitter health, signal power (-18 to -24 dBm), and latency testing.',
    },
    {
      step: '03',
      title: 'Expiry Alerts',
      shortTitle: 'Renewal & WhatsApp',
      icon: BellRing,
      color: 'amber',
      badgeClass: 'bg-amber-50 text-amber-800 border-amber-200',
      barColor: 'bg-amber-500',
      actionLabel: 'Expiry Alerts',
      targetTab: 'clients',
      metrics: [
        { label: 'Expiring Soon', value: `${expiringClients} within 3d` },
        { label: 'Outstanding Dues', value: `Rs. ${pendingDues.toLocaleString()}` },
      ],
      description: 'Automated 72-hour expiry threshold detection with 1-click formatted WhatsApp reminder delivery.',
    },
    {
      step: '04',
      title: 'Payment Collection',
      shortTitle: 'Cash & Wallets',
      icon: Banknote,
      color: 'emerald',
      badgeClass: 'bg-emerald-50 text-emerald-800 border-emerald-200',
      barColor: 'bg-emerald-600',
      actionLabel: 'Record Payment',
      targetTab: 'clients',
      onClickAction: onOpenQuickPayment,
      metrics: [
        { label: 'Monthly Paid', value: `Rs. ${totalCollections.toLocaleString()}` },
        { label: 'Receipts', value: `${payments.length} Logged` },
      ],
      description: 'Multi-channel collection via Cash at Doorstep, Bank Wire, Easypaisa, or JazzCash with printable slip.',
    },
    {
      step: '05',
      title: 'Spares & Field Maint',
      shortTitle: 'Audits & Linemen',
      icon: Wrench,
      color: 'rose',
      badgeClass: 'bg-rose-50 text-rose-800 border-rose-200',
      barColor: 'bg-rose-500',
      actionLabel: 'Stock Audit',
      targetTab: 'inventory',
      metrics: [
        { label: 'Reorder SKUs', value: `${lowStock} Low Stock` },
        { label: 'Field Jobs', value: `${scheduledMaint} Scheduled` },
      ],
      description: 'Hardware inventory tracking, fiber patch cables and splice trays audit, and lineman dispatch.',
    },
  ];

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <h2 className="text-sm font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Layers className="w-4 h-4 text-sky-600" />
            <span>OptiCable End-to-End Operational Workflow</span>
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Real-time pipeline: from client onboarding and optical transmission to WhatsApp billing, collection, and maintenance.
          </p>
        </div>
        <div className="flex items-center gap-2 text-xs text-slate-500">
          <span className="inline-flex items-center gap-1 font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200">
            5 Connected Stages
          </span>
        </div>
      </div>

      {/* Stepped Visual Workflow Cards */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-3 relative">
        {stages.map((stage, idx) => {
          const Icon = stage.icon;
          const isSelected = selectedStage === idx;

          return (
            <div
              key={stage.step}
              onClick={() => {
                setSelectedStage(isSelected ? null : idx);
              }}
              className={`relative rounded-xl border p-3.5 transition-all cursor-pointer flex flex-col justify-between ${
                isSelected
                  ? 'border-sky-500 bg-sky-50/40 shadow-sm ring-1 ring-sky-400/50'
                  : 'border-slate-200 bg-white hover:border-slate-300 hover:shadow-2xs'
              }`}
            >
              {/* Step indicator bar at top */}
              <div className={`w-full h-1 rounded-full mb-2.5 ${stage.barColor}`} />

              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-[10px] font-bold tracking-wider uppercase font-mono text-slate-400">
                    STAGE {stage.step}
                  </span>
                  <div className="p-1 rounded-md bg-slate-100 text-slate-700">
                    <Icon className="w-3.5 h-3.5" />
                  </div>
                </div>

                <div className="text-xs font-bold text-slate-900 leading-snug">
                  {stage.title}
                </div>
                <div className="text-[11px] text-slate-500 mt-0.5 leading-tight">
                  {stage.shortTitle}
                </div>

                {/* Metrics Badges */}
                <div className="mt-3 space-y-1.5 pt-2 border-t border-slate-100 text-[11px]">
                  {stage.metrics.map(m => (
                    <div key={m.label} className="flex items-center justify-between">
                      <span className="text-slate-400 text-[10px]">{m.label}:</span>
                      <span className="font-semibold text-slate-800 font-mono text-[11px]">
                        {m.value}
                      </span>
                    </div>
                  ))}
                </div>
              </div>

              {/* Action shortcut button */}
              <div className="mt-3 pt-2 border-t border-slate-100/80 flex items-center justify-between">
                <button
                  type="button"
                  onClick={e => {
                    e.stopPropagation();
                    if (stage.onClickAction) {
                      stage.onClickAction();
                    } else {
                      onNavigateTab(stage.targetTab);
                    }
                  }}
                  className="text-[11px] font-semibold text-sky-600 hover:text-sky-800 flex items-center gap-1 cursor-pointer"
                >
                  <span>{stage.actionLabel}</span>
                  <ArrowRight className="w-2.5 h-2.5" />
                </button>

                <CheckCircle2 className="w-3 h-3 text-emerald-500" />
              </div>
            </div>
          );
        })}
      </div>

      {/* Expanded Workflow Detail Panel if a stage is selected */}
      {selectedStage !== null && (
        <div className="p-3.5 bg-slate-50 rounded-lg border border-slate-200 text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-200">
          <div className="flex items-start sm:items-center gap-3">
            <div className="p-2 rounded-lg bg-sky-100 text-sky-800 shrink-0">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <div className="font-bold text-slate-900">
                Stage {stages[selectedStage].step}: {stages[selectedStage].title} — Process Details
              </div>
              <div className="text-slate-600 mt-0.5 text-xs">
                {stages[selectedStage].description}
              </div>
            </div>
          </div>

          <button
            onClick={() => {
              const target = stages[selectedStage];
              if (target.onClickAction) {
                target.onClickAction();
              } else {
                onNavigateTab(target.targetTab);
              }
            }}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg transition-colors flex items-center gap-1 shrink-0 self-start sm:self-auto cursor-pointer"
          >
            <span>Open {stages[selectedStage].actionLabel}</span>
            <ArrowRight className="w-3 h-3" />
          </button>
        </div>
      )}
    </div>
  );
};
