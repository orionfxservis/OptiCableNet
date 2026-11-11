import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NetworkNode } from '../../types';
import {
  Activity,
  Zap,
  Radio,
  CheckCircle,
  AlertTriangle,
  AlertOctagon,
  Play,
  Search,
  Filter,
} from 'lucide-react';

export const PerformanceView: React.FC = () => {
  const { nodes, cableRuns, simulateLatencySpike } = useApp();

  const [selectedZone, setSelectedZone] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Diagnostic Ping Modal State
  const [pingingNode, setPingingNode] = useState<NetworkNode | null>(null);
  const [pingResults, setPingResults] = useState<{
    running: boolean;
    packets: { seq: number; rttMs: number; status: 'ok' | 'timeout' }[];
    avgRtt: number;
    packetLoss: number;
    opticalRxDbm: number;
  } | null>(null);

  const zones = Array.from(new Set(nodes.map(n => n.zone)));

  const filteredNodes = nodes.filter(n => {
    const matchesZone = selectedZone === 'all' || n.zone === selectedZone;
    const matchesStatus = statusFilter === 'all' || n.status === statusFilter;
    const matchesSearch =
      n.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      n.location.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (n.ipAddress && n.ipAddress.includes(searchQuery));
    return matchesZone && matchesStatus && matchesSearch;
  });

  // Calculate Optical Health Aggregates
  const totalMonitored = nodes.length;
  const nominalNodes = nodes.filter(n => (n.rxPowerDbm ?? -20) >= -24 && n.status === 'online');
  const degradedNodes = nodes.filter(
    n => ((n.rxPowerDbm ?? -20) < -24 && (n.rxPowerDbm ?? -20) >= -27) || n.status === 'degraded'
  );
  const criticalNodes = nodes.filter(n => (n.rxPowerDbm ?? -20) < -27 || n.status === 'offline');

  const avgLatency = +(nodes.reduce((acc, n) => acc + n.latencyMs, 0) / nodes.length).toFixed(1);

  // Diagnostic Ping Handler
  const runDiagnosticPing = (node: NetworkNode) => {
    setPingingNode(node);
    setPingResults({
      running: true,
      packets: [],
      avgRtt: 0,
      packetLoss: 0,
      opticalRxDbm: node.rxPowerDbm ?? -20,
    });

    const results: { seq: number; rttMs: number; status: 'ok' | 'timeout' }[] = [];
    const isOffline = node.status === 'offline';

    let seq = 1;
    const interval = setInterval(() => {
      if (seq > 4) {
        clearInterval(interval);
        const successful = results.filter(p => p.status === 'ok');
        const avg = successful.length
          ? +(successful.reduce((acc, p) => acc + p.rttMs, 0) / successful.length).toFixed(1)
          : 0;
        const loss = Math.round(((4 - successful.length) / 4) * 100);

        setPingResults(prev =>
          prev
            ? {
                ...prev,
                running: false,
                avgRtt: avg,
                packetLoss: loss,
              }
            : null
        );
        return;
      }

      if (isOffline) {
        results.push({ seq, rttMs: 0, status: 'timeout' });
      } else {
        const jitter = (Math.random() - 0.5) * 1.5;
        const rtt = Math.max(1.1, +(node.latencyMs + jitter).toFixed(1));
        results.push({ seq, rttMs: rtt, status: 'ok' });
      }

      setPingResults(prev => (prev ? { ...prev, packets: [...results] } : null));
      seq++;
    }, 400);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* View Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Cable Performance & Device Status
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Continuous optical loss monitoring (dBm), latency jitter detection, and diagnostic ping telemetry.
          </p>
        </div>
      </div>

      {/* Primary KPI Grid (Same compact size & standard color fill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Nominal Optical Power - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Optimal Signal</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <CheckCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight font-mono">
            {nominalNodes.length} / {totalMonitored} <span className="text-xs font-sans font-medium text-emerald-900">Nodes</span>
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-emerald-950 font-semibold">≥ -24 dBm</span>
            <span>·</span>
            <span>G.652 Standard Loss</span>
          </div>
        </div>

        {/* High Loss Warning - Standard Amber */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">High Loss Warning</span>
            <div className="p-1 rounded-md bg-amber-100/80 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight font-mono">
            {degradedNodes.length} <span className="text-xs font-sans font-medium text-amber-900">Nodes</span>
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-amber-950 font-semibold">-24 to -27 dBm</span>
            <span>·</span>
            <span>Connector Loss</span>
          </div>
        </div>

        {/* Avg Network Latency - Standard Sky */}
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Avg Network Latency</span>
            <div className="p-1 rounded-md bg-sky-100/80 text-sky-700">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-sky-950 tabular-nums leading-tight font-mono">
            {avgLatency} <span className="text-xs font-sans font-medium text-sky-900">ms</span>
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-sky-900 font-semibold">&lt; 2ms Jitter</span>
            <span>·</span>
            <span>ICMP Telemetry</span>
          </div>
        </div>

        {/* Cut / Offline Nodes - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Offline / LOS Cuts</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <AlertOctagon className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight font-mono">
            {criticalNodes.length} <span className="text-xs font-sans font-medium text-rose-900">Links</span>
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className={criticalNodes.length > 0 ? 'text-rose-950 font-bold' : 'text-emerald-900 font-semibold'}>
              {criticalNodes.length > 0 ? 'Requires Lineman Splice' : 'All links operational'}
            </span>
          </div>
        </div>
      </div>

      {/* Main Device Status Table & Filter Toolbar */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          {/* Search */}
          <div className="relative flex-1 max-w-sm">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
            <input
              type="text"
              placeholder="Search by device, IP, location..."
              value={searchQuery}
              onChange={e => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
            />
          </div>

          {/* Filters */}
          <div className="flex flex-wrap items-center gap-2">
            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <Filter className="w-3.5 h-3.5" />
              <span>Zone:</span>
              <select
                value={selectedZone}
                onChange={e => setSelectedZone(e.target.value)}
                className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="all">All Zones</option>
                {zones.map(z => (
                  <option key={z} value={z}>{z}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-1.5 text-xs text-slate-600">
              <span>Status:</span>
              <select
                value={statusFilter}
                onChange={e => setStatusFilter(e.target.value)}
                className="text-xs py-1.5 px-2 bg-slate-50 border border-slate-200 rounded-lg focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="online">Online</option>
                <option value="degraded">Degraded</option>
                <option value="offline">Offline / Cut</option>
              </select>
            </div>
          </div>
        </div>

        {/* High-Density Data Grid */}
        <div className="w-full max-w-full overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px]">
                <th className="py-2.5 px-3">Device / Node Name</th>
                <th className="py-2.5 px-3">Type</th>
                <th className="py-2.5 px-3">Zone & Location</th>
                <th className="py-2.5 px-3">Optical RX Power</th>
                <th className="py-2.5 px-3">Latency (ms)</th>
                <th className="py-2.5 px-3">Packet Loss</th>
                <th className="py-2.5 px-3">Status</th>
                <th className="py-2.5 px-3 text-right">Diagnostic Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-slate-700">
              {filteredNodes.map(node => {
                const rx = node.rxPowerDbm ?? -20;
                const isHighLoss = rx < -25;
                const isOffline = node.status === 'offline';

                return (
                  <tr key={node.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{node.name}</div>
                      {node.ipAddress && (
                        <div className="text-[11px] font-mono text-slate-400">{node.ipAddress}</div>
                      )}
                    </td>
                    <td className="py-3 px-3">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px] font-medium">
                        {node.type}
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <div className="text-slate-800 font-medium">{node.zone}</div>
                      <div className="text-[11px] text-slate-400 truncate max-w-xs">{node.location}</div>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {isOffline ? (
                        <span className="text-rose-600 font-bold">LOS (No Light)</span>
                      ) : (
                        <span className={isHighLoss ? 'text-amber-600 font-bold' : 'text-emerald-600 font-semibold'}>
                          {rx.toFixed(1)} dBm
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {isOffline ? (
                        <span className="text-rose-500 font-semibold">Timed Out</span>
                      ) : (
                        <span className={node.latencyMs > 40 ? 'text-amber-600 font-bold' : 'text-slate-800'}>
                          {node.latencyMs} ms
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      <span className={node.packetLossPercent > 0 ? 'text-rose-600 font-bold' : 'text-slate-600'}>
                        {node.packetLossPercent}%
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          node.status === 'online'
                            ? 'bg-emerald-100 text-emerald-800'
                            : node.status === 'degraded'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {node.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right">
                      <button
                        onClick={() => runDiagnosticPing(node)}
                        className="px-2.5 py-1 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors cursor-pointer"
                      >
                        Diagnostic Ping
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Diagnostic Ping Test Modal */}
      {pingingNode && pingResults && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <div>
                <span className="text-[10px] font-bold uppercase text-sky-600">ICMP & Optical Diagnostics</span>
                <h3 className="text-sm font-bold text-slate-900 mt-0.5">{pingingNode.name}</h3>
              </div>
              <button
                onClick={() => {
                  setPingingNode(null);
                  setPingResults(null);
                }}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="bg-slate-900 text-emerald-400 font-mono text-xs p-3.5 rounded-lg space-y-1 min-h-[140px]">
              <div className="text-slate-400 text-[11px]">
                PING {pingingNode.ipAddress || 'Optical Node'} (56 data bytes)...
              </div>

              {pingResults.packets.map(p => (
                <div key={p.seq} className="tabular-nums">
                  {p.status === 'ok' ? (
                    <span>64 bytes: icmp_seq={p.seq} ttl=64 time={p.rttMs} ms</span>
                  ) : (
                    <span className="text-rose-400">Request timeout for icmp_seq {p.seq} (Host Unreachable)</span>
                  )}
                </div>
              ))}

              {pingResults.running && (
                <div className="text-sky-300 animate-pulse text-[11px]">Probing link packets...</div>
              )}

              {!pingResults.running && (
                <div className="pt-2 text-slate-300 border-t border-slate-800 text-[11px]">
                  --- Ping Statistics ---<br />
                  Packets: 4 sent, Loss: {pingResults.packetLoss}%<br />
                  Average RTT: {pingResults.avgRtt} ms | RX Power: {pingResults.opticalRxDbm} dBm
                </div>
              )}
            </div>

            <div className="flex justify-end gap-2 pt-2">
              <button
                onClick={() => runDiagnosticPing(pingingNode)}
                disabled={pingResults.running}
                className="px-3 py-1.5 text-xs font-medium text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-lg cursor-pointer disabled:opacity-50"
              >
                Ping Again
              </button>
              <button
                onClick={() => {
                  setPingingNode(null);
                  setPingResults(null);
                }}
                className="px-4 py-1.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-lg cursor-pointer"
              >
                Done
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
