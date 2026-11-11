import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { NetworkNode, CableRun } from '../../types';
import {
  Activity,
  Layers,
  Zap,
  CheckCircle2,
  AlertOctagon,
  ArrowRight,
  Sparkles,
  RefreshCw,
  Search,
} from 'lucide-react';

export const TopologyView: React.FC = () => {
  const {
    nodes,
    cableRuns,
    clients,
    simulateFiberCut,
    restoreFiberCut,
    simulateLatencySpike,
  } = useApp();

  const [selectedNodeId, setSelectedNodeId] = useState<string | null>('node-olt-01');
  const [selectedCableId, setSelectedCableId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'visual' | 'cables_list'>('visual');
  const [searchQuery, setSearchQuery] = useState('');

  const selectedNode = nodes.find(n => n.id === selectedNodeId);
  const selectedCable = cableRuns.find(c => c.id === selectedCableId);

  // Group nodes hierarchically
  const coreNodes = nodes.filter(n => n.type === 'OLT' || n.type === 'Router');
  const distributionNodes = nodes.filter(n => n.type === 'FDH' || n.type === 'EDFA');
  const accessNodes = nodes.filter(n => n.type === 'Splitter' || n.type === 'FDB');

  const filteredCables = cableRuns.filter(
    c =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.cableType.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.routeDescription.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="space-y-6 pb-20">
      {/* View Header with Mode Switch & Quick Filters */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Network Topology & Cable Connections
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            End-to-end fiber distribution map from Core OLT to Pole FDBs and customer drop cables.
          </p>
        </div>

        {/* View Mode Toggle */}
        <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg self-start sm:self-auto">
          <button
            onClick={() => setViewMode('visual')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'visual'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Topology Map
          </button>
          <button
            onClick={() => setViewMode('cables_list')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              viewMode === 'cables_list'
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Cable Registry ({cableRuns.length})
          </button>
        </div>
      </div>

      {viewMode === 'visual' ? (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Main Visual Topology Diagram Canvas (8 cols) */}
          <div className="lg:col-span-8 bg-white border border-slate-200 rounded-xl p-5 shadow-2xs flex flex-col">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-4">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-sky-600" />
                <span className="text-xs font-bold uppercase tracking-wider text-slate-700">
                  Interactive Node Hierarchy
                </span>
              </div>
              <div className="text-xs text-slate-500 flex items-center gap-3">
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 inline-block"></span>
                  Nominal
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500 inline-block"></span>
                  Degraded / High Loss
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500 inline-block"></span>
                  Cut / Offline
                </span>
              </div>
            </div>

            {/* Tree-like Structured Visual Hierarchy */}
            <div className="space-y-6 my-auto py-4">
              {/* Layer 1: Core Headend OLT */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">
                  Tier 1: Central Core Headend
                </div>
                <div className="flex justify-center">
                  {coreNodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isCut = node.status === 'offline';
                    return (
                      <button
                        key={node.id}
                        onClick={() => {
                          setSelectedNodeId(node.id);
                          setSelectedCableId(null);
                        }}
                        className={`p-4 rounded-xl border text-left transition-all cursor-pointer relative max-w-sm w-full ${
                          isSelected
                            ? 'border-sky-500 ring-2 ring-sky-100 bg-sky-50/40 shadow-sm'
                            : isCut
                            ? 'border-rose-300 bg-rose-50/50'
                            : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div>
                            <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wide">
                              {node.type}
                            </span>
                            <h3 className="text-sm font-bold text-slate-900 mt-1.5">{node.name}</h3>
                            <p className="text-xs text-slate-500">{node.location}</p>
                          </div>
                          <span
                            className={`w-3 h-3 rounded-full mt-1 ${
                              node.status === 'online'
                                ? 'bg-emerald-500'
                                : node.status === 'degraded'
                                ? 'bg-amber-500'
                                : 'bg-rose-500'
                            }`}
                          />
                        </div>
                        <div className="mt-3 pt-2.5 border-t border-slate-100 grid grid-cols-3 gap-2 text-xs font-mono text-slate-600 tabular-nums">
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Power</span>
                            <span className="font-semibold text-slate-900">{node.rxPowerDbm} dBm</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Latency</span>
                            <span className="font-semibold text-slate-900">{node.latencyMs} ms</span>
                          </div>
                          <div>
                            <span className="text-[10px] text-slate-400 block font-sans">Clients</span>
                            <span className="font-semibold text-sky-600">{node.activeClientsCount}</span>
                          </div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Connecting Trunk Cables Indicator */}
              <div className="flex justify-center items-center gap-8 py-1">
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="w-px h-8 bg-slate-300"></div>
              </div>

              {/* Layer 2: Distribution Hubs (FDH / EDFA) */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">
                  Tier 2: Fiber Distribution Hubs (FDH) & Optical Repeaters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {distributionNodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isCut = node.status === 'offline';
                    // Find incoming cable
                    const incomingCable = cableRuns.find(c => c.targetNodeId === node.id);

                    return (
                      <div key={node.id} className="space-y-2">
                        {/* Cable pill indicator */}
                        {incomingCable && (
                          <button
                            onClick={() => {
                              setSelectedCableId(incomingCable.id);
                              setSelectedNodeId(null);
                            }}
                            className={`w-full text-center text-[10px] font-mono py-1 px-2 rounded border transition-colors cursor-pointer flex items-center justify-between ${
                              selectedCableId === incomingCable.id
                                ? 'bg-sky-100 border-sky-300 text-sky-900 font-bold'
                                : incomingCable.status === 'cut'
                                ? 'bg-rose-100 border-rose-300 text-rose-800'
                                : incomingCable.status === 'high_loss'
                                ? 'bg-amber-100 border-amber-300 text-amber-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{incomingCable.cableType}</span>
                            <span>{incomingCable.lengthMeters}m</span>
                            <span className="uppercase font-bold">{incomingCable.status}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedNodeId(node.id);
                            setSelectedCableId(null);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer w-full ${
                            isSelected
                              ? 'border-sky-500 ring-2 ring-sky-100 bg-sky-50/40 shadow-sm'
                              : isCut
                              ? 'border-rose-300 bg-rose-50/50'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                                {node.type}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">{node.name}</h4>
                              <p className="text-[11px] text-slate-500 truncate">{node.location}</p>
                            </div>
                            <span
                              className={`w-2.5 h-2.5 rounded-full mt-1 ${
                                node.status === 'online'
                                  ? 'bg-emerald-500'
                                  : node.status === 'degraded'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600">
                            <span>RX: {node.rxPowerDbm ?? -20} dBm</span>
                            <span>Ping: {node.latencyMs}ms</span>
                            <span className="text-sky-600 font-semibold">{node.activeClientsCount} users</span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Connecting Distribution Spans */}
              <div className="flex justify-center items-center gap-12 py-1">
                <div className="w-px h-8 bg-slate-300"></div>
                <div className="w-px h-8 bg-slate-300"></div>
              </div>

              {/* Layer 3: Splitters & Pole FDBs */}
              <div>
                <div className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2 text-center">
                  Tier 3: Fiber Distribution Boxes (FDB / NAP) & Splitters
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl mx-auto">
                  {accessNodes.map(node => {
                    const isSelected = selectedNodeId === node.id;
                    const isCut = node.status === 'offline';
                    const incomingCable = cableRuns.find(c => c.targetNodeId === node.id);

                    return (
                      <div key={node.id} className="space-y-2">
                        {incomingCable && (
                          <button
                            onClick={() => {
                              setSelectedCableId(incomingCable.id);
                              setSelectedNodeId(null);
                            }}
                            className={`w-full text-center text-[10px] font-mono py-1 px-2 rounded border transition-colors cursor-pointer flex items-center justify-between ${
                              selectedCableId === incomingCable.id
                                ? 'bg-sky-100 border-sky-300 text-sky-900 font-bold'
                                : incomingCable.status === 'cut'
                                ? 'bg-rose-100 border-rose-300 text-rose-800'
                                : incomingCable.status === 'high_loss'
                                ? 'bg-amber-100 border-amber-300 text-amber-800'
                                : 'bg-slate-50 border-slate-200 text-slate-600 hover:bg-slate-100'
                            }`}
                          >
                            <span>{incomingCable.cableType}</span>
                            <span>{incomingCable.lengthMeters}m</span>
                            <span className="uppercase font-bold">{incomingCable.status}</span>
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setSelectedNodeId(node.id);
                            setSelectedCableId(null);
                          }}
                          className={`p-3.5 rounded-xl border text-left transition-all cursor-pointer w-full ${
                            isSelected
                              ? 'border-sky-500 ring-2 ring-sky-100 bg-sky-50/40 shadow-sm'
                              : isCut
                              ? 'border-rose-300 bg-rose-50/50'
                              : 'border-slate-200 bg-white hover:border-slate-300 shadow-2xs'
                          }`}
                        >
                          <div className="flex items-start justify-between">
                            <div>
                              <span className="text-[10px] font-bold px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 uppercase">
                                {node.type}
                              </span>
                              <h4 className="text-xs font-bold text-slate-900 mt-1">{node.name}</h4>
                              <p className="text-[11px] text-slate-500 truncate">{node.location}</p>
                            </div>
                            <span
                              className={`w-2.5 h-2.5 rounded-full mt-1 ${
                                node.status === 'online'
                                  ? 'bg-emerald-500'
                                  : node.status === 'degraded'
                                  ? 'bg-amber-500'
                                  : 'bg-rose-500'
                              }`}
                            />
                          </div>

                          <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] font-mono tabular-nums text-slate-600">
                            <span className={node.rxPowerDbm && node.rxPowerDbm < -25 ? 'text-amber-600 font-bold' : ''}>
                              RX: {node.rxPowerDbm ?? -22} dBm
                            </span>
                            <span>Loss: {node.attenuationDb ?? 1.2} dB</span>
                            <span className="text-sky-600 font-semibold">{node.activeClientsCount} ONUs</span>
                          </div>
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Bottom quick tip banner */}
            <div className="mt-4 pt-3 border-t border-slate-100 text-[11px] text-slate-500 flex items-center justify-between">
              <span>Tip: Click on any device node or cable span button above to inspect optical signal loss or test fiber breaks.</span>
            </div>
          </div>

          {/* Side Inspector Details Panel (4 cols) */}
          <div className="lg:col-span-4 space-y-4">
            {selectedNode && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      Device Inspector
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedNode.name}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedNode.status === 'online'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedNode.status === 'degraded'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedNode.status}
                  </span>
                </div>

                {/* Key Telemetry Grid */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Optical RX Power</span>
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      {selectedNode.rxPowerDbm !== undefined ? `${selectedNode.rxPowerDbm} dBm` : 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Nominal: -18 to -24</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Latency (Ping)</span>
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      {selectedNode.latencyMs} ms
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Jitter: &lt; 2ms</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Packet Loss</span>
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      {selectedNode.packetLossPercent}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Zero Loss Goal</span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Subscribers</span>
                    <span className="text-base font-bold font-mono text-sky-600 tabular-nums">
                      {selectedNode.activeClientsCount} / {selectedNode.totalCapacity}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">Capacity used</span>
                  </div>
                </div>

                {/* Extended Details */}
                <div className="space-y-2 text-xs border-t border-slate-100 pt-3">
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Zone / Sector</span>
                    <span className="font-semibold text-slate-800">{selectedNode.zone}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-50">
                    <span className="text-slate-500">Pole / Location</span>
                    <span className="font-semibold text-slate-800 text-right">{selectedNode.location}</span>
                  </div>
                  {selectedNode.ipAddress && (
                    <div className="flex justify-between py-1 border-b border-slate-50 font-mono">
                      <span className="text-slate-500 font-sans">Management IP</span>
                      <span className="font-semibold text-slate-800">{selectedNode.ipAddress}</span>
                    </div>
                  )}
                  {selectedNode.firmwareVersion && (
                    <div className="flex justify-between py-1 border-b border-slate-50 font-mono">
                      <span className="text-slate-500 font-sans">Firmware</span>
                      <span className="text-slate-700">{selectedNode.firmwareVersion}</span>
                    </div>
                  )}
                </div>

                {/* Node Interactive Actions */}
                <div className="space-y-2 pt-2">
                  <button
                    onClick={() => simulateLatencySpike(selectedNode.id)}
                    className="w-full py-2 px-3 text-xs font-semibold text-amber-700 bg-amber-50 hover:bg-amber-100 border border-amber-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <Zap className="w-3.5 h-3.5" />
                    <span>Test Latency Spike Alert</span>
                  </button>
                </div>
              </div>
            )}

            {selectedCable && (
              <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-sky-600">
                      Cable Run Inspector
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-0.5">{selectedCable.name}</h3>
                  </div>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      selectedCable.status === 'nominal'
                        ? 'bg-emerald-100 text-emerald-800'
                        : selectedCable.status === 'high_loss'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-rose-100 text-rose-800'
                    }`}
                  >
                    {selectedCable.status}
                  </span>
                </div>

                {/* Cable Specs */}
                <div className="grid grid-cols-2 gap-3 text-xs">
                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Length</span>
                    <span className="text-base font-bold font-mono text-slate-900 tabular-nums">
                      {selectedCable.lengthMeters} m
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {(selectedCable.lengthMeters / 1000).toFixed(2)} km
                    </span>
                  </div>

                  <div className="p-2.5 bg-slate-50 rounded-lg">
                    <span className="text-[10px] text-slate-400 block uppercase">Total Optical Loss</span>
                    <span
                      className={`text-base font-bold font-mono tabular-nums ${
                        selectedCable.totalLossDb > 2.0 ? 'text-amber-600' : 'text-slate-900'
                      }`}
                    >
                      {selectedCable.totalLossDb} dB
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-0.5">
                      {selectedCable.attenuationDbPerKm} dB/km
                    </span>
                  </div>
                </div>

                {/* Fiber Core Allocation Matrix */}
                <div className="p-3 bg-slate-50 rounded-lg space-y-2">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-semibold text-slate-800">Fiber Core Status</span>
                    <span className="text-[11px] text-slate-500 font-mono">
                      {selectedCable.activeCores} Active · {selectedCable.totalCores - selectedCable.activeCores - selectedCable.damagedCores} Dark · {selectedCable.damagedCores} Damaged
                    </span>
                  </div>

                  {/* Core dots visualization */}
                  <div className="grid grid-cols-12 gap-1.5 pt-1">
                    {Array.from({ length: selectedCable.totalCores }).map((_, idx) => {
                      let color = 'bg-slate-300'; // dark
                      if (idx < selectedCable.activeCores) color = 'bg-emerald-500';
                      else if (idx >= selectedCable.totalCores - selectedCable.damagedCores) color = 'bg-rose-500';

                      return (
                        <div
                          key={idx}
                          title={`Core #${idx + 1}: ${
                            idx < selectedCable.activeCores
                              ? 'Active Lit'
                              : idx >= selectedCable.totalCores - selectedCable.damagedCores
                              ? 'Damaged'
                              : 'Dark / Spare'
                          }`}
                          className={`w-3.5 h-3.5 rounded-sm ${color} transition-transform hover:scale-125 cursor-help`}
                        />
                      );
                    })}
                  </div>
                </div>

                {/* Route description */}
                <div className="text-xs text-slate-600 bg-slate-50/70 p-3 rounded-lg border border-slate-100">
                  <span className="font-semibold text-slate-800 block mb-1">Route & Conduit Details:</span>
                  {selectedCable.routeDescription}
                </div>

                {/* Cable Action: Simulate Fiber Break / Restore */}
                <div className="pt-2">
                  {selectedCable.status === 'cut' ? (
                    <button
                      onClick={() => restoreFiberCut(selectedCable.id)}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Repair & Restore Fiber Splice</span>
                    </button>
                  ) : (
                    <button
                      onClick={() => simulateFiberCut(selectedCable.id)}
                      className="w-full py-2.5 px-3 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <AlertOctagon className="w-4 h-4 text-rose-600" />
                      <span>Simulate Fiber Cut on this Line</span>
                    </button>
                  )}
                </div>
              </div>
            )}

            {!selectedNode && !selectedCable && (
              <div className="bg-white border border-slate-200 rounded-xl p-8 text-center text-slate-500 text-xs shadow-2xs">
                <Activity className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                Select any node or cable run on the map to inspect telemetry.
              </div>
            )}
          </div>
        </div>
      ) : (
        /* Tabular Cable Registry & Route Management */
        <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-400" />
              <input
                type="text"
                placeholder="Search cable runs, type, route..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent"
              />
            </div>
            <div className="text-xs text-slate-500">
              Total Recorded Runs: <span className="font-bold text-slate-800">{cableRuns.length}</span>
            </div>
          </div>

          <div className="w-full max-w-full overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/80 text-slate-600 uppercase font-semibold text-[11px]">
                  <th className="py-2.5 px-3">Cable Name & ID</th>
                  <th className="py-2.5 px-3">Type</th>
                  <th className="py-2.5 px-3">Span Length</th>
                  <th className="py-2.5 px-3">Core Allocation</th>
                  <th className="py-2.5 px-3">Total Loss (dB)</th>
                  <th className="py-2.5 px-3">Status</th>
                  <th className="py-2.5 px-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {filteredCables.map(cable => (
                  <tr key={cable.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3 px-3">
                      <div className="font-bold text-slate-900">{cable.name}</div>
                      <div className="text-[11px] text-slate-500 truncate max-w-xs">{cable.routeDescription}</div>
                    </td>
                    <td className="py-3 px-3 font-mono">
                      <span className="px-2 py-0.5 rounded bg-slate-100 text-slate-800 text-[11px]">
                        {cable.cableType}
                      </span>
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {cable.lengthMeters} m
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      {cable.activeCores} / {cable.totalCores} Active
                      {cable.damagedCores > 0 && (
                        <span className="text-rose-600 font-bold ml-1">({cable.damagedCores} damaged)</span>
                      )}
                    </td>
                    <td className="py-3 px-3 font-mono tabular-nums">
                      <span className={cable.totalLossDb > 2.0 ? 'text-amber-600 font-bold' : ''}>
                        {cable.totalLossDb} dB
                      </span>
                    </td>
                    <td className="py-3 px-3">
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          cable.status === 'nominal'
                            ? 'bg-emerald-100 text-emerald-800'
                            : cable.status === 'high_loss'
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-rose-100 text-rose-800'
                        }`}
                      >
                        {cable.status}
                      </span>
                    </td>
                    <td className="py-3 px-3 text-right space-x-2">
                      {cable.status === 'cut' ? (
                        <button
                          onClick={() => restoreFiberCut(cable.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg cursor-pointer"
                        >
                          Restore
                        </button>
                      ) : (
                        <button
                          onClick={() => simulateFiberCut(cable.id)}
                          className="px-2.5 py-1 text-xs font-semibold text-rose-700 bg-rose-50 hover:bg-rose-100 border border-rose-200 rounded-lg cursor-pointer"
                        >
                          Cut Test
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
