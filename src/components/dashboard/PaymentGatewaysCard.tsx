import React, { useState } from 'react';
import {
  Banknote,
  Copy,
  Check,
  ExternalLink,
  MessageSquare,
  PlusCircle,
} from 'lucide-react';
import { PaymentRecord } from '../../types';

interface PaymentGatewaysCardProps {
  payments?: PaymentRecord[];
  onOpenQuickPayment: () => void;
  onNavigateTab: (tabId: string) => void;
}

export const PaymentGatewaysCard: React.FC<PaymentGatewaysCardProps> = ({
  onOpenQuickPayment,
}) => {
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'all' | 'doorstep' | 'easypaisa' | 'jazzcash'>('all');

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2500);
  };

  // Pre-formatted message ready for WhatsApp & SMS to subscribers
  const buildBillingInstructionsMessage = () => {
    return `*OptiCable Net — Payment Modes & Gateway Details*\n\n` +
      `Dear Subscriber,\nPlease use any of our authorized payment options to clear your internet subscription:\n\n` +
      `1️⃣ *Cash at Doorstep:* Call Lineman Tariq Mehmood at +92 300 0192830 for doorstep cash collection with instant slip.\n` +
      `2️⃣ *Easypaisa:* Account: OptiCable Net Pvt Ltd | Number: 0300-0192830 | Till ID: 882910\n` +
      `3️⃣ *JazzCash / JassCash:* Account: OptiCable Net Services | Number: 0301-8765432 | Till ID: 771420\n\n` +
      `After payment, your connection is extended automatically. Thank you!`;
  };

  return (
    <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-3">
      {/* Top Header Row with Title on Left & Stacked Up-and-Down Action Buttons on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-start gap-2.5">
          <div className="p-1.5 rounded-lg bg-emerald-100 text-emerald-800 shrink-0 mt-0.5">
            <Banknote className="w-4 h-4" />
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-900 tracking-tight leading-tight">
              Payment Mode & Gateway Details
            </h2>
            <p className="text-xs text-slate-500 mt-0.5 max-w-md leading-relaxed">
              Active gateway routing for subscriber billing via Cash at Doorstep, Easypaisa, and JazzCash/JassCash.
            </p>
          </div>
        </div>

        {/* Action Buttons stacked parallel-wise up & down */}
        <div className="flex flex-row sm:flex-col gap-1.5 shrink-0 self-start sm:self-center">
          <button
            onClick={onOpenQuickPayment}
            className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs min-w-[125px]"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={() => handleCopy(buildBillingInstructionsMessage(), 'all_instructions')}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white hover:bg-slate-50 border border-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-2xs min-w-[125px]"
            title="Copy payment gateway details"
          >
            {copiedKey === 'all_instructions' ? (
              <>
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span className="text-emerald-700 font-bold">Copied!</span>
              </>
            ) : (
              <>
                <Copy className="w-3.5 h-3.5 text-slate-400" />
                <span>Copy Details</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Second Row: Gateway Selector Pills on Left + Send via WhatsApp on Right */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pt-1 border-t border-slate-100">
        <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs">
          {[
            { id: 'all', label: 'All Gateways' },
            { id: 'doorstep', label: 'Cash at Doorstep' },
            { id: 'easypaisa', label: 'Easypaisa' },
            { id: 'jazzcash', label: 'JazzCash / JassCash' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`px-2.5 py-1 rounded-md font-medium transition-colors cursor-pointer text-xs ${
                activeTab === tab.id
                  ? 'bg-white text-slate-900 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <a
          href={`https://wa.me/?text=${encodeURIComponent(buildBillingInstructionsMessage())}`}
          target="_blank"
          rel="noopener noreferrer"
          className="text-xs font-semibold text-emerald-700 hover:text-emerald-800 flex items-center justify-center gap-1.5 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 px-3 py-1.5 rounded-lg cursor-pointer transition-colors shrink-0"
        >
          <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
          <span>Send via WhatsApp</span>
          <ExternalLink className="w-3 h-3 text-emerald-600" />
        </a>
      </div>

      {/* Compact 1-line gateway details indicator (fits nicely without extending section height) */}
      <div className="px-3 py-2 bg-slate-50 border border-slate-200/80 rounded-lg text-xs flex flex-wrap items-center justify-between gap-2 text-slate-600">
        {activeTab === 'all' && (
          <>
            <span className="truncate text-[11px] sm:text-xs">
              <strong className="text-slate-900">Active Routing:</strong> Doorstep Pickup (0300-0192830) · Easypaisa Till (882910) · JazzCash/JassCash Till (771420)
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
              0% Gateway Surcharge
            </span>
          </>
        )}
        {activeTab === 'doorstep' && (
          <>
            <span className="truncate text-[11px] sm:text-xs">
              <strong className="text-amber-900">Cash at Doorstep:</strong> Lineman Tariq Mehmood · Contact: 0300-0192830 · Physical slip provided on spot
            </span>
            <span className="text-[10px] font-semibold text-amber-800 bg-amber-100 px-2 py-0.5 rounded shrink-0">
              Gulshan, Clifton, PECHS
            </span>
          </>
        )}
        {activeTab === 'easypaisa' && (
          <>
            <span className="truncate text-[11px] sm:text-xs">
              <strong className="text-emerald-900">Easypaisa Wallet:</strong> Title: OptiCable Net Pvt · Number: 0300-0192830 · Merchant Till: 882910
            </span>
            <span className="text-[10px] font-semibold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded shrink-0">
              Instant Auto-Credit
            </span>
          </>
        )}
        {activeTab === 'jazzcash' && (
          <>
            <span className="truncate text-[11px] sm:text-xs">
              <strong className="text-rose-900">JazzCash / JassCash:</strong> Title: OptiCable Services · Number: 0301-8765432 · Merchant Till: 771420
            </span>
            <span className="text-[10px] font-semibold text-rose-800 bg-rose-100 px-2 py-0.5 rounded shrink-0">
              Agent & App Transfer
            </span>
          </>
        )}
      </div>
    </div>
  );
};
