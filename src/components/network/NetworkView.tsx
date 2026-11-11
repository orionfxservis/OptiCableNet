import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  Server,
  Activity,
  Cpu,
  Wifi,
  HardDrive,
  Radio,
  RefreshCw,
  Search,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Globe,
  Sliders,
  Play,
  RotateCcw,
} from 'lucide-react';
import { TopologyView } from '../topology/TopologyView';

export const NetworkView: React.FC = () => {
  const { nodes, cableRuns, isSimulating, setIsSimulating, simulateLatencySpike } = useApp();
  const [activeSubTab, setActiveSubTab] = useState<'overview' | 'pppoe' | 'olt' | 'map'>('overview');
  const [search, setSearch] = useState('');

  // Sample MikroTik and OLT state
  const mikrotikRouters = [
    {
      id: 'CCR2116-1',
      name: 'Core BRAS - MikroTik Cloud Core Router 2116',
      ip: '10.200.0.1',
      rosVersion: 'RouterOS v7.15.2',
      cpu: 18,
      ram: 34,
      uptime: '48d 14h 22m',
      activePppoe: 148,
      throughputRx: '1.42 Gbps',
      throughputTx: '850 Mbps',
      status: 'online',
    },
    {
      id: 'CCR2004-2',
      name: 'Distribution Gateway - MikroTik CCR2004',
      ip: '10.200.0.2',
      rosVersion: 'RouterOS v7.15.2',
      cpu: 12,
      ram: 28,
      uptime: '112d 06h 10m',
      activePppoe: 94,
      throughputRx: '680 Mbps',
      throughputTx: '340 Mbps',
      status: 'online',
    },
  ];

  const oltDevices = [
    {
      id: 'OLT-GPON-01',
      name: 'ZTE C320 GPON OLT 8-Port',
      location: 'Central Headend Substation',
      ip: '192.168.100.10',
      totalPonPorts: 8,
      activePonPorts: 6,
      registeredOnus: 184,
      onlineOnus: 179,
      losOnus: 5,
      temp: '42°C',
      fanStatus: 'Normal (3200 RPM)',
    },
    {
      id: 'OLT-EPON-02',
      name: 'Huawei MA5608T EPON OLT 4-Port',
      location: 'West Distribution Shelter',
      ip: '192.168.100.11',
      totalPonPorts: 4,
      activePonPorts: 3,
      registeredOnus: 88,
      onlineOnus: 85,
      losOnus: 3,
      temp: '39°C',
      fanStatus: 'Normal (2900 RPM)',
    },
  ];

  const pppoeSessions = [
    {
      user: 'rashid.f7',
      ip: '100.64.12.44',
      mac: '48:8D:36:A1:22:90',
      profile: '30Mbps_Fiber_Gold',
      uptime: '14h 20m',
      rxBytes: '14.2 GB',
      txBytes: '2.1 GB',
      onuSn: 'ZTEG98B411',
      status: 'connected',
    },
    {
      user: 'farhan.f8',
      ip: '100.64.12.48',
      mac: 'E0:67:B3:99:10:4F',
      profile: '15Mbps_Fiber_Starter',
      uptime: '3d 02h 11m',
      rxBytes: '42.8 GB',
      txBytes: '6.4 GB',
      onuSn: 'ZTEG88A120',
      status: 'connected',
    },
    {
      user: 'ayesha.g11',
      ip: '100.64.14.88',
      mac: '9C:B6:54:11:80:CC',
      profile: '50Mbps_Fiber_Pro',
      uptime: '08h 45m',
      rxBytes: '28.1 GB',
      txBytes: '4.9 GB',
      onuSn: 'HWTC445588',
      status: 'connected',
    },
    {
      user: 'khurram.i8',
      ip: '100.64.16.12',
      mac: '3C:84:6A:F1:40:99',
      profile: '30Mbps_Fiber_Gold',
      uptime: '0m',
      rxBytes: '0 MB',
      txBytes: '0 MB',
      onuSn: 'ZTEG774411',
      status: 'los_disconnected',
    },
  ];

  const filteredPppoe = pppoeSessions.filter(s => {
    const q = search.toLowerCase();
    return s.user.toLowerCase().includes(q) || s.ip.includes(q) || s.onuSn.toLowerCase().includes(q);
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-sky-50 text-sky-700">
                <Server className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">
                Network Infrastructure & Core Routing
              </h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              MikroTik RouterOS, PPPoE BRAS sessions, GPON/EPON OLT frames and optical ONU telemetry.
            </p>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <button
              onClick={() => setIsSimulating(!isSimulating)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold flex items-center gap-1.5 border transition-colors cursor-pointer ${
                isSimulating
                  ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                  : 'bg-slate-100 text-slate-700 border-slate-300'
              }`}
            >
              <Activity className="w-3.5 h-3.5" />
              <span>Live Ping Stream: {isSimulating ? 'ON' : 'PAUSED'}</span>
            </button>

            <button
              onClick={() => {
                if (nodes.length > 0) simulateLatencySpike(nodes[0].id);
              }}
              className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded-lg text-xs font-semibold flex items-center gap-1.5 border border-slate-200 transition-colors cursor-pointer"
            >
              <Zap className="w-3.5 h-3.5 text-amber-600" />
              <span>Test Latency Spike</span>
            </button>
          </div>
        </div>

        {/* Sub Navigation tabs */}
        <div className="flex items-center gap-2 mt-5 pt-4 border-t border-slate-100 overflow-x-auto">
          <button
            onClick={() => setActiveSubTab('overview')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'overview'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Overview & Telemetry
          </button>
          <button
            onClick={() => setActiveSubTab('pppoe')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'pppoe'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            MikroTik PPPoE Sessions
          </button>
          <button
            onClick={() => setActiveSubTab('olt')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'olt'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            OLT PON & ONU Status
          </button>
          <button
            onClick={() => setActiveSubTab('map')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-colors cursor-pointer ${
              activeSubTab === 'map'
                ? 'bg-sky-600 text-white shadow-xs'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            Full Interactive Fiber Map
          </button>
        </div>
      </div>

      {activeSubTab === 'map' ? (
        <TopologyView />
      ) : activeSubTab === 'pppoe' ? (
        /* PPPoE Sessions view */
        <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
            <div>
              <h2 className="text-sm font-bold text-slate-900">Active PPPoE Server Sessions</h2>
              <p className="text-xs text-slate-500">Live authentication records on MikroTik CCR2116</p>
            </div>
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search username, IP, ONU..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:ring-1 focus:ring-sky-500 focus:outline-none"
              />
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                <tr>
                  <th className="px-4 py-3">PPPoE User</th>
                  <th className="px-4 py-3">IP Address</th>
                  <th className="px-4 py-3">MAC / ONU SN</th>
                  <th className="px-4 py-3">Profile Tier</th>
                  <th className="px-4 py-3">Session Uptime</th>
                  <th className="px-4 py-3">Traffic (Rx/Tx)</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredPppoe.map(s => (
                  <tr key={s.user} className="hover:bg-slate-50/70 transition-colors">
                    <td className="px-4 py-3 font-semibold text-slate-900 font-mono">{s.user}</td>
                    <td className="px-4 py-3 font-mono text-slate-600">{s.ip}</td>
                    <td className="px-4 py-3">
                      <div className="font-mono text-slate-700 text-[11px]">{s.mac}</div>
                      <span className="text-[10px] text-slate-400 font-mono">{s.onuSn}</span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="bg-sky-50 text-sky-700 border border-sky-200 px-2 py-0.5 rounded text-[11px] font-medium">
                        {s.profile}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{s.uptime}</td>
                    <td className="px-4 py-3 text-slate-600">
                      ↓ {s.rxBytes} / ↑ {s.txBytes}
                    </td>
                    <td className="px-4 py-3">
                      <span
                        className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                          s.status === 'connected'
                            ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            : 'bg-rose-50 text-rose-700 border border-rose-200'
                        }`}
                      >
                        {s.status === 'connected' ? 'Connected' : 'LOS Alert'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        onClick={() => alert(`Disconnected PPPoE session for ${s.user}`)}
                        className="px-2 py-1 text-rose-600 hover:bg-rose-50 rounded text-[11px] font-semibold border border-rose-200 transition-colors cursor-pointer"
                      >
                        Reset Session
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      ) : activeSubTab === 'olt' ? (
        /* OLT PON Ports View */
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {oltDevices.map(olt => (
              <div key={olt.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 rounded-lg bg-sky-50 text-sky-600">
                      <HardDrive className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{olt.name}</h3>
                      <p className="text-xs text-slate-500">{olt.location} · {olt.ip}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                    Healthy
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <span className="text-[11px] text-slate-400 block font-medium">PON Ports</span>
                    <span className="text-sm font-bold text-slate-800">
                      {olt.activePonPorts} / {olt.totalPonPorts} Active
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <span className="text-[11px] text-slate-400 block font-medium">Active ONUs</span>
                    <span className="text-sm font-bold text-emerald-600">
                      {olt.onlineOnus} Online
                    </span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2.5">
                    <span className="text-[11px] text-slate-400 block font-medium">LOS Faults</span>
                    <span className="text-sm font-bold text-rose-600">
                      {olt.losOnus} Alarms
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-slate-500 mt-3 pt-2">
                  <span>Chassis Temp: <strong>{olt.temp}</strong></span>
                  <span>Fans: <strong>{olt.fanStatus}</strong></span>
                </div>
              </div>
            ))}
          </div>
        </div>
      ) : (
        /* Network Overview */
        <div className="space-y-6">
          {/* MikroTik Core Routers */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {mikrotikRouters.map(router => (
              <div key={router.id} className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2 rounded-lg bg-sky-50 text-sky-600">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-slate-900">{router.name}</h3>
                      <p className="text-xs text-slate-500">{router.rosVersion} · {router.ip}</p>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded text-xs font-semibold">
                    Online
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2 mt-4 pt-4 border-t border-slate-100 text-center">
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-400 block">CPU Load</span>
                    <span className="text-xs font-bold text-slate-800">{router.cpu}%</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-400 block">RAM Used</span>
                    <span className="text-xs font-bold text-slate-800">{router.ram}%</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-400 block">PPPoE Users</span>
                    <span className="text-xs font-bold text-sky-600">{router.activePppoe}</span>
                  </div>
                  <div className="bg-slate-50 rounded-lg p-2">
                    <span className="text-[10px] text-slate-400 block">Throughput</span>
                    <span className="text-xs font-bold text-emerald-600">{router.throughputRx}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Optical Nodes & Core Switch Table */}
          <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
              <div>
                <h3 className="text-sm font-bold text-slate-900">Headend & Field Distribution Nodes</h3>
                <p className="text-xs text-slate-500">Optical power levels and live ICMP latency response</p>
              </div>
              <span className="text-xs font-medium text-slate-600 bg-white border border-slate-200 px-2 py-1 rounded">
                {nodes.length} Network Nodes Monitored
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Node / Substation</th>
                    <th className="px-4 py-3">IP & Type</th>
                    <th className="px-4 py-3">Optical Rx Power</th>
                    <th className="px-4 py-3">Latency</th>
                    <th className="px-4 py-3">Packet Loss</th>
                    <th className="px-4 py-3">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {nodes.map(node => (
                    <tr key={node.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-900">{node.name}</div>
                        <span className="text-[11px] text-slate-400">{node.location}</span>
                      </td>
                      <td className="px-4 py-3">
                        <span className="font-mono text-slate-700">{node.ipAddress || '10.200.0.1'}</span>
                        <span className="block text-[10px] uppercase text-slate-400">{node.type}</span>
                      </td>
                      <td className="px-4 py-3 font-mono font-medium">
                        {node.rxPowerDbm !== undefined ? (
                          <span
                            className={
                              node.rxPowerDbm < -27
                                ? 'text-rose-600 font-bold'
                                : node.rxPowerDbm < -24
                                ? 'text-amber-600'
                                : 'text-emerald-600 font-semibold'
                            }
                          >
                            {node.rxPowerDbm} dBm
                          </span>
                        ) : (
                          <span className="text-slate-400">N/A</span>
                        )}
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={node.latencyMs > 50 ? 'text-amber-600 font-bold' : 'text-slate-700'}>
                          {node.latencyMs} ms
                        </span>
                      </td>
                      <td className="px-4 py-3 font-mono">
                        <span className={node.packetLossPercent > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                          {node.packetLossPercent}%
                        </span>
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                            node.status === 'online'
                              ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                              : node.status === 'degraded'
                              ? 'bg-amber-50 text-amber-700 border border-amber-200'
                              : 'bg-rose-50 text-rose-700 border border-rose-200'
                          }`}
                        >
                          {node.status.toUpperCase()}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
