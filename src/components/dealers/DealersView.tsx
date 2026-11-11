import React, { useState } from 'react';
import {
  Users2,
  PlusCircle,
  Search,
  Filter,
  DollarSign,
  Briefcase,
  TrendingUp,
  Phone,
  MapPin,
  CheckCircle2,
  Clock,
  ShieldCheck,
  Send,
  Download,
} from 'lucide-react';

interface Dealer {
  id: string;
  name: string;
  ownerName: string;
  phone: string;
  area: string;
  bandwidthPoolMbps: number;
  subscribersCount: number;
  monthlyBilling: number;
  commissionRatePercent: number;
  monthlyCommission: number;
  balancePayable: number;
  status: 'active' | 'suspended';
}

const INITIAL_DEALERS: Dealer[] = [
  {
    id: 'DLR-01',
    name: 'Al-Madina Telecom & Cable',
    ownerName: 'Haji Abdul Qayyum',
    phone: '0300-5544332',
    area: 'Sector I-9 & I-10 Industrial Zone',
    bandwidthPoolMbps: 500,
    subscribersCount: 168,
    monthlyBilling: 340000,
    commissionRatePercent: 15,
    monthlyCommission: 51000,
    balancePayable: 51000,
    status: 'active',
  },
  {
    id: 'DLR-02',
    name: 'Falcon Highspeed Resellers',
    ownerName: 'Malik Shakeel',
    phone: '0321-9988776',
    area: 'Sector G-13 Sub-Franchise',
    bandwidthPoolMbps: 350,
    subscribersCount: 112,
    monthlyBilling: 224000,
    commissionRatePercent: 18,
    monthlyCommission: 40320,
    balancePayable: 18000,
    status: 'active',
  },
  {
    id: 'DLR-03',
    name: 'Rawal Fiber Link',
    ownerName: 'Chaudhry Nadeem',
    phone: '0345-6677889',
    area: 'Bani Gala & Rawal Enclave',
    bandwidthPoolMbps: 200,
    subscribersCount: 74,
    monthlyBilling: 155000,
    commissionRatePercent: 12,
    monthlyCommission: 18600,
    balancePayable: 0,
    status: 'active',
  },
  {
    id: 'DLR-04',
    name: 'Kashmir Point Cable Network',
    ownerName: 'Tanveer Abbasi',
    phone: '0333-1122334',
    area: 'Murree Road / Sub-Franchise',
    bandwidthPoolMbps: 150,
    subscribersCount: 45,
    monthlyBilling: 98000,
    commissionRatePercent: 15,
    monthlyCommission: 14700,
    balancePayable: 14700,
    status: 'suspended',
  },
];

export const DealersView: React.FC = () => {
  const [dealers, setDealers] = useState<Dealer[]>(INITIAL_DEALERS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [isModalOpen, setIsModalOpen] = useState(false);

  // New dealer form state
  const [newDealerName, setNewDealerName] = useState('');
  const [newOwner, setNewOwner] = useState('');
  const [newPhone, setNewPhone] = useState('');
  const [newArea, setNewArea] = useState('');
  const [newBw, setNewBw] = useState(200);
  const [newComm, setNewComm] = useState(15);

  const totalDealers = dealers.length;
  const totalSubscribersThroughDealers = dealers.reduce((sum, d) => sum + d.subscribersCount, 0);
  const totalDealerRevenue = dealers.reduce((sum, d) => sum + d.monthlyBilling, 0);
  const totalCommissionPayable = dealers.reduce((sum, d) => sum + d.balancePayable, 0);

  const filteredDealers = dealers.filter(d => {
    if (statusFilter !== 'all' && d.status !== statusFilter) return false;
    const q = search.toLowerCase();
    return (
      d.name.toLowerCase().includes(q) ||
      d.ownerName.toLowerCase().includes(q) ||
      d.phone.includes(q) ||
      d.area.toLowerCase().includes(q)
    );
  });

  const handlePayoutCommission = (id: string) => {
    setDealers(prev =>
      prev.map(d =>
        d.id === id
          ? {
              ...d,
              balancePayable: 0,
            }
          : d
      )
    );
  };

  const handleCreateDealer = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Dealer = {
      id: `DLR-0${dealers.length + 1}`,
      name: newDealerName,
      ownerName: newOwner,
      phone: newPhone,
      area: newArea,
      bandwidthPoolMbps: newBw,
      subscribersCount: 0,
      monthlyBilling: 0,
      commissionRatePercent: newComm,
      monthlyCommission: 0,
      balancePayable: 0,
      status: 'active',
    };
    setDealers(prev => [...prev, created]);
    setIsModalOpen(false);
    setNewDealerName('');
    setNewOwner('');
    setNewPhone('');
    setNewArea('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Header Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-emerald-50 text-emerald-700">
                <Users2 className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Dealers & Resellers</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Sub-operators, franchise resellers, bandwidth allocation pools, and monthly commission settlement.
            </p>
          </div>

          <button
            onClick={() => setIsModalOpen(true)}
            className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Register New Dealer</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Total Franchises</span>
            <span className="text-lg font-bold text-slate-900">{totalDealers} Dealers</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Dealer Subscriber Base</span>
            <span className="text-lg font-bold text-sky-600">{totalSubscribersThroughDealers} Clients</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Dealer Gross Billing</span>
            <span className="text-lg font-bold text-slate-900">Rs. {totalDealerRevenue.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Unsettled Commissions</span>
            <span className="text-lg font-bold text-amber-600">Rs. {totalCommissionPayable.toLocaleString()}</span>
          </div>
        </div>
      </div>

      {/* Dealer List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Franchise & Dealer Ledger</h2>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
              {filteredDealers.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search franchise or owner..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-emerald-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-emerald-500 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="active">Active</option>
              <option value="suspended">Suspended</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Dealer & Territory</th>
                <th className="px-4 py-3">Bandwidth Pool</th>
                <th className="px-4 py-3">Clients</th>
                <th className="px-4 py-3">Monthly Billing</th>
                <th className="px-4 py-3">Commission Rate</th>
                <th className="px-4 py-3">Payable Balance</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Commission Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredDealers.map(dealer => (
                <tr key={dealer.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{dealer.name}</div>
                    <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Briefcase className="w-3 h-3 text-slate-400" />
                      {dealer.ownerName} · {dealer.phone}
                    </div>
                    <div className="text-slate-400 text-[11px] flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {dealer.area}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-mono font-semibold text-sky-700 bg-sky-50 px-2 py-0.5 rounded border border-sky-200 text-xs">
                      {dealer.bandwidthPoolMbps} Mbps
                    </span>
                  </td>
                  <td className="px-4 py-3 font-semibold text-slate-800">
                    {dealer.subscribersCount} active
                  </td>
                  <td className="px-4 py-3 font-medium text-slate-800">
                    Rs. {dealer.monthlyBilling.toLocaleString()}
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-semibold text-emerald-700">
                      {dealer.commissionRatePercent}%
                    </span>
                    <span className="block text-[10px] text-slate-400">
                      (Rs. {dealer.monthlyCommission.toLocaleString()}/mo)
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    {dealer.balancePayable > 0 ? (
                      <span className="font-bold text-amber-600">
                        Rs. {dealer.balancePayable.toLocaleString()}
                      </span>
                    ) : (
                      <span className="text-emerald-600 font-semibold text-xs flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Cleared
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        dealer.status === 'active'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : 'bg-rose-50 text-rose-700 border border-rose-200'
                      }`}
                    >
                      {dealer.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {dealer.balancePayable > 0 ? (
                      <button
                        onClick={() => handlePayoutCommission(dealer.id)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <DollarSign className="w-3.5 h-3.5" />
                        <span>Settle Payout</span>
                      </button>
                    ) : (
                      <span className="text-slate-400 text-xs">Settled</span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* New Dealer Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <h3 className="text-base font-bold text-slate-900">Register Sub-Franchise / Dealer</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Set up wholesale reseller accounts, assign bandwidth caps, and define commission ratios.
            </p>

            <form onSubmit={handleCreateDealer} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Franchise / Business Name</label>
                <input
                  type="text"
                  placeholder="e.g. Al-Madina Telecom"
                  value={newDealerName}
                  onChange={e => setNewDealerName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Owner Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Malik Shakeel"
                    value={newOwner}
                    onChange={e => setNewOwner(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mobile Number</label>
                  <input
                    type="text"
                    placeholder="0300-XXXXXXX"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Coverage Area / Sector</label>
                <input
                  type="text"
                  placeholder="e.g. Sector G-13 Sub-Franchise"
                  value={newArea}
                  onChange={e => setNewArea(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Bandwidth Pool (Mbps)</label>
                  <input
                    type="number"
                    min="50"
                    step="50"
                    value={newBw}
                    onChange={e => setNewBw(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Commission Rate (%)</label>
                  <input
                    type="number"
                    min="1"
                    max="50"
                    value={newComm}
                    onChange={e => setNewComm(Number(e.target.value))}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-emerald-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Save Dealer
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
