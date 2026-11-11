import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { MaintenanceSchedule } from '../../types';
import {
  Wrench,
  Calendar,
  Clock,
  PlusCircle,
  CheckCircle2,
  Users,
  AlertTriangle,
  PlayCircle,
  UserCheck,
} from 'lucide-react';

export const MaintenanceView: React.FC = () => {
  const {
    maintenance,
    staff,
    nodes,
    cableRuns,
    addMaintenance,
    updateMaintenanceStatus,
  } = useApp();

  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showAddModal, setShowAddModal] = useState(false);

  // Form state
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [zone, setZone] = useState('North District - Sector 4');
  const [scheduledDate, setScheduledDate] = useState(
    new Date(Date.now() + 86400000 * 2).toISOString().slice(0, 16)
  );
  const [durationHours, setDurationHours] = useState(2);
  const [affectedCount, setAffectedCount] = useState(10);
  const [assignedTech, setAssignedTech] = useState(staff[0]?.name || 'Tariq Ahmed');
  const [priority, setPriority] = useState<MaintenanceSchedule['priority']>('medium');

  const filteredMaintenance = maintenance.filter(m => {
    if (statusFilter === 'all') return true;
    return m.status === statusFilter;
  });

  const inProgressCount = maintenance.filter(m => m.status === 'in_progress').length;
  const scheduledCount = maintenance.filter(m => m.status === 'scheduled').length;
  const completedCount = maintenance.filter(m => m.status === 'completed').length;
  const totalAffectedClients = maintenance
    .filter(m => m.status !== 'completed')
    .reduce((acc, m) => acc + m.affectedClientsCount, 0);

  const handleCreateSchedule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;

    addMaintenance({
      title,
      description,
      zone,
      scheduledDate: scheduledDate.replace('T', ' '),
      estimatedDurationHours: Number(durationHours),
      affectedClientsCount: Number(affectedCount),
      assignedTechnician: assignedTech,
      priority,
      status: 'scheduled',
    });

    setShowAddModal(false);
    setTitle('');
    setDescription('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Upcoming Maintenance & Splicing Schedules
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Planned trunk re-routing, pole elevation, battery replacements, and client downtime notices.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Schedule Maintenance</span>
        </button>
      </div>

      {/* Primary KPI Grid (Same compact size & standard color fill as Overview) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Maintenance Schedules - Standard Sky */}
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Total Operations</span>
            <div className="p-1 rounded-md bg-sky-100/80 text-sky-700">
              <Wrench className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-sky-950 tabular-nums leading-tight">
            {maintenance.length} <span className="text-xs font-sans font-medium text-sky-900">Tasks</span>
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-sky-900 font-semibold">{scheduledCount} Scheduled</span>
            <span>·</span>
            <span>Trunk & Pole Works</span>
          </div>
        </div>

        {/* In Progress Tasks - Standard Amber */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">In Progress</span>
            <div className="p-1 rounded-md bg-amber-100/80 text-amber-800">
              <PlayCircle className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight font-mono">
            {inProgressCount} <span className="text-xs font-sans font-medium text-amber-900">Active</span>
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span>Lineman Field Crew</span>
            <span>·</span>
            <span className="text-amber-950 font-semibold">Underway</span>
          </div>
        </div>

        {/* Completed Operations - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">Restored & Verified</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight font-mono">
            {completedCount} <span className="text-xs font-sans font-medium text-emerald-900">Done</span>
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-emerald-950 font-semibold">
              {Math.round((completedCount / Math.max(1, maintenance.length)) * 100)}% Complete
            </span>
            <span>·</span>
            <span>Passed OTDR Test</span>
          </div>
        </div>

        {/* Affected Subscribers - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Client Impact</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight font-mono">
            {totalAffectedClients} <span className="text-xs font-sans font-medium text-rose-900">Subscribers</span>
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className={totalAffectedClients > 0 ? 'text-rose-950 font-bold' : 'text-emerald-900 font-semibold'}>
              {totalAffectedClients > 0 ? 'Maintenance Notice Sent' : 'Zero Downtime Planned'}
            </span>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-fit">
        {['all', 'scheduled', 'in_progress', 'completed'].map(tab => (
          <button
            key={tab}
            onClick={() => setStatusFilter(tab)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors capitalize cursor-pointer ${
              statusFilter === tab
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.replace('_', ' ')} (
            {tab === 'all'
              ? maintenance.length
              : maintenance.filter(m => m.status === tab).length}
            )
          </button>
        ))}
      </div>

      {/* Schedules List */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredMaintenance.map(item => {
          const isHigh = item.priority === 'high';
          const isCompleted = item.status === 'completed';
          const isInProgress = item.status === 'in_progress';

          return (
            <div
              key={item.id}
              className={`p-5 rounded-xl border transition-all flex flex-col justify-between ${
                isCompleted
                  ? 'bg-slate-50/60 border-slate-200'
                  : isInProgress
                  ? 'bg-sky-50/40 border-sky-300 ring-2 ring-sky-100'
                  : 'bg-white border-slate-200 hover:border-slate-300 shadow-2xs'
              }`}
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between gap-2">
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase ${
                      isHigh
                        ? 'bg-rose-100 text-rose-800'
                        : item.priority === 'medium'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-slate-100 text-slate-700'
                    }`}
                  >
                    {item.priority} Priority
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded uppercase ${
                      isCompleted
                        ? 'bg-emerald-100 text-emerald-800'
                        : isInProgress
                        ? 'bg-sky-100 text-sky-800 animate-pulse'
                        : 'bg-slate-100 text-slate-600'
                    }`}
                  >
                    {item.status.replace('_', ' ')}
                  </span>
                </div>

                <div>
                  <h3 className="text-sm font-bold text-slate-900">{item.title}</h3>
                  <p className="text-xs text-slate-600 mt-1 line-clamp-3">{item.description}</p>
                </div>

                <div className="space-y-1.5 text-xs text-slate-500 pt-2 border-t border-slate-100">
                  <div className="flex items-center gap-1.5 text-slate-700 font-medium">
                    <Calendar className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.scheduledDate}</span>
                    <span className="text-slate-400">({item.estimatedDurationHours}h window)</span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <UserCheck className="w-3.5 h-3.5 text-slate-400" />
                    <span>Technician: <strong className="text-slate-800">{item.assignedTechnician}</strong></span>
                  </div>

                  <div className="flex items-center gap-1.5">
                    <Users className="w-3.5 h-3.5 text-slate-400" />
                    <span>{item.affectedClientsCount} affected subscribers</span>
                  </div>

                  <div className="text-[11px] text-slate-400">
                    Zone: {item.zone}
                  </div>
                </div>
              </div>

              {/* Status Actions */}
              <div className="pt-4 mt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                {item.status === 'scheduled' && (
                  <button
                    onClick={() => updateMaintenanceStatus(item.id, 'in_progress')}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-sky-700 bg-sky-50 hover:bg-sky-100 border border-sky-200 rounded-lg transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                  >
                    <PlayCircle className="w-3.5 h-3.5 text-sky-600" />
                    <span>Start Task</span>
                  </button>
                )}

                {item.status === 'in_progress' && (
                  <button
                    onClick={() => updateMaintenanceStatus(item.id, 'completed')}
                    className="w-full py-1.5 px-3 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-lg transition-colors flex items-center justify-center gap-1.5 shadow-2xs cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Mark Completed</span>
                  </button>
                )}

                {isCompleted && (
                  <span className="text-xs text-emerald-700 font-semibold flex items-center gap-1 py-1">
                    <CheckCircle2 className="w-4 h-4" />
                    Finished & Restored
                  </span>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Maintenance Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateSchedule}
            className="bg-white rounded-xl border border-slate-200 max-w-lg w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Schedule Network Maintenance</h3>
              <button
                type="button"
                onClick={() => setShowAddModal(false)}
                className="text-slate-400 hover:text-slate-700 cursor-pointer font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Task Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Splicing Enclosure Expansion & Drop Cleaning"
                  value={title}
                  onChange={e => setTitle(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Description</label>
                <textarea
                  rows={2}
                  required
                  placeholder="Explain splicing, pole re-routing or firmware maintenance steps..."
                  value={description}
                  onChange={e => setDescription(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Scheduled Date & Time</label>
                  <input
                    type="datetime-local"
                    required
                    value={scheduledDate}
                    onChange={e => setScheduledDate(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Duration (Hours)</label>
                  <input
                    type="number"
                    min="0.5"
                    step="0.5"
                    required
                    value={durationHours}
                    onChange={e => setDurationHours(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Assigned Lineman / Tech</label>
                  <select
                    value={assignedTech}
                    onChange={e => setAssignedTech(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    {staff.map(s => (
                      <option key={s.id} value={s.name}>
                        {s.name} ({s.role})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={e => setPriority(e.target.value as MaintenanceSchedule['priority'])}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="high">High (Customer Impacting)</option>
                    <option value="medium">Medium (Routine Preventive)</option>
                    <option value="low">Low (Non-Impacting)</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Zone</label>
                  <input
                    type="text"
                    required
                    value={zone}
                    onChange={e => setZone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Estimated Affected Clients</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={affectedCount}
                    onChange={e => setAffectedCount(Number(e.target.value))}
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
                Schedule Task
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
