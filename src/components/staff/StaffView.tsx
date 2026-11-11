import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import { StaffMember } from '../../types';
import {
  Users,
  PlusCircle,
  Phone,
  Mail,
  MapPin,
  Briefcase,
  Banknote,
  CheckCircle2,
  Calendar,
  ExternalLink,
} from 'lucide-react';

export const StaffView: React.FC = () => {
  const { staff, addStaff, updateStaff } = useApp();

  const [showAddModal, setShowAddModal] = useState(false);
  const [roleFilter, setRoleFilter] = useState<string>('all');

  // Form State
  const [name, setName] = useState('');
  const [role, setRole] = useState<StaffMember['role']>('Lineman');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [assignedZone, setAssignedZone] = useState('North District - Sector 4');
  const [monthlySalary, setMonthlySalary] = useState<number>(45000);

  const filteredStaff = staff.filter(s => {
    if (roleFilter === 'all') return true;
    return s.role === roleFilter;
  });

  const totalPayroll = staff.reduce((acc, s) => acc + s.monthlySalary, 0);
  const onFieldCount = staff.filter(s => s.status === 'on_field').length;

  const handleCreateStaff = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !phone) return;

    addStaff({
      name,
      role,
      phone,
      email: email || `${name.toLowerCase().replace(/\s+/g, '.')}@opticable.net`,
      assignedZone,
      monthlySalary: Number(monthlySalary),
      status: 'standby',
      activeTasksCount: 0,
      joiningDate: new Date().toISOString().split('T')[0],
    });

    setShowAddModal(false);
    setName('');
    setPhone('');
    setEmail('');
  };

  return (
    <div className="space-y-6 pb-20">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-slate-900 tracking-tight">
            Field Linemen & Technical Staff
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Technician assignments, emergency fiber splicers, payroll ledger, and field duty status.
          </p>
        </div>

        <button
          onClick={() => setShowAddModal(true)}
          className="px-3.5 py-2 text-xs font-semibold text-white bg-sky-600 hover:bg-sky-700 rounded-lg transition-colors flex items-center gap-1.5 cursor-pointer shadow-2xs self-start sm:self-auto"
        >
          <PlusCircle className="w-3.5 h-3.5" />
          <span>Add Staff Member</span>
        </button>
      </div>

      {/* Primary KPI Grid (Same compact size & standard color fill) */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
        {/* Total Team Size - Standard Sky */}
        <div className="bg-sky-50/90 border border-sky-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-sky-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-sky-800">Team Size</span>
            <div className="p-1 rounded-md bg-sky-100/80 text-sky-700">
              <Users className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-sky-950 tabular-nums leading-tight">
            {staff.length} <span className="text-xs font-sans font-medium text-sky-900">Members</span>
          </div>
          <div className="text-[11px] text-sky-800/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-sky-900 font-semibold">{staff.filter(s => s.role === 'Lineman').length} Linemen</span>
            <span>·</span>
            <span>NOC & Splicers</span>
          </div>
        </div>

        {/* Monthly Payroll - Standard Amber */}
        <div className="bg-amber-50/90 border border-amber-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-amber-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-amber-800">Monthly Payroll</span>
            <div className="p-1 rounded-md bg-amber-100/80 text-amber-800">
              <Banknote className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-amber-950 tabular-nums leading-tight font-mono">
            Rs. {totalPayroll.toLocaleString()}
          </div>
          <div className="text-[11px] text-amber-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span>Base salaries</span>
            <span>·</span>
            <span className="text-amber-950 font-semibold">All staff active</span>
          </div>
        </div>

        {/* Currently On Field - Standard Emerald */}
        <div className="bg-emerald-50/90 border border-emerald-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-emerald-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-800">On Field Duty</span>
            <div className="p-1 rounded-md bg-emerald-100/80 text-emerald-800">
              <CheckCircle2 className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-emerald-950 tabular-nums leading-tight">
            {onFieldCount} <span className="text-xs font-sans font-medium text-emerald-900">Active</span>
          </div>
          <div className="text-[11px] text-emerald-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-emerald-950 font-semibold">{staff.filter(s => s.status === 'standby').length} Standby</span>
            <span>·</span>
            <span>Field Dispatches</span>
          </div>
        </div>

        {/* Active Field Tasks - Standard Rose */}
        <div className="bg-rose-50/90 border border-rose-200/90 rounded-xl py-2.5 px-3.5 shadow-2xs transition-all hover:border-rose-300">
          <div className="flex items-center justify-between mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-800">Active Tickets</span>
            <div className="p-1 rounded-md bg-rose-100/80 text-rose-700">
              <Briefcase className="w-3.5 h-3.5" />
            </div>
          </div>
          <div className="text-xl font-bold text-rose-950 tabular-nums leading-tight">
            {staff.reduce((acc, s) => acc + s.activeTasksCount, 0)} Tasks
          </div>
          <div className="text-[11px] text-rose-900/80 mt-0.5 flex items-center gap-1.5 font-medium truncate">
            <span className="text-rose-950 font-semibold">Fiber splicing & repair</span>
          </div>
        </div>
      </div>

      {/* Role Filters */}
      <div className="flex flex-wrap items-center gap-1 p-1 bg-slate-100 rounded-lg max-w-fit">
        {[
          { id: 'all', label: 'All Staff' },
          { id: 'Lineman', label: 'Linemen' },
          { id: 'Fiber Splicer', label: 'Fiber Splicers' },
          { id: 'NOC Engineer', label: 'NOC Engineers' },
          { id: 'Billing Agent', label: 'Billing Desk' },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setRoleFilter(tab.id)}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-colors cursor-pointer ${
              roleFilter === tab.id
                ? 'bg-white text-slate-900 shadow-2xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Staff Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {filteredStaff.map(member => {
          const isOnField = member.status === 'on_field';

          return (
            <div
              key={member.id}
              className="bg-white border border-slate-200 rounded-xl p-5 shadow-2xs hover:border-slate-300 transition-all flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-sky-100 text-sky-800 uppercase tracking-wide">
                      {member.role}
                    </span>
                    <h3 className="text-sm font-bold text-slate-900 mt-1">{member.name}</h3>
                    <div className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      <span>{member.assignedZone}</span>
                    </div>
                  </div>

                  <select
                    value={member.status}
                    onChange={e =>
                      updateStaff(member.id, {
                        status: e.target.value as StaffMember['status'],
                      })
                    }
                    className={`text-[10px] font-bold px-2 py-1 rounded-lg uppercase border focus:outline-none cursor-pointer ${
                      isOnField
                        ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                        : member.status === 'standby'
                        ? 'bg-slate-100 border-slate-200 text-slate-700'
                        : 'bg-amber-50 border-amber-200 text-amber-800'
                    }`}
                  >
                    <option value="on_field">On Field</option>
                    <option value="standby">Standby</option>
                    <option value="on_leave">On Leave</option>
                  </select>
                </div>

                <div className="space-y-1.5 text-xs text-slate-600 border-t border-slate-100 pt-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Phone className="w-3 h-3" /> Phone:
                    </span>
                    <a
                      href={`tel:${member.phone}`}
                      className="font-mono text-sky-600 hover:underline font-semibold"
                    >
                      {member.phone}
                    </a>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Banknote className="w-3 h-3" /> Wage / Salary:
                    </span>
                    <span className="font-mono tabular-nums font-bold text-slate-800">
                      Rs. {member.monthlySalary.toLocaleString()}/mo
                    </span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Briefcase className="w-3 h-3" /> Active Tickets:
                    </span>
                    <span className="font-mono tabular-nums font-bold text-sky-700">
                      {member.activeTasksCount} active
                    </span>
                  </div>
                </div>
              </div>

              {/* Quick Contact buttons for mobile & field ops */}
              <div className="pt-3 mt-3 border-t border-slate-100 flex items-center gap-2">
                <a
                  href={`tel:${member.phone.replace(/[^0-9+]/g, '')}`}
                  className="flex-1 py-1.5 px-2 text-xs font-semibold text-slate-700 bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-lg text-center flex items-center justify-center gap-1"
                >
                  <Phone className="w-3 h-3 text-emerald-600" />
                  <span>Call</span>
                </a>

                <a
                  href={`https://wa.me/${member.phone.replace(/[^0-9]/g, '')}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-1.5 px-2 text-xs font-semibold text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 rounded-lg text-center flex items-center justify-center gap-1"
                >
                  <span>WhatsApp</span>
                  <ExternalLink className="w-3 h-3" />
                </a>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add Staff Modal */}
      {showAddModal && (
        <div className="fixed inset-0 z-50 bg-black/40 flex items-center justify-center p-4">
          <form
            onSubmit={handleCreateStaff}
            className="bg-white rounded-xl border border-slate-200 max-w-md w-full p-5 shadow-xl space-y-4"
          >
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-sm font-bold text-slate-900">Add Staff Member / Lineman</h3>
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
                <label className="font-semibold text-slate-700 block mb-1">Full Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Tariq Ahmed"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Role</label>
                  <select
                    value={role}
                    onChange={e => setRole(e.target.value as StaffMember['role'])}
                    className="w-full p-2 border border-slate-200 rounded-lg bg-slate-50"
                  >
                    <option value="Lineman">Lineman</option>
                    <option value="Fiber Splicer">Fiber Splicer</option>
                    <option value="NOC Engineer">NOC Engineer</option>
                    <option value="Billing Agent">Billing Agent</option>
                    <option value="Field Supervisor">Field Supervisor</option>
                  </select>
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Monthly Salary (Pak Rs.)</label>
                  <input
                    type="number"
                    min="0"
                    required
                    value={monthlySalary}
                    onChange={e => setMonthlySalary(Number(e.target.value))}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Phone Number</label>
                  <input
                    type="text"
                    required
                    placeholder="+1 (555) 000-0000"
                    value={phone}
                    onChange={e => setPhone(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg font-mono"
                  />
                </div>

                <div>
                  <label className="font-semibold text-slate-700 block mb-1">Email</label>
                  <input
                    type="email"
                    placeholder="email@opticable.net"
                    value={email}
                    onChange={e => setEmail(e.target.value)}
                    className="w-full p-2 border border-slate-200 rounded-lg"
                  />
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Assigned Zone / Territory</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. North District - Sector 4"
                  value={assignedZone}
                  onChange={e => setAssignedZone(e.target.value)}
                  className="w-full p-2 border border-slate-200 rounded-lg"
                />
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
                Add Member
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};
