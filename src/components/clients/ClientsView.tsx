import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { Client, PaymentRecord } from '../../types';
import {
  Users,
  Search,
  PlusCircle,
  MessageSquare,
  Banknote,
  Receipt,
  Download,
  Calendar,
  AlertCircle,
  CheckCircle2,
  Phone,
  MapPin,
  Wifi,
  ExternalLink,
  Copy,
  Printer,
  ChevronRight,
} from 'lucide-react';
import { exportToCsv, triggerPrintWindow } from '../../utils/exportUtils';

interface ClientsViewProps {
  initialSelectedClientId?: string;
  openPaymentTrigger?: number;
  paymentAlertClient?: Client | null;
  onClosePaymentAlert?: () => void;
  onOpenQuickPayment?: (clientId?: string) => void;
}

export const ClientsView: React.FC<ClientsViewProps> = ({
  initialSelectedClientId,
  openPaymentTrigger,
  paymentAlertClient: propAlertClient,
  onClosePaymentAlert,
  onOpenQuickPayment,
}) => {
  const {
    clients,
    nodes,
    payments,
    addClient,
    updateClient,
    deleteClient,
    recordClientPayment,
  } = useApp();

  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [areaFilter, setAreaFilter] = useState<string>('all');
  const [paymentMethodFilter, setPaymentMethodFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Extract unique areas / zones from subscribers
  const areas = Array.from(new Set(clients.map(c => c.zone))).filter(Boolean);

  // Local state for payment alert modal
  const [activeAlertClient, setActiveAlertClient] = useState<Client | null>(
    propAlertClient || null
  );

  // Local state for payment collection modal
  const [collectingClient, setCollectingClient] = useState<Client | null>(
    initialSelectedClientId
      ? clients.find(c => c.id === initialSelectedClientId) || null
      : null
  );
  const [collectAmount, setCollectAmount] = useState<number>(1800);
  const [extendMonths, setExtendMonths] = useState<number>(1);
  const [payMethod, setPayMethod] = useState<PaymentRecord['paymentMethod']>('Cash at Doorstep');
  const [collectorName, setCollectorName] = useState('Amina Noor (Billing)');
  const [payNotes, setPayNotes] = useState('');
  const [lastReceipt, setLastReceipt] = useState<PaymentRecord | null>(null);

  // Synchronize when initialSelectedClientId or openPaymentTrigger changes
  React.useEffect(() => {
    if (initialSelectedClientId) {
      const found = clients.find(c => c.id === initialSelectedClientId);
      if (found) {
        setCollectingClient(found);
        setCollectAmount(found.balanceDue > 0 ? found.balanceDue : found.monthlyFee);
        setLastReceipt(null);
      }
    }
  }, [initialSelectedClientId, openPaymentTrigger, clients]);

  // Add Client Form State
  const [newName, setNewName] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newEmail, setNewEmail] = useState('');
  const [newAddress, setNewAddress] = useState('');
  const [newZone, setNewZone] = useState('North District - Sector 4');
  const [newConnType, setNewConnType] = useState<Client['connectionType']>('FTTH_Fiber');
  const [newPackage, setNewPackage] = useState('Fiber Home Essential (40 Mbps)');
  const [newBandwidth, setNewBandwidth] = useState(40);
  const [newMonthlyFee, setNewMonthlyFee] = useState(1800);
  const [newIp, setNewIp] = useState('192.168.10.150');
  const [newMac, setNewMac] = useState('A4:83:E7:22:90:12');
  const [newOnu, setNewOnu] = useState('HWTC-77889900');
  const [newExpiry, setNewExpiry] = useState(
    new Date(Date.now() + 86400000 * 30).toISOString().split('T')[0]
  );

  // Copy notification text feedback
  const [copiedNotice, setCopiedNotice] = useState(false);

  // Calculate days until expiry
  const getDaysUntilExpiry = (expiryDateStr: string) => {
    const expiry = new Date(expiryDateStr);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    expiry.setHours(0, 0, 0, 0);
    const diffTime = expiry.getTime() - today.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const filteredClients = clients.filter(c => {
    const days = getDaysUntilExpiry(c.packageExpiryDate);

    if (statusFilter === 'expiring_soon') {
      if (days < 0 || days > 3) return false;
    } else if (statusFilter === 'expired') {
      if (days >= 0 && c.status !== 'expired' && c.status !== 'suspended') return false;
    } else if (statusFilter === 'dues') {
      if (c.balanceDue <= 0) return false;
    } else if (statusFilter === 'active') {
      if (c.status !== 'active') return false;
    }

    if (areaFilter !== 'all' && c.zone !== areaFilter) {
      return false;
    }

    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    return (
      c.name.toLowerCase().includes(q) ||
      c.phone.toLowerCase().includes(q) ||
      c.address.toLowerCase().includes(q) ||
      c.ipAddress.toLowerCase().includes(q) ||
      c.onuSerial.toLowerCase().includes(q) ||
      c.zone.toLowerCase().includes(q)
    );
  });

  const expiringCount = clients.filter(c => {
    const d = getDaysUntilExpiry(c.packageExpiryDate);
    const matchesArea = areaFilter === 'all' || c.zone === areaFilter;
    return matchesArea && d >= 0 && d <= 3;
  }).length;

  const expiredCount = clients.filter(c => {
    const d = getDaysUntilExpiry(c.packageExpiryDate);
    const matchesArea = areaFilter === 'all' || c.zone === areaFilter;
    return matchesArea && (d < 0 || c.status === 'expired' || c.status === 'suspended');
  }).length;

  const duesCount = clients.filter(c => {
    const matchesArea = areaFilter === 'all' || c.zone === areaFilter;
    return matchesArea && c.balanceDue > 0;
  }).length;

  const totalOutstandingDues = clients.reduce((acc, c) => acc + c.balanceDue, 0);
  const totalMonthlyBilled = clients.reduce((acc, c) => acc + c.monthlyFee, 0);
  const activeSubscribersCount = clients.filter(c => c.status === 'active').length;

  const filteredPayments = payments.filter(p => {
    const matchesMethod =
      paymentMethodFilter === 'all' || p.paymentMethod === paymentMethodFilter;
    const q = searchQuery.toLowerCase().trim();
    if (!matchesMethod) return false;
    if (!q) return true;
    return (
      p.clientName.toLowerCase().includes(q) ||
      p.receiptNumber.toLowerCase().includes(q) ||
      p.collectorName.toLowerCase().includes(q) ||
      (p.notes && p.notes.toLowerCase().includes(q)) ||
      p.paymentMethod.toLowerCase().includes(q)
    );
  });

  const handleExportPaymentsCsv = () => {
    const rows = payments.map(p => ({
      'Receipt No': p.receiptNumber,
      'Client Name': p.clientName,
      'Date': p.date,
      'Payment Method': p.paymentMethod,
      'Amount (Rs.)': p.amount,
      'Extension Months': p.packageExtendedMonths,
      'Collector': p.collectorName,
      'Notes': p.notes || '',
    }));
    exportToCsv(`Payments_Ledger_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  // Handle Create Client
  const handleCreateClient = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newName || !newPhone) return;

    addClient({
      name: newName,
      phone: newPhone,
      email: newEmail,
      address: newAddress,
      zone: newZone,
      connectionType: newConnType,
      ipAddress: newIp,
      macAddress: newMac,
      onuSerial: newOnu,
      connectedNodeId: nodes[0]?.id || 'node-olt-01',
      packageName: newPackage,
      bandwidthMbps: Number(newBandwidth),
      monthlyFee: Number(newMonthlyFee),
      balanceDue: 0,
      joiningDate: new Date().toISOString().split('T')[0],
      packageExpiryDate: newExpiry,
      status: 'active',
    });

    setShowAddModal(false);
    setNewName('');
    setNewPhone('');
    setNewAddress('');
  };

  // Handle Payment Submit
  const handlePaymentSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectingClient) return;

    const receipt = recordClientPayment({
      clientId: collectingClient.id,
      amount: Number(collectAmount),
      extensionMonths: Number(extendMonths),
      paymentMethod: payMethod,
      collectorName,
      notes: payNotes,
    });

    setLastReceipt(receipt);
  };

  // Generate Message Template
  const buildAlertMessage = (client: Client) => {
    const days = getDaysUntilExpiry(client.packageExpiryDate);
    const dueAmount = client.balanceDue > 0 ? client.balanceDue : client.monthlyFee;

    let urgency = `will expire in ${days} days on ${client.packageExpiryDate}`;
    if (days === 0) urgency = `expires TODAY (${client.packageExpiryDate})`;
    else if (days < 0) urgency = `has EXPIRED on ${client.packageExpiryDate}`;

    return `Dear ${client.name}, this is an automated reminder from OptiCable Net. Your internet package "${client.packageName}" ${urgency}. Outstanding dues: Rs. ${dueAmount.toLocaleString()}. Please pay your subscription to ensure continuous high-speed connectivity. Contact Support / Lineman at +92 300 0192830 for instant payment pickup or online transfer. Thank you!`;
  };

  // Generate WhatsApp Receipt Message Template
  const buildReceiptWhatsAppMessage = (client: Client, receipt: PaymentRecord) => {
    return `*OptiCable Net — Official Payment Receipt*\n\n` +
      `Dear *${client.name}*,\n` +
      `Your subscription payment has been received successfully. Thank you for choosing OptiCable Net!\n\n` +
      `🧾 *Receipt No:* ${receipt.receiptNumber}\n` +
      `💵 *Amount Paid:* Rs. ${receipt.amount.toLocaleString()}\n` +
      `💳 *Payment Method:* ${receipt.paymentMethod}\n` +
      `📅 *Date:* ${receipt.date}\n` +
      `⚡ *Package Extension:* +${receipt.packageExtendedMonths} Month(s)\n` +
      `📦 *Package:* ${client.packageName} (${client.bandwidthMbps} Mbps)\n` +
      `⏳ *New Expiry Date:* ${client.packageExpiryDate}\n` +
      `💰 *Remaining Balance:* Rs. ${client.balanceDue.toLocaleString()}\n` +
      `👤 *Collected By:* ${receipt.collectorName}\n` +
      (receipt.notes ? `📝 *Notes:* ${receipt.notes}\n` : '') +
      `\nFor any queries or billing support, please reply to this message. Enjoy high-speed uninterrupted connectivity!`;
  };

  const handleExportCsv = () => {
    const rows = clients.map(c => ({
      'Client ID': c.id,
      'Name': c.name,
      'Phone': c.phone,
      'Address': c.address,
      'Zone': c.zone,
      'Connection Type': c.connectionType,
      'Package': c.packageName,
      'Speed (Mbps)': c.bandwidthMbps,
      'Monthly Fee (Rs.)': c.monthlyFee,
      'Outstanding Balance (Rs.)': c.balanceDue,
      'Expiry Date': c.packageExpiryDate,
      'Status': c.status,
      'IP Address': c.ipAddress,
      'MAC Address': c.macAddress,
      'ONU Serial': c.onuSerial,
    }));
    exportToCsv(`Subscribers_Ledger_${new Date().toISOString().slice(0, 10)}`, rows);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Client Records, Outstanding Dues & Package Expiry
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Monitor renewal deadlines, send WhatsApp/SMS payment alerts, and manage subscriber billing.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          {/* Quick Record Payment Button directly under menu in Clients tab */}
          <button
            onClick={() => {
              const clientToPay = clients.find(c => c.balanceDue > 0) || clients[0];
              if (clientToPay) {
                setCollectingClient(clientToPay);
                setCollectAmount(clientToPay.balanceDue > 0 ? clientToPay.balanceDue : clientToPay.monthlyFee);
                setLastReceipt(null);
              }
            }}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Banknote className="w-3.5 h-3.5" />
            <span>Record Payment</span>
          </button>

          <button
            onClick={handleExportCsv}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs"
          >
            <Download className="w-3.5 h-3.5 text-slate-600" />
            <span>Export Subscribers</span>
          </button>

          <button
            onClick={() => setShowAddModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>New Customer</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Same compact size & standard color fill as Overview) */}
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
            {clients.length}
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-sky-900 font-semibold">{activeSubscribersCount} Active</span>
            <span>·</span>
            <span className="text-amber-800 font-medium">{expiringCount} Expiring</span>
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
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight font-mono">
            Rs. {totalOutstandingDues.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span>Billed: Rs. {totalMonthlyBilled.toLocaleString()}/mo</span>
            <span>·</span>
            <span className="text-amber-950 font-semibold">{duesCount} Due</span>
          </div>
        </div>

        {/* Expiring Soon & Grace Period - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Paid Subscriptions</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight">
            {activeSubscribersCount} / {clients.length}
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-emerald-950 font-semibold">
              {Math.round((activeSubscribersCount / Math.max(1, clients.length)) * 100)}% Current
            </span>
            <span>·</span>
            <span>Uninterrupted Service</span>
          </div>
        </div>

        {/* Expired / Due Alerts - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Action Required</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <AlertCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight">
            {expiringCount + expiredCount} Renewal Alerts
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-rose-950 font-semibold">{expiredCount} Expired</span>
            <span>·</span>
            <span>{expiringCount} within 3 days</span>
          </div>
        </div>
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3">
          <div className="flex flex-col sm:flex-row sm:items-center gap-2.5 flex-1 max-w-xl">
            <div className="relative flex-1">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search by client name, phone, IP, Area..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
              />
            </div>

            {/* Area Filter Dropdown directly after search */}
            <div className="flex items-center gap-1.5 text-xs text-slate-600 shrink-0">
              <MapPin className="w-3.5 h-3.5 text-slate-400" />
              <span className="font-medium text-slate-600">Area:</span>
              <select
                value={areaFilter}
                onChange={e => setAreaFilter(e.target.value)}
                className="text-xs py-2 px-2.5 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 cursor-pointer font-medium text-slate-700"
              >
                <option value="all">All Areas</option>
                {areas.map(a => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Segmented Filter Buttons */}
          <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg">
            <button
              onClick={() => setStatusFilter('all')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              All ({clients.length})
            </button>

            <button
              onClick={() => setStatusFilter('expiring_soon')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'expiring_soon'
                  ? 'bg-white text-amber-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expiring Soon ({expiringCount})
            </button>

            <button
              onClick={() => setStatusFilter('expired')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'expired'
                  ? 'bg-white text-rose-700 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Expired ({expiredCount})
            </button>

            <button
              onClick={() => setStatusFilter('dues')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
                statusFilter === 'dues'
                  ? 'bg-white text-sky-700 shadow-2xs font-bold'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              Dues Only ({duesCount})
            </button>

            <button
              onClick={() => setStatusFilter('payments')}
              className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer flex items-center gap-1.5 ${
                statusFilter === 'payments'
                  ? 'bg-emerald-600 text-white shadow-2xs font-bold'
                  : 'text-emerald-700 hover:bg-emerald-50 bg-emerald-50/70 font-semibold'
              }`}
            >
              <Receipt className="w-3.5 h-3.5" />
              <span>Record Payment Table ({payments.length})</span>
            </button>
          </div>
        </div>

        {statusFilter === 'payments' ? (
          /* RECORD PAYMENT TABLE & COLLECTIONS LEDGER */
          <div className="space-y-3">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5 pt-1 pb-2 border-b border-slate-100">
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-xs font-bold text-slate-700 mr-1">Payment Method:</span>
                {[
                  { id: 'all', label: 'All Methods' },
                  { id: 'Cash at Doorstep', label: 'Cash at Doorstep' },
                  { id: 'Bank Wire / Transfer', label: 'Bank Wire / Transfer' },
                  { id: 'Easypaisa', label: 'Easypaisa' },
                  { id: 'JazzCash', label: 'JazzCash' },
                ].map(m => (
                  <button
                    key={m.id}
                    onClick={() => setPaymentMethodFilter(m.id)}
                    className={`px-2.5 py-1 text-xs rounded-lg font-medium transition-colors cursor-pointer ${
                      paymentMethodFilter === m.id
                        ? 'bg-slate-900 text-white font-bold shadow-2xs'
                        : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
                    }`}
                  >
                    {m.label}
                  </button>
                ))}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={handleExportPaymentsCsv}
                  className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                >
                  <Download className="w-3 h-3 text-slate-500" />
                  <span>Export Payments</span>
                </button>
                <button
                  onClick={() => {
                    const clientToPay = clients.find(c => c.balanceDue > 0) || clients[0];
                    if (clientToPay) {
                      setCollectingClient(clientToPay);
                      setCollectAmount(clientToPay.balanceDue > 0 ? clientToPay.balanceDue : clientToPay.monthlyFee);
                      setLastReceipt(null);
                    }
                  }}
                  className="px-3 py-1 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 cursor-pointer shadow-2xs"
                >
                  <PlusCircle className="w-3.5 h-3.5" />
                  <span>Record Payment</span>
                </button>
              </div>
            </div>

            <div className="w-full max-w-full overflow-x-auto">
              <table className="w-full text-left text-xs border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px]">
                    <th className="py-2.5 px-3">Receipt #</th>
                    <th className="py-2.5 px-3">Customer Name</th>
                    <th className="py-2.5 px-3">Payment Method</th>
                    <th className="py-2.5 px-3">Date</th>
                    <th className="py-2.5 px-3">Amount Paid</th>
                    <th className="py-2.5 px-3">Extension</th>
                    <th className="py-2.5 px-3">Collector / Lineman</th>
                    <th className="py-2.5 px-3">Notes</th>
                    <th className="py-2.5 px-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-slate-700">
                  {filteredPayments.length === 0 ? (
                    <tr>
                      <td colSpan={9} className="py-8 text-center text-slate-400">
                        No payments found matching the selected filter.
                      </td>
                    </tr>
                  ) : (
                    filteredPayments.map(pay => {
                      const methodBadge =
                        pay.paymentMethod === 'Cash at Doorstep'
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : pay.paymentMethod === 'Bank Wire / Transfer'
                          ? 'bg-sky-100 text-sky-900 border-sky-300'
                          : pay.paymentMethod === 'Easypaisa'
                          ? 'bg-emerald-100 text-emerald-900 border-emerald-300'
                          : pay.paymentMethod === 'JazzCash'
                          ? 'bg-rose-100 text-rose-900 border-rose-300'
                          : 'bg-slate-100 text-slate-800 border-slate-300';

                      return (
                        <tr key={pay.id} className="hover:bg-slate-50/60 transition-colors">
                          <td className="py-3 px-3 font-mono font-bold text-sky-700">
                            {pay.receiptNumber}
                          </td>
                          <td className="py-3 px-3 font-semibold text-slate-900">
                            {pay.clientName}
                          </td>
                          <td className="py-3 px-3">
                            <span className={`inline-flex items-center px-2 py-0.5 rounded-md text-[11px] font-semibold border ${methodBadge}`}>
                              {pay.paymentMethod}
                            </span>
                          </td>
                          <td className="py-3 px-3 font-mono text-slate-600">
                            {pay.date}
                          </td>
                          <td className="py-3 px-3 font-mono font-bold text-emerald-700">
                            Rs. {pay.amount.toLocaleString()}
                          </td>
                          <td className="py-3 px-3 text-slate-600">
                            +{pay.packageExtendedMonths} month(s)
                          </td>
                          <td className="py-3 px-3 text-slate-700">
                            {pay.collectorName}
                          </td>
                          <td className="py-3 px-3 text-slate-500 text-[11px] max-w-xs truncate">
                            {pay.notes || '—'}
                          </td>
                          <td className="py-3 px-3 text-right">
                            <button
                              onClick={() => {
                                setLastReceipt(pay);
                                triggerPrintWindow();
                              }}
                              className="px-2.5 py-1 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors inline-flex items-center gap-1 cursor-pointer"
                            >
                              <Printer className="w-3 h-3 text-slate-500" />
                              <span>Print</span>
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          /* Clients Table / Cards (Responsive for Mobile & Desktop) */
          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Subscriber & Contact</th>
                  <th className="py-2.5 px-3">Plan & Bandwidth</th>
                  <th className="py-2.5 px-3">Expiry Deadline</th>
                  <th className="py-2.5 px-3">Outstanding Dues</th>
                  <th className="py-2.5 px-3">Hardware / IP</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredClients.map(client => {
                  const days = getDaysUntilExpiry(client.packageExpiryDate);
                  const isExpired = days < 0 || client.status === 'expired' || client.status === 'suspended';
                  const isExpiringSoon = days >= 0 && days <= 3;

                  return (
                    <tr key={client.id} className="hover:bg-slate-50/50 transition-colors">
                      {/* Name & Contact */}
                      <td className="py-3 px-3">
                        <div className="font-bold text-slate-900">{client.name}</div>
                        <div className="text-[11px] text-slate-500 flex items-center gap-1.5 mt-0.5">
                          <Phone className="w-3 h-3 text-slate-400" />
                          <span>{client.phone}</span>
                        </div>
                        <div className="text-[10px] text-slate-400 truncate max-w-xs">{client.address}</div>
                        <div className="text-[10px] text-sky-700 font-medium flex items-center gap-1 mt-0.5">
                          <MapPin className="w-3 h-3 text-sky-500 shrink-0" />
                          <span className="truncate max-w-xs">{client.zone}</span>
                        </div>
                      </td>

                      {/* Plan */}
                      <td className="py-3 px-3">
                        <div className="font-semibold text-slate-800">{client.packageName}</div>
                        <div className="text-[11px] text-sky-600 font-mono font-medium">
                          {client.bandwidthMbps} Mbps · Rs. {client.monthlyFee.toLocaleString()}/mo
                        </div>
                      </td>

                      {/* Expiry */}
                      <td className="py-3 px-3 font-mono tabular-nums">
                        <div className="font-bold text-slate-900">{client.packageExpiryDate}</div>
                        <div className="text-[11px] font-sans">
                          {isExpired ? (
                            <span className="text-rose-600 font-bold">
                              {days < 0 ? `Expired ${Math.abs(days)}d ago` : 'Expired'}
                            </span>
                          ) : isExpiringSoon ? (
                            <span className="text-amber-600 font-bold">
                              Expires in {days} {days === 1 ? 'day' : 'days'}
                            </span>
                          ) : (
                            <span className="text-slate-500">{days} days remaining</span>
                          )}
                        </div>
                      </td>

                      {/* Outstanding Dues */}
                      <td className="py-3 px-3 font-mono tabular-nums">
                        <div
                          className={`text-sm font-bold ${
                            client.balanceDue > 0 ? 'text-amber-600' : 'text-emerald-600'
                          }`}
                        >
                          Rs. {client.balanceDue.toLocaleString()}
                        </div>
                        <div className="text-[10px] text-slate-400">
                          {client.balanceDue > 0 ? 'Pending Collection' : 'Settled'}
                        </div>
                      </td>

                      {/* Technical details */}
                      <td className="py-3 px-3 font-mono text-[11px]">
                        <div className="text-slate-800">{client.ipAddress}</div>
                        <div className="text-slate-400 text-[10px]">{client.onuSerial}</div>
                      </td>

                      {/* Status Badge */}
                      <td className="py-3 px-3">
                        <span
                          className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                            isExpired
                              ? 'bg-rose-100 text-rose-800'
                              : isExpiringSoon
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isExpired ? 'Expired' : isExpiringSoon ? 'Expiring Soon' : 'Active'}
                        </span>
                      </td>

                      {/* Actions: Send Payment Alert & Collect Cash */}
                      <td className="py-3 px-3 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => setActiveAlertClient(client)}
                            title="Generate payment reminder alert (WhatsApp / SMS)"
                            className="px-2.5 py-1 text-xs font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
                          >
                            <MessageSquare className="w-3.5 h-3.5 text-emerald-600" />
                            <span>Alert</span>
                          </button>

                          <button
                            onClick={() => {
                              setCollectingClient(client);
                              setCollectAmount(client.balanceDue > 0 ? client.balanceDue : client.monthlyFee);
                            }}
                            className="px-2.5 py-1 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors shadow-2xs cursor-pointer"
                          >
                            Collect
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* PAYMENT ALERT GENERATOR MODAL (WhatsApp & SMS Ready Template) */}
      {activeAlertClient && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-emerald-100 text-emerald-700 rounded-lg">
                  <MessageSquare className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-slate-900">
                    Payment Alert & Expiry Reminder
                  </h3>
                  <span className="text-[11px] text-slate-500">
                    Client: {activeAlertClient.name} ({activeAlertClient.phone})
                  </span>
                </div>
              </div>
              <button
                onClick={() => {
                  setActiveAlertClient(null);
                  if (onClosePaymentAlert) onClosePaymentAlert();
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {/* Generated message preview */}
            <div className="space-y-2 text-xs">
              <span className="font-semibold text-slate-700 block">
                Message Preview (Ready for WhatsApp & SMS):
              </span>
              <div className="bg-slate-50 border border-slate-200 p-3.5 rounded-lg text-slate-800 font-sans leading-relaxed text-xs select-all">
                {buildAlertMessage(activeAlertClient)}
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-2 pt-2 border-t border-slate-100">
              {/* Copy text */}
              <button
                onClick={() => {
                  navigator.clipboard.writeText(buildAlertMessage(activeAlertClient));
                  setCopiedNotice(true);
                  setTimeout(() => setCopiedNotice(false), 2500);
                }}
                className="w-full sm:w-auto px-3 py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>{copiedNotice ? 'Copied to Clipboard!' : 'Copy Text'}</span>
              </button>

              {/* Direct WhatsApp button */}
              <a
                href={`https://wa.me/${activeAlertClient.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                  buildAlertMessage(activeAlertClient)
                )}`}
                target="_blank"
                rel="noopener noreferrer"
                className="w-full sm:w-auto px-4 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
              >
                <span>Open WhatsApp Direct</span>
                <ExternalLink className="w-3.5 h-3.5" />
              </a>
            </div>
          </div>
        </div>
      )}

      {/* RECORD PAYMENT & PRINT RECEIPT MODAL */}
      {collectingClient && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Record Client Payment</h3>
                <span className="text-[11px] text-slate-500">
                  {lastReceipt ? (
                    <span className="text-emerald-700 font-semibold">
                      Payment Confirmed · Receipt: {lastReceipt.receiptNumber}
                    </span>
                  ) : (
                    `${collectingClient.name} · ${collectingClient.packageName}`
                  )}
                </span>
              </div>
              <button
                onClick={() => {
                  setCollectingClient(null);
                  setLastReceipt(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            {!lastReceipt ? (
              <form onSubmit={handlePaymentSubmit} className="space-y-3 text-xs">
                {/* Select Client Dropdown */}
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Select Client Account</label>
                  <select
                    value={collectingClient.id}
                    onChange={e => {
                      const found = clients.find(c => c.id === e.target.value);
                      if (found) {
                        setCollectingClient(found);
                        setCollectAmount(found.balanceDue > 0 ? found.balanceDue : found.monthlyFee);
                      }
                    }}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 font-medium text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  >
                    {clients.map(c => (
                      <option key={c.id} value={c.id}>
                        {c.name} ({c.phone}) — Dues: Rs. {c.balanceDue.toLocaleString()} · Plan: {c.packageName}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-3 bg-slate-50 rounded-lg border border-slate-100 space-y-1">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Current Expiry:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      {collectingClient.packageExpiryDate}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Outstanding Balance:</span>
                    <span className="font-bold text-amber-600 font-mono">
                      Rs. {collectingClient.balanceDue.toLocaleString()}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Monthly Plan Rate:</span>
                    <span className="font-bold text-slate-800 font-mono">
                      Rs. {collectingClient.monthlyFee.toLocaleString()}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Amount Collected (Pak Rs.)</label>
                    <input
                      type="number"
                      min="1"
                      required
                      value={collectAmount}
                      onChange={e => setCollectAmount(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg font-mono focus:outline-none focus:ring-2 focus:ring-sky-500"
                    />
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Package Extension</label>
                    <select
                      value={extendMonths}
                      onChange={e => setExtendMonths(Number(e.target.value))}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                    >
                      <option value={1}>+1 Month</option>
                      <option value={2}>+2 Months</option>
                      <option value={3}>+3 Months (Quarterly)</option>
                      <option value={6}>+6 Months (Half-Yearly)</option>
                      <option value={12}>+12 Months (Annual)</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Payment Method</label>
                    <select
                      value={payMethod}
                      onChange={e => setPayMethod(e.target.value as PaymentRecord['paymentMethod'])}
                      className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none focus:ring-2 focus:ring-sky-500 font-medium text-xs text-slate-800"
                    >
                      <option value="Cash at Doorstep">Cash at Doorstep</option>
                      <option value="Bank Wire / Transfer">Bank Wire / Transfer</option>
                      <option value="Easypaisa">Easypaisa</option>
                      <option value="JazzCash">JazzCash</option>
                    </select>
                  </div>

                  <div>
                    <label className="font-semibold text-slate-700 block mb-1">Collector / Lineman</label>
                    <input
                      type="text"
                      required
                      value={collectorName}
                      onChange={e => setCollectorName(e.target.value)}
                      className="w-full p-2 border border-slate-200 rounded-lg"
                    />
                  </div>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Payment Notes</label>
                  <input
                    type="text"
                    placeholder="e.g. Paid in full for upcoming month"
                    value={payNotes}
                    onChange={e => setPayNotes(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setCollectingClient(null)}
                    className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
                  >
                    Confirm & Generate Receipt
                  </button>
                </div>
              </form>
            ) : (
              /* Receipt Generated Screen with Printable window & WhatsApp Delivery */
              <div className="space-y-4 text-xs">
                <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-xl space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold">
                      <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                      <span>Payment Received Successfully!</span>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-200 text-emerald-900">
                      Confirmed
                    </span>
                  </div>
                  <div className="space-y-1 text-emerald-950 font-mono text-xs pt-1">
                    <div>Receipt No: {lastReceipt.receiptNumber}</div>
                    <div>Client Name: {collectingClient.name}</div>
                    <div>Amount Paid: Rs. {lastReceipt.amount.toLocaleString()}</div>
                    <div>Method: {lastReceipt.paymentMethod}</div>
                    <div>Extension: +{lastReceipt.packageExtendedMonths} month(s)</div>
                    <div>Collector: {lastReceipt.collectorName}</div>
                  </div>
                </div>

                {/* WhatsApp Auto-Send Notification Card */}
                <div className="p-3 bg-emerald-50/80 border border-emerald-200 rounded-lg flex items-center justify-between gap-2">
                  <div className="flex items-center gap-2">
                    <div className="p-1.5 bg-emerald-600 text-white rounded-md">
                      <MessageSquare className="w-3.5 h-3.5" />
                    </div>
                    <div>
                      <div className="text-[11px] font-bold text-emerald-950">WhatsApp Receipt Delivery</div>
                      <div className="text-[10px] text-emerald-800">Whatsapp No: {collectingClient.phone}</div>
                    </div>
                  </div>
                  <span className="text-[10px] bg-emerald-200/90 text-emerald-950 font-semibold px-2 py-0.5 rounded">
                    Sends on Done
                  </span>
                </div>

                <div className="flex items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => {
                      setCollectingClient(null);
                      setLastReceipt(null);
                    }}
                    className="px-3 py-1.5 text-xs text-slate-500 hover:text-slate-800 hover:bg-slate-100 rounded-lg cursor-pointer"
                  >
                    Close Without WhatsApp
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={triggerPrintWindow}
                      className="px-3.5 py-1.5 text-xs font-semibold text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-lg flex items-center gap-1.5 cursor-pointer"
                    >
                      <Printer className="w-3.5 h-3.5" />
                      <span>Print Slip</span>
                    </button>

                    {/* By pressing Done system sends receipt to WhatsApp */}
                    <a
                      href={`https://wa.me/${collectingClient.phone.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(
                        buildReceiptWhatsAppMessage(
                          clients.find(c => c.id === collectingClient.id) || collectingClient,
                          lastReceipt
                        )
                      )}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={() => {
                        setTimeout(() => {
                          setCollectingClient(null);
                          setLastReceipt(null);
                        }, 500);
                      }}
                      className="px-4 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg flex items-center gap-1.5 cursor-pointer shadow-2xs"
                    >
                      <MessageSquare className="w-3.5 h-3.5" />
                      <span>Done (Send Receipt to WhatsApp)</span>
                    </a>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ADD SUBSCRIBER MODAL */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4 overflow-y-auto">
          <form
            onSubmit={handleCreateClient}
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4 my-8"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Customer</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. John Doe"
                    value={newName}
                    onChange={e => setNewName(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Whatsapp No</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. +92 300 1234567"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Full Address</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Apt 4B, 120 North Ave, Sector 4"
                  value={newAddress}
                  onChange={e => setNewAddress(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Zone / Sector</label>
                  <input
                    type="text"
                    required
                    value={newZone}
                    onChange={e => setNewZone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Connection Medium</label>
                  <select
                    value={newConnType}
                    onChange={e => setNewConnType(e.target.value as Client['connectionType'])}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="FTTH_Fiber">FTTH (Pure Fiber Optic)</option>
                    <option value="Coaxial_Cable">Coaxial Cable Broadband</option>
                    <option value="Hybrid_HFC">Hybrid Fiber-Coaxial (HFC)</option>
                    <option value="Wireless_PtP">Wireless Point-to-Point</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Package Name</label>
                  <input
                    type="text"
                    required
                    value={newPackage}
                    onChange={e => setNewPackage(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Speed (Mbps)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newBandwidth}
                    onChange={e => setNewBandwidth(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Fee (Pak Rs.)</label>
                  <input
                    type="number"
                    min="1"
                    required
                    value={newMonthlyFee}
                    onChange={e => setNewMonthlyFee(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Static / DHCP IP</label>
                  <input
                    type="text"
                    required
                    value={newIp}
                    onChange={e => setNewIp(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">ONU Serial</label>
                  <input
                    type="text"
                    required
                    value={newOnu}
                    onChange={e => setNewOnu(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">First Expiry Date</label>
                  <input
                    type="date"
                    required
                    value={newExpiry}
                    onChange={e => setNewExpiry(e.target.value)}
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
                Create Customer
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
