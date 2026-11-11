import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Settings,
  Building2,
  Users,
  Shield,
  CreditCard,
  MessageSquare,
  Database,
  CheckCircle2,
  Save,
  RotateCcw,
  Key,
  Globe,
  Smartphone,
  Phone,
  Mail,
} from 'lucide-react';

export const SettingsView: React.FC = () => {
  const { resetDemoData } = useApp();
  const [activeTab, setActiveTab] = useState<'company' | 'roles' | 'gateways' | 'notifications' | 'system'>('company');
  const [savedNotice, setSavedNotice] = useState(false);

  // Form states
  const [companyName, setCompanyName] = useState('OptiCable Net');
  const [tagline, setTagline] = useState('Real-Time ISP & Cable Operations');
  const [licenseNo, setLicenseNo] = useState('PTA-ISP-FED-2024-8841');
  const [phone, setPhone] = useState('051-8899000 / 0300-1122334');
  const [email, setEmail] = useState('noc@opticablenet.pk');
  const [headendAddress, setHeadendAddress] = useState('Plot 44, Industrial Area Sector I-9, Islamabad');
  const [currency, setCurrency] = useState('Pak Rs. (Rs.)');

  // Gateways
  const [easypaisaNumber, setEasypaisaNumber] = useState('0345-1234567');
  const [easypaisaTitle, setEasypaisaTitle] = useState('OptiCable Net Billing Desk');
  const [jazzcashNumber, setJazzcashNumber] = useState('0301-9876543');
  const [jazzcashTitle, setJazzcashTitle] = useState('OptiCable Net Operations');
  const [cashDoorstepEnabled, setCashDoorstepEnabled] = useState(true);

  // WhatsApp Gateway
  const [whatsappApiKey, setWhatsappApiKey] = useState('waba_live_9921_sec_tok_prod');
  const [autoSmsEnabled, setAutoSmsEnabled] = useState(true);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedNotice(true);
    setTimeout(() => setSavedNotice(false), 3000);
  };

  const usersList = [
    { name: 'Engr. Zeeshan Haider', email: 'zeeshan@opticablenet.pk', role: 'Super Administrator', status: 'Active' },
    { name: 'Ali Raza', email: 'ali.noc@opticablenet.pk', role: 'NOC / MikroTik Engineer', status: 'Active' },
    { name: 'Marium Tariq', email: 'marium.accounts@opticablenet.pk', role: 'Billing & Cashier', status: 'Active' },
    { name: 'Tariq Ahmed', email: 'tariq.fiber@opticablenet.pk', role: 'Field Lineman & Recovery', status: 'Active' },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-slate-100 text-slate-800">
                <Settings className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">System Settings & Configurations</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Company profile, user access roles, Pakistani payment gateways, and WhatsApp notifications.
            </p>
          </div>

          {savedNotice && (
            <div className="px-3.5 py-1.5 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 animate-fade-in">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Configurations saved successfully!</span>
            </div>
          )}
        </div>

        {/* Tab switcher */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveTab('company')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'company'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Building2 className="w-3.5 h-3.5" />
            <span>Company Profile</span>
          </button>
          <button
            onClick={() => setActiveTab('roles')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'roles'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Shield className="w-3.5 h-3.5" />
            <span>Users & Roles</span>
          </button>
          <button
            onClick={() => setActiveTab('gateways')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'gateways'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <CreditCard className="w-3.5 h-3.5" />
            <span>Payment Gateways</span>
          </button>
          <button
            onClick={() => setActiveTab('notifications')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'notifications'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <MessageSquare className="w-3.5 h-3.5" />
            <span>WhatsApp & Alerts</span>
          </button>
          <button
            onClick={() => setActiveTab('system')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 ${
              activeTab === 'system'
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            <span>Database & Backups</span>
          </button>
        </div>
      </div>

      {/* Tab Contents */}
      {activeTab === 'company' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">ISP & Cable Operator Profile</h2>

          <div className="flex items-center gap-4 p-3 bg-slate-50 border border-slate-200 rounded-xl">
            <img
              src="./logo.png"
              alt="OptiCable Net Official Logo"
              className="h-12 w-auto object-contain bg-white px-3 py-1 rounded-lg border border-slate-200 shadow-2xs"
            />
            <div>
              <h3 className="text-xs font-bold text-slate-900">OptiCable Net — Connect • Manage • Grow</h3>
              <p className="text-[11px] text-slate-500">Official Registered ISP & Cable Operations Logo</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Company / Brand Name</label>
              <input
                type="text"
                value={companyName}
                onChange={e => setCompanyName(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">PTA License Number</label>
              <input
                type="text"
                value={licenseNo}
                onChange={e => setLicenseNo(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Support Hotline / Mobile</label>
              <input
                type="text"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">NOC Support Email</label>
              <input
                type="email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
                required
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">Central Headend & Substation Address</label>
            <input
              type="text"
              value={headendAddress}
              onChange={e => setHeadendAddress(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
              required
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">System Operational Currency</label>
              <input
                type="text"
                value={currency}
                disabled
                className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-600 rounded-lg"
              />
              <span className="text-[10px] text-slate-400 mt-1 block">Locked to Pakistani Rupee (Rs.)</span>
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-700 mb-1">Project Attribution</label>
              <input
                type="text"
                value="All Rights Reserve - Project of Orionfx.net"
                disabled
                className="w-full px-3 py-2 text-xs border border-slate-200 bg-slate-50 text-slate-600 rounded-lg"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save Company Profile</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'gateways' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Pakistani Payment Gateway Configurations</h2>
          <p className="text-xs text-slate-500">
            Account credentials displayed to customers for bill clearance via Easypaisa, JazzCash, and Doorstep collection.
          </p>

          <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-emerald-500" />
                <h3 className="text-xs font-bold text-slate-900">Easypaisa Merchant / Wallet Account</h3>
              </div>
              <span className="text-[11px] font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Easypaisa Mobile Number</label>
                <input
                  type="text"
                  value={easypaisaNumber}
                  onChange={e => setEasypaisaNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Account Title</label>
                <input
                  type="text"
                  value={easypaisaTitle}
                  onChange={e => setEasypaisaTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl space-y-3 bg-slate-50/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-rose-500" />
                <h3 className="text-xs font-bold text-slate-900">JazzCash / JassCash Wallet Account</h3>
              </div>
              <span className="text-[11px] font-semibold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
                Active
              </span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">JazzCash Mobile Number</label>
                <input
                  type="text"
                  value={jazzcashNumber}
                  onChange={e => setJazzcashNumber(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
              <div>
                <label className="block text-[11px] font-medium text-slate-600 mb-1">Account Title</label>
                <input
                  type="text"
                  value={jazzcashTitle}
                  onChange={e => setJazzcashTitle(e.target.value)}
                  className="w-full px-3 py-1.5 text-xs border border-slate-300 rounded-lg bg-white"
                />
              </div>
            </div>
          </div>

          <div className="p-4 border border-slate-200 rounded-xl flex items-center justify-between bg-slate-50/50">
            <div>
              <h3 className="text-xs font-bold text-slate-900">Cash at Doorstep Recovery Service</h3>
              <p className="text-[11px] text-slate-500">Allow field linemen to accept cash receipts at customer gates</p>
            </div>
            <input
              type="checkbox"
              checked={cashDoorstepEnabled}
              onChange={e => setCashDoorstepEnabled(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded"
            />
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Update Payment Gateway Accounts</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'roles' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Authorized Operator Accounts</h2>
              <p className="text-xs text-slate-500">Role-based access control (Super Admin, NOC, Billing, Lineman)</p>
            </div>
            <button
              type="button"
              className="px-3 py-1.5 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold cursor-pointer"
            >
              + Add User
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">User & Email</th>
                  <th className="px-4 py-3">Assigned Role</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {usersList.map(u => (
                  <tr key={u.email} className="hover:bg-slate-50/70">
                    <td className="px-4 py-3">
                      <div className="font-semibold text-slate-900">{u.name}</div>
                      <span className="text-[11px] text-slate-400">{u.email}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-slate-100 text-slate-800 border border-slate-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        {u.role}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-emerald-700 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded text-[10px] font-semibold">
                        {u.status}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button className="text-xs text-sky-600 hover:underline font-medium cursor-pointer">
                        Edit Access
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'notifications' && (
        <form onSubmit={handleSave} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">WhatsApp Business API & Customer Alerts</h2>
          <p className="text-xs text-slate-500">
            Automated WhatsApp billing reminders, payment clearance receipts, and fiber cut maintenance alerts.
          </p>

          <div>
            <label className="block text-xs font-medium text-slate-700 mb-1">WhatsApp Cloud API Key / Token</label>
            <input
              type="password"
              value={whatsappApiKey}
              onChange={e => setWhatsappApiKey(e.target.value)}
              className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg font-mono bg-white"
            />
          </div>

          <div className="space-y-2 pt-2">
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input
                type="checkbox"
                checked={autoSmsEnabled}
                onChange={e => setAutoSmsEnabled(e.target.checked)}
                className="w-4 h-4 text-emerald-600 rounded"
              />
              <span>Automatically send WhatsApp receipt immediately when payment is recorded</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              <span>Send 3-day advance payment expiry reminder before service disconnection</span>
            </label>
            <label className="flex items-center gap-2 text-xs text-slate-700">
              <input type="checkbox" defaultChecked className="w-4 h-4 text-emerald-600 rounded" />
              <span>Broadcast maintenance notification during scheduled trunk optical splicing</span>
            </label>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end">
            <button
              type="submit"
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Save className="w-4 h-4" />
              <span>Save WhatsApp Integration</span>
            </button>
          </div>
        </form>
      )}

      {activeTab === 'system' && (
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs space-y-4">
          <h2 className="text-sm font-bold text-slate-900">Database & System Maintenance</h2>
          <p className="text-xs text-slate-500">Local storage synchronization, JSON exports, and demo data reset.</p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
            <div className="p-4 border border-slate-200 rounded-xl bg-slate-50">
              <h3 className="text-xs font-bold text-slate-800">Export Complete System Snapshot</h3>
              <p className="text-[11px] text-slate-500 mt-1 mb-3">
                Download all subscribers, ledger entries, and network nodes as a timestamped backup JSON file.
              </p>
              <button
                type="button"
                onClick={() => {
                  const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(localStorage.getItem('opticable_erp_v2_clients') || '{}');
                  const downloadAnchor = document.createElement('a');
                  downloadAnchor.setAttribute('href', dataStr);
                  downloadAnchor.setAttribute('download', `OptiCableNet_Backup_${Date.now()}.json`);
                  document.body.appendChild(downloadAnchor);
                  downloadAnchor.click();
                  downloadAnchor.remove();
                }}
                className="px-3 py-1.5 bg-white border border-slate-300 hover:bg-slate-100 text-slate-700 rounded-lg text-xs font-semibold transition-colors cursor-pointer"
              >
                Download JSON Backup
              </button>
            </div>

            <div className="p-4 border border-rose-200 rounded-xl bg-rose-50/50">
              <h3 className="text-xs font-bold text-rose-900">Reset Demo Data</h3>
              <p className="text-[11px] text-rose-700/80 mt-1 mb-3">
                Restores all Pakistani ISP mock subscribers, payments, staff, and optical fiber runs to initial state.
              </p>
              <button
                type="button"
                onClick={() => {
                  if (window.confirm('Reset all sample records to factory default state?')) {
                    resetDemoData();
                  }
                }}
                className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-xs font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>Reset to Sample Data</span>
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
