import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Tv,
  Wifi,
  PlusCircle,
  Check,
  Search,
  Filter,
  Sparkles,
  Zap,
  ArrowRight,
  ShieldCheck,
  Tag,
} from 'lucide-react';

interface PackageItem {
  id: string;
  name: string;
  category: 'internet' | 'cable_tv' | 'combo';
  speedMbps?: number;
  channelsCount?: number;
  monthlyFee: number;
  description: string;
  popular?: boolean;
  activeSubscribers: number;
  features: string[];
}

const INITIAL_PACKAGES: PackageItem[] = [
  {
    id: 'pkg-1',
    name: 'Home Fiber Starter',
    category: 'internet',
    speedMbps: 15,
    monthlyFee: 1800,
    description: 'Ideal for small families, web browsing, and HD streaming.',
    activeSubscribers: 42,
    features: ['15 Mbps Dedicated Fiber', 'Unlimited Data Download', 'Free Optical ONU on 6mo prepay', '24/7 Local Lineman Support'],
  },
  {
    id: 'pkg-2',
    name: 'Family Fiber Turbo',
    category: 'internet',
    speedMbps: 25,
    monthlyFee: 2400,
    description: 'High-speed broadband for multi-device households, 4K streaming & gaming.',
    popular: true,
    activeSubscribers: 88,
    features: ['25 Mbps Ultra-Low Latency (<12ms)', 'Buffer-Free 4K Streaming', 'Dual-Band Gigabit Router Support', 'Priority WhatsApp Assistance'],
  },
  {
    id: 'pkg-3',
    name: 'Business Pro Fiber',
    category: 'internet',
    speedMbps: 50,
    monthlyFee: 3500,
    description: 'Corporate SLA, static IP support, dedicated bandwidth pipeline.',
    activeSubscribers: 26,
    features: ['50 Mbps 1:1 Bandwidth', 'Free Static IP Address', '99.9% Uptime Guarantee SLA', 'Dedicated Account Manager'],
  },
  {
    id: 'pkg-4',
    name: 'Digital Cable TV Basic',
    category: 'cable_tv',
    channelsCount: 75,
    monthlyFee: 600,
    description: 'Crystal-clear digital cable TV with all local and national news & drama channels.',
    activeSubscribers: 110,
    features: ['75+ Digital SD Channels', 'Local Sports & Geo/ARY bouquet', 'Stereo Audio Quality', 'RG-6 Coaxial Drop Cable'],
  },
  {
    id: 'pkg-5',
    name: 'Digital HD Cable Premier',
    category: 'cable_tv',
    channelsCount: 140,
    monthlyFee: 1000,
    description: 'Full HD digital transmission including international sports, movies, and cartoons.',
    popular: true,
    activeSubscribers: 64,
    features: ['140+ Channels (45 in 1080p HD)', 'Ten Sports, PTV Sports, Star Sports', 'Kids & Educational Channels', 'Electronic Program Guide (EPG)'],
  },
  {
    id: 'pkg-6',
    name: 'Triple Play Combo (Fiber + HD TV)',
    category: 'combo',
    speedMbps: 30,
    channelsCount: 140,
    monthlyFee: 3000,
    description: 'Complete home entertainment: 30 Mbps High-Speed Fiber + 140 HD Cable TV channels.',
    popular: true,
    activeSubscribers: 95,
    features: ['30 Mbps Fast Fiber Broadband', '140+ HD Cable TV Channels', 'Single Consolidated Monthly Bill', 'Free Splicing & Setup'],
  },
];

export const PackagesView: React.FC = () => {
  const [packages, setPackages] = useState<PackageItem[]>(INITIAL_PACKAGES);
  const [filter, setFilter] = useState<'all' | 'internet' | 'cable_tv' | 'combo'>('all');
  const [search, setSearch] = useState('');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [name, setName] = useState('');
  const [category, setCategory] = useState<'internet' | 'cable_tv' | 'combo'>('internet');
  const [speedMbps, setSpeedMbps] = useState(20);
  const [channelsCount, setChannelsCount] = useState(100);
  const [monthlyFee, setMonthlyFee] = useState(2000);
  const [description, setDescription] = useState('');

  const filtered = packages.filter(p => {
    const matchesFilter = filter === 'all' || p.category === filter;
    const matchesSearch = p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.description.toLowerCase().includes(search.toLowerCase());
    return matchesFilter && matchesSearch;
  });

  const handleCreate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name) return;
    const newPkg: PackageItem = {
      id: `pkg-${Date.now()}`,
      name,
      category,
      speedMbps: category !== 'cable_tv' ? speedMbps : undefined,
      channelsCount: category !== 'internet' ? channelsCount : undefined,
      monthlyFee: Number(monthlyFee),
      description: description || 'High-speed package configured for subscribers.',
      activeSubscribers: 0,
      features: category === 'internet'
        ? [`${speedMbps} Mbps Fiber`, 'Unlimited Download', 'Local Lineman Support']
        : category === 'cable_tv'
        ? [`${channelsCount}+ Digital Channels`, 'Digital Audio', 'Local & Sports bouquet']
        : [`${speedMbps} Mbps Fiber`, `${channelsCount}+ HD Channels`, 'Consolidated Billing'],
    };
    setPackages([newPkg, ...packages]);
    setShowAddModal(false);
    setName('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight flex items-center gap-2">
            <Tv className="w-6 h-6 text-sky-600" />
            <span>Packages & Tariffs</span>
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Manage high-speed optical internet tiers, digital cable TV bouquets, and combo subscriptions in Pak Rs.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>New Package</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Internet Plans</span>
            <Wifi className="w-3.5 h-3.5 text-sky-700" />
          </div>
          <div className="text-xl font-bold text-sky-950 font-mono">
            {packages.filter(p => p.category === 'internet').length} Tiers
          </div>
          <div className="text-[11px] text-sky-800 mt-0.5">15 Mbps to 50 Mbps</div>
        </div>

        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Cable TV Plans</span>
            <Tv className="w-3.5 h-3.5 text-amber-700" />
          </div>
          <div className="text-xl font-bold text-amber-950 font-mono">
            {packages.filter(p => p.category === 'cable_tv').length} Bouquets
          </div>
          <div className="text-[11px] text-amber-900 mt-0.5">Up to 140 HD Channels</div>
        </div>

        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Combo Packages</span>
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
          </div>
          <div className="text-xl font-bold text-emerald-950 font-mono">
            {packages.filter(p => p.category === 'combo').length} Bundles
          </div>
          <div className="text-[11px] text-emerald-900 mt-0.5">Fiber + Digital TV</div>
        </div>

        <div className="bg-purple-50/90 border border-purple-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-800">Total Enrolled</span>
            <Tag className="w-3.5 h-3.5 text-purple-700" />
          </div>
          <div className="text-xl font-bold text-purple-950 font-mono">
            {packages.reduce((acc, p) => acc + p.activeSubscribers, 0)} Subscribers
          </div>
          <div className="text-[11px] text-purple-900 mt-0.5">Active Recurring Base</div>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-slate-200 rounded-xl p-4 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-3">
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
          <input
            type="text"
            placeholder="Search package name, speed, channels..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
          />
        </div>

        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg text-xs w-full sm:w-auto">
          {[
            { id: 'all', label: 'All Packages' },
            { id: 'internet', label: 'Internet Only' },
            { id: 'cable_tv', label: 'Cable TV Only' },
            { id: 'combo', label: 'Combos' },
          ].map(t => (
            <button
              key={t.id}
              onClick={() => setFilter(t.id as typeof filter)}
              className={`px-3 py-1.5 rounded-md font-semibold transition-colors cursor-pointer text-xs ${
                filter === t.id
                  ? 'bg-white text-slate-900 shadow-2xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Packages Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map(pkg => (
          <div
            key={pkg.id}
            className={`rounded-xl border p-5 bg-white flex flex-col justify-between transition-all hover:shadow-sm ${
              pkg.popular ? 'border-sky-300 ring-1 ring-sky-300/60' : 'border-slate-200'
            }`}
          >
            <div>
              <div className="flex items-center justify-between mb-2">
                <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded ${
                  pkg.category === 'internet' ? 'bg-sky-100 text-sky-800' :
                  pkg.category === 'cable_tv' ? 'bg-amber-100 text-amber-800' :
                  'bg-emerald-100 text-emerald-800'
                }`}>
                  {pkg.category === 'internet' ? 'Fiber Broadband' :
                   pkg.category === 'cable_tv' ? 'Digital Cable TV' : 'Combo Package'}
                </span>
                {pkg.popular && (
                  <span className="text-[10px] font-bold text-sky-700 bg-sky-50 border border-sky-200 px-2 py-0.5 rounded">
                    Popular
                  </span>
                )}
              </div>

              <h3 className="text-base font-bold text-slate-900">{pkg.name}</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">{pkg.description}</p>

              {/* Price */}
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-baseline gap-1">
                <span className="text-2xl font-bold font-mono text-slate-900">
                  Rs. {pkg.monthlyFee.toLocaleString()}
                </span>
                <span className="text-xs text-slate-500">/month</span>
              </div>

              {/* Technical Badges */}
              <div className="mt-3 flex flex-wrap gap-2 text-xs">
                {pkg.speedMbps && (
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-sky-800 bg-sky-50 px-2 py-1 rounded border border-sky-200">
                    <Zap className="w-3 h-3 text-sky-600" />
                    <span>{pkg.speedMbps} Mbps</span>
                  </span>
                )}
                {pkg.channelsCount && (
                  <span className="inline-flex items-center gap-1 font-mono font-bold text-amber-800 bg-amber-50 px-2 py-1 rounded border border-amber-200">
                    <Tv className="w-3 h-3 text-amber-600" />
                    <span>{pkg.channelsCount}+ Channels</span>
                  </span>
                )}
                <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-50 px-2 py-1 rounded border border-slate-200 text-[11px]">
                  <span>{pkg.activeSubscribers} Active Clients</span>
                </span>
              </div>

              {/* Feature Checklist */}
              <ul className="mt-4 space-y-2 text-xs text-slate-600">
                {pkg.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2">
                    <Check className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
              <span className="text-slate-400">Tariff ID: {pkg.id}</span>
              <span className="font-semibold text-emerald-700">Tax Included</span>
            </div>
          </div>
        ))}
      </div>

      {/* Add Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreate}
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add New Internet / Cable Package</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 font-bold cursor-pointer"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Package Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Ultra Gaming 40 Mbps"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Category</label>
                  <select
                    value={category}
                    onChange={e => setCategory(e.target.value as typeof category)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="internet">Internet Only</option>
                    <option value="cable_tv">Cable TV Only</option>
                    <option value="combo">Combo (Fiber + TV)</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Rate (Pak Rs.)</label>
                  <input
                    type="number"
                    min="100"
                    required
                    value={monthlyFee}
                    onChange={e => setMonthlyFee(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              {category !== 'cable_tv' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Bandwidth (Mbps)</label>
                  <input
                    type="number"
                    min="5"
                    value={speedMbps}
                    onChange={e => setSpeedMbps(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              )}

              {category !== 'internet' && (
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Total Channels</label>
                  <input
                    type="number"
                    min="20"
                    value={channelsCount}
                    onChange={e => setChannelsCount(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              )}

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  placeholder="Package summary..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100 text-xs">
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="px-3.5 py-1.5 text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg cursor-pointer"
              >
                Create Package
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
