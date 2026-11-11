import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { AlertSeverity } from '../../types';
import {
  AlertTriangle,
  Volume2,
  VolumeX,
  CheckCircle2,
  Clock,
  ShieldAlert,
  Radio,
  PlusCircle,
  Zap,
} from 'lucide-react';
import { alertAudio } from '../../utils/audioChime';

export const AlertsView: React.FC = () => {
  const {
    alerts,
    staff,
    soundEnabled,
    setSoundEnabled,
    acknowledgeAlert,
    resolveAlert,
    createAlert,
  } = useApp();

  const [severityFilter, setSeverityFilter] = useState<string>('active');
  const [showCreateModal, setShowCreateModal] = useState(false);

  // New Alert Form state
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newSeverity, setNewSeverity] = useState<AlertSeverity>('warning');

  const filteredAlerts = alerts.filter(a => {
    if (severityFilter === 'active') return !a.resolved;
    if (severityFilter === 'resolved') return a.resolved;
    if (severityFilter === 'critical') return !a.resolved && a.severity === 'critical';
    if (severityFilter === 'warning') return !a.resolved && a.severity === 'warning';
    return true;
  });

  const criticalCount = alerts.filter(a => !a.resolved && a.severity === 'critical').length;
  const warningCount = alerts.filter(a => !a.resolved && a.severity === 'warning').length;
  const resolvedCount = alerts.filter(a => a.resolved).length;

  const handleCreateCustomAlert = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;
    createAlert({
      title: newTitle,
      description: newDesc || 'Automated network monitor alert',
      severity: newSeverity,
    });
    setNewTitle('');
    setNewDesc('');
    setShowCreateModal(false);
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Automated Alerts & Failure Monitor
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Real-time threshold alerts for fiber loss, link timeouts, and latency degradation.
          </p>
        </div>

        {/* Audio control & trigger test */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => {
              alertAudio.playCriticalChime();
            }}
            className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 rounded-lg hover:bg-slate-50 transition-colors cursor-pointer flex items-center gap-1.5"
          >
            <Radio className="w-3.5 h-3.5 text-sky-600" />
            <span>Test Sound Chime</span>
          </button>

          <button
            onClick={() => setSoundEnabled(!soundEnabled)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-lg border transition-colors cursor-pointer flex items-center gap-1.5 ${
              soundEnabled
                ? 'bg-sky-50 border-sky-200 text-sky-700'
                : 'bg-slate-50 border-slate-200 text-slate-500'
            }`}
          >
            {soundEnabled ? (
              <>
                <Volume2 className="w-3.5 h-3.5" />
                <span>Alert Sound On</span>
              </>
            ) : (
              <>
                <VolumeX className="w-3.5 h-3.5" />
                <span>Muted</span>
              </>
            )}
          </button>

          <button
            onClick={() => setShowCreateModal(true)}
            className="px-3.5 py-1.5 text-xs font-semibold text-white bg-sky-600 rounded-lg hover:bg-sky-700 transition-colors flex items-center gap-1 cursor-pointer"
          >
            <PlusCircle className="w-3.5 h-3.5" />
            <span>Log Alert</span>
          </button>
        </div>
      </div>

      {/* Primary KPI Grid (Same compact size & standard color fill as Overview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Active Alerts - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Active Incidents</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <ShieldAlert className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight">
            {criticalCount + warningCount} <span className="text-xs font-sans font-medium text-rose-900">Active</span>
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-rose-950 font-semibold">{criticalCount} Critical</span>
            <span>·</span>
            <span>{warningCount} Warnings</span>
          </div>
        </div>

        {/* Critical Fiber Cuts - Standard Amber */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Critical Cuts</span>
            <div className="p-1 rounded-md bg-amber-100/80 text-amber-800">
              <AlertTriangle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight font-mono">
            {criticalCount} <span className="text-xs font-sans font-medium text-amber-900">Fiber Outages</span>
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span>Immediate Splicer Dispatch</span>
          </div>
        </div>

        {/* Latency Spikes - Standard Sky */}
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Latency & Jitter</span>
            <div className="p-1 rounded-md bg-sky-100/80 text-sky-700">
              <Zap className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-sky-950 tabular-nums leading-tight font-mono">
            {warningCount} <span className="text-xs font-sans font-medium text-sky-900">Spikes</span>
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-sky-900 font-semibold">High Attenuation Alerts</span>
          </div>
        </div>

        {/* Resolved Incidents - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Resolved Archive</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight font-mono">
            {resolvedCount} <span className="text-xs font-sans font-medium text-emerald-900">Resolved</span>
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-emerald-950 font-semibold">Restored & Verified</span>
          </div>
        </div>
      </div>

      {/* Severity Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-fit">
        <button
          onClick={() => setSeverityFilter('active')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            severityFilter === 'active'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Active ({criticalCount + warningCount})
        </button>
        <button
          onClick={() => setSeverityFilter('critical')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            severityFilter === 'critical'
              ? 'bg-white text-rose-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Critical Cuts ({criticalCount})
        </button>
        <button
          onClick={() => setSeverityFilter('warning')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            severityFilter === 'warning'
              ? 'bg-white text-amber-700 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Latency Spikes ({warningCount})
        </button>
        <button
          onClick={() => setSeverityFilter('resolved')}
          className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
            severityFilter === 'resolved'
              ? 'bg-white text-slate-900 shadow-2xs'
              : 'text-slate-600 hover:text-slate-900'
          }`}
        >
          Resolved Archive ({resolvedCount})
        </button>
      </div>

      {/* Alerts Feed */}
      <div className="space-y-3">
        {filteredAlerts.map(alert => {
          const isCritical = alert.severity === 'critical';
          const isWarning = alert.severity === 'warning';

          return (
            <div
              key={alert.id}
              className={`p-4 rounded-xl border transition-all ${
                alert.resolved
                  ? 'bg-slate-50/70 border-slate-200 opacity-75'
                  : isCritical
                  ? 'bg-rose-50/40 border-rose-200'
                  : isWarning
                  ? 'bg-amber-50/40 border-amber-200'
                  : 'bg-white border-slate-200'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                <div className="flex items-start gap-3">
                  <div
                    className={`p-2 rounded-lg shrink-0 mt-0.5 ${
                      alert.resolved
                        ? 'bg-slate-200 text-slate-600'
                        : isCritical
                        ? 'bg-rose-100 text-rose-700'
                        : isWarning
                        ? 'bg-amber-100 text-amber-700'
                        : 'bg-sky-100 text-sky-700'
                    }`}
                  >
                    {isCritical ? (
                      <ShieldAlert className="w-5 h-5" />
                    ) : (
                      <AlertTriangle className="w-5 h-5" />
                    )}
                  </div>

                  <div className="space-y-1">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="text-sm font-bold text-slate-900">
                        {alert.title}
                      </span>
                      <span
                        className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                          alert.resolved
                            ? 'bg-slate-200 text-slate-700'
                            : isCritical
                            ? 'bg-rose-100 text-rose-800'
                            : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        {alert.resolved ? 'Resolved' : alert.severity}
                      </span>
                    </div>

                    <p className="text-xs text-slate-600 max-w-3xl">
                      {alert.description}
                    </p>

                    <div className="text-[11px] text-slate-400 flex items-center gap-2 pt-0.5">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3 h-3" />
                        {alert.timestamp}
                      </span>
                      {alert.acknowledged && !alert.resolved && (
                        <>
                          <span>·</span>
                          <span className="text-sky-600 font-semibold">Acknowledged by NOC</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                {/* Actions: Acknowledge & Resolve */}
                <div className="flex items-center gap-2 self-start md:self-auto shrink-0 pt-2 md:pt-0">
                  {!alert.resolved && (
                    <>
                      {!alert.acknowledged && (
                        <button
                          onClick={() => acknowledgeAlert(alert.id)}
                          className="px-3 py-1.5 text-xs font-semibold text-slate-700 bg-white border border-slate-200 hover:bg-slate-50 rounded-lg transition-colors cursor-pointer"
                        >
                          Acknowledge
                        </button>
                      )}
                      <button
                        onClick={() => resolveAlert(alert.id)}
                        className="px-3 py-1.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center gap-1 shadow-2xs cursor-pointer"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>Mark Resolved</span>
                      </button>
                    </>
                  )}
                  {alert.resolved && (
                    <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4" />
                      Closed
                    </span>
                  )}
                </div>
              </div>
            </div>
          );
        })}

        {filteredAlerts.length === 0 && (
          <div className="bg-white border border-slate-200 rounded-xl p-12 text-center text-slate-500 text-xs shadow-2xs">
            <CheckCircle2 className="w-10 h-10 text-emerald-500 mx-auto mb-2" />
            No alerts found for selected filter. Network telemetry is nominal.
          </div>
        )}
      </div>

      {/* Manual Alert Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateCustomAlert}
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Create Network Alert / Incident</h3>
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer text-sm font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Alert Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Fiber Trunk Micro-Bend near Sector 4"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Severity Level</label>
                <select
                  value={newSeverity}
                  onChange={e => setNewSeverity(e.target.value as AlertSeverity)}
                  className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50 focus:outline-none"
                >
                  <option value="critical">Critical (Connection Failure / Cut)</option>
                  <option value="warning">Warning (Latency Spike / High Attenuation)</option>
                  <option value="info">Info (Informational / Auto-Reroute)</option>
                </select>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description / Location Details</label>
                <textarea
                  rows={3}
                  placeholder="Details of optical power loss, pole location, or customer reports..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>
            </div>

            <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowCreateModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 hover:bg-slate-100 rounded-lg cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg shadow-2xs cursor-pointer"
              >
                Publish Alert
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
