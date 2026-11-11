import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  LifeBuoy,
  PlusCircle,
  Search,
  Filter,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Flame,
  Phone,
  User,
  Wrench,
  MessageSquare,
  Sparkles,
} from 'lucide-react';

interface ComplaintTicket {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  area: string;
  category: 'fiber_cut' | 'red_los' | 'slow_speed' | 'tv_nosignal' | 'drop_wire' | 'billing';
  priority: 'urgent' | 'high' | 'medium' | 'low';
  title: string;
  description: string;
  assignedStaff: string;
  status: 'open' | 'in_progress' | 'resolved';
  createdAt: string;
  resolvedAt?: string;
}

const INITIAL_TICKETS: ComplaintTicket[] = [
  {
    id: 'TKT-2026-101',
    clientId: 'cli-001',
    clientName: 'Rashid Mehmood',
    phone: '0300-1234567',
    area: 'Sector F-7/1',
    category: 'red_los',
    priority: 'urgent',
    title: 'Red LOS Light blinking on GPON ONU',
    description: 'Optical power dropped to -34.8 dBm after construction team worked on pole.',
    assignedStaff: 'Tariq Ahmed',
    status: 'in_progress',
    createdAt: 'Today, 09:15 AM',
  },
  {
    id: 'TKT-2026-102',
    clientId: 'cli-004',
    clientName: 'Khurram Shehzad',
    phone: '0333-8899112',
    area: 'Sector I-8/4',
    category: 'fiber_cut',
    priority: 'urgent',
    title: 'Drop cable broken by tree branch during wind',
    description: 'Subscriber has completely zero link. Drop wire hanging from pole near gate.',
    assignedStaff: 'Kamran Lineman',
    status: 'open',
    createdAt: 'Today, 10:30 AM',
  },
  {
    id: 'TKT-2026-103',
    clientId: 'cli-003',
    clientName: 'Ayesha Malik',
    phone: '0312-5566778',
    area: 'Sector G-11/3',
    category: 'slow_speed',
    priority: 'medium',
    title: 'High latency and packet loss on gaming console',
    description: 'Pinging Singapore servers shows 140ms with jitter. Needs PPPoE route check.',
    assignedStaff: 'Ali Raza (NOC Tech)',
    status: 'open',
    createdAt: 'Yesterday, 04:20 PM',
  },
  {
    id: 'TKT-2026-104',
    clientId: 'cli-008',
    clientName: 'Zubair Butt',
    phone: '0302-3344556',
    area: 'Sector E-11/2',
    category: 'tv_nosignal',
    priority: 'medium',
    title: 'Cable TV analog channels showing severe snow and noise',
    description: 'RF Amplifier AGC gain low on tap splitter. RF attenuation check needed.',
    assignedStaff: 'Tariq Ahmed',
    status: 'resolved',
    createdAt: 'Yesterday, 11:00 AM',
    resolvedAt: 'Yesterday, 02:40 PM',
  },
];

export const ComplaintsView: React.FC = () => {
  const { clients } = useApp();
  const [tickets, setTickets] = useState<ComplaintTicket[]>(INITIAL_TICKETS);
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);

  // New ticket state
  const [newClientName, setNewClientName] = useState(clients[0]?.name || '');
  const [newPhone, setNewPhone] = useState(clients[0]?.phone || '');
  const [newArea, setNewArea] = useState('Sector F-8');
  const [newCategory, setNewCategory] = useState<ComplaintTicket['category']>('red_los');
  const [newPriority, setNewPriority] = useState<ComplaintTicket['priority']>('high');
  const [newTitle, setNewTitle] = useState('');
  const [newDesc, setNewDesc] = useState('');
  const [newStaff, setNewStaff] = useState('Tariq Ahmed');

  const openTicketsCount = tickets.filter(t => t.status === 'open').length;
  const inProgressCount = tickets.filter(t => t.status === 'in_progress').length;
  const resolvedCount = tickets.filter(t => t.status === 'resolved').length;
  const urgentCount = tickets.filter(t => t.priority === 'urgent' && t.status !== 'resolved').length;

  const filteredTickets = tickets.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    const q = search.toLowerCase();
    return (
      t.title.toLowerCase().includes(q) ||
      t.clientName.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.id.toLowerCase().includes(q) ||
      t.area.toLowerCase().includes(q)
    );
  });

  const handleResolveTicket = (id: string) => {
    setTickets(prev =>
      prev.map(t =>
        t.id === id
          ? {
              ...t,
              status: 'resolved',
              resolvedAt: 'Just now',
            }
          : t
      )
    );
  };

  const handleCreateTicket = (e: React.FormEvent) => {
    e.preventDefault();
    const newTkt: ComplaintTicket = {
      id: `TKT-2026-${Math.floor(100 + Math.random() * 900)}`,
      clientId: `cli-${Date.now().toString().slice(-4)}`,
      clientName: newClientName,
      phone: newPhone,
      area: newArea,
      category: newCategory,
      priority: newPriority,
      title: newTitle || 'Internet Service Disruption',
      description: newDesc,
      assignedStaff: newStaff,
      status: 'open',
      createdAt: 'Just now',
    };
    setTickets(prev => [newTkt, ...prev]);
    setIsNewModalOpen(false);
    setNewTitle('');
    setNewDesc('');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Top Header Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-indigo-50 text-indigo-700">
                <LifeBuoy className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Complaints & Helpdesk</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Customer tickets, technical support SLAs, red ONT alarms, and field dispatch.
            </p>
          </div>

          <button
            onClick={() => setIsNewModalOpen(true)}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer self-start md:self-auto"
          >
            <PlusCircle className="w-4 h-4" />
            <span>Open Support Ticket</span>
          </button>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Open Tickets</span>
            <span className="text-lg font-bold text-indigo-600">{openTicketsCount} pending</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">In Progress</span>
            <span className="text-lg font-bold text-amber-600">{inProgressCount} in field</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Urgent / Red ONT</span>
            <span className="text-lg font-bold text-rose-600">{urgentCount} critical</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Resolved Today</span>
            <span className="text-lg font-bold text-emerald-600">{resolvedCount} closed</span>
          </div>
        </div>
      </div>

      {/* Ticket List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Active Technical Tickets</h2>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
              {filteredTickets.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search ticket, name, phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="open">Open</option>
              <option value="in_progress">In Progress</option>
              <option value="resolved">Resolved</option>
            </select>

            <select
              value={priorityFilter}
              onChange={e => setPriorityFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-indigo-500 text-slate-700"
            >
              <option value="all">All Priorities</option>
              <option value="urgent">Urgent</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
            </select>
          </div>
        </div>

        <div className="divide-y divide-slate-100">
          {filteredTickets.map(ticket => (
            <div key={ticket.id} className="p-4 hover:bg-slate-50/60 transition-colors flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-1.5 flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="font-mono text-xs font-bold text-slate-700 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    {ticket.id}
                  </span>
                  <span
                    className={`text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      ticket.priority === 'urgent'
                        ? 'bg-rose-100 text-rose-800'
                        : ticket.priority === 'high'
                        ? 'bg-amber-100 text-amber-800'
                        : 'bg-blue-100 text-blue-800'
                    }`}
                  >
                    {ticket.priority}
                  </span>
                  <span className="text-xs text-slate-400 font-medium">
                    {ticket.createdAt}
                  </span>
                </div>

                <h3 className="text-sm font-bold text-slate-900">{ticket.title}</h3>
                <p className="text-xs text-slate-600 line-clamp-2">{ticket.description}</p>

                <div className="flex items-center gap-3 text-xs text-slate-500 flex-wrap pt-1">
                  <span className="flex items-center gap-1 font-medium text-slate-700">
                    <User className="w-3.5 h-3.5 text-slate-400" />
                    {ticket.clientName}
                  </span>
                  <span className="flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-slate-400" />
                    {ticket.phone}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="text-slate-600 font-medium">
                    {ticket.area}
                  </span>
                  <span className="text-slate-400">·</span>
                  <span className="flex items-center gap-1 text-slate-700">
                    <Wrench className="w-3.5 h-3.5 text-indigo-500" />
                    Assigned: <strong>{ticket.assignedStaff}</strong>
                  </span>
                </div>
              </div>

              {/* Status and Actions */}
              <div className="flex items-center gap-2 self-end md:self-center shrink-0">
                <span
                  className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                    ticket.status === 'resolved'
                      ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                      : ticket.status === 'in_progress'
                      ? 'bg-amber-50 text-amber-700 border border-amber-200'
                      : 'bg-indigo-50 text-indigo-700 border border-indigo-200'
                  }`}
                >
                  {ticket.status === 'resolved' && <CheckCircle2 className="w-3.5 h-3.5" />}
                  {ticket.status === 'in_progress' && <Clock className="w-3.5 h-3.5" />}
                  {ticket.status === 'open' && <AlertTriangle className="w-3.5 h-3.5" />}
                  {ticket.status.replace('_', ' ').toUpperCase()}
                </span>

                {ticket.status !== 'resolved' ? (
                  <button
                    onClick={() => handleResolveTicket(ticket.id)}
                    className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 shadow-xs transition-colors cursor-pointer"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    <span>Resolve</span>
                  </button>
                ) : (
                  <span className="text-xs text-slate-400 font-medium italic">
                    Closed {ticket.resolvedAt}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* New Ticket Modal */}
      {isNewModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-lg w-full p-5 max-h-[90vh] overflow-y-auto">
            <h3 className="text-base font-bold text-slate-900">Open Technical Support Ticket</h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Log fiber cut, red ONT optical alarm, or TV cable signal issue for field technician.
            </p>

            <form onSubmit={handleCreateTicket} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Subscriber Name</label>
                <input
                  type="text"
                  value={newClientName}
                  onChange={e => setNewClientName(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Mobile / Phone</label>
                  <input
                    type="text"
                    value={newPhone}
                    onChange={e => setNewPhone(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Sector / Area</label>
                  <input
                    type="text"
                    value={newArea}
                    onChange={e => setNewArea(e.target.value)}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                    required
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Complaint Type</label>
                  <select
                    value={newCategory}
                    onChange={e => setNewCategory(e.target.value as ComplaintTicket['category'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="red_los">Red LOS / Optical Power Loss</option>
                    <option value="fiber_cut">Broken Drop Cable / Pole Cut</option>
                    <option value="slow_speed">Slow Speed / High Latency</option>
                    <option value="tv_nosignal">Cable TV No Signal / Noise</option>
                    <option value="billing">Billing & Voucher Inquiry</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-700 mb-1">Priority</label>
                  <select
                    value={newPriority}
                    onChange={e => setNewPriority(e.target.value as ComplaintTicket['priority'])}
                    className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  >
                    <option value="urgent">Urgent (Complete Outage)</option>
                    <option value="high">High (Frequent Disconnections)</option>
                    <option value="medium">Medium (Speed/Jitter Issue)</option>
                    <option value="low">Low (Query / General)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Issue Headline</label>
                <input
                  type="text"
                  placeholder="e.g. Red PON alarm, fiber cut on street pole 14"
                  value={newTitle}
                  onChange={e => setNewTitle(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Description / Lineman Instructions</label>
                <textarea
                  rows={3}
                  placeholder="Customer remarks, optical power meter readings, OTDR markers..."
                  value={newDesc}
                  onChange={e => setNewDesc(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">Assign Field Lineman / Technician</label>
                <select
                  value={newStaff}
                  onChange={e => setNewStaff(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-1 focus:ring-indigo-500 focus:outline-none"
                >
                  <option value="Tariq Ahmed">Tariq Ahmed (Senior Fiber Splicer)</option>
                  <option value="Kamran Lineman">Kamran Lineman (Field Tech)</option>
                  <option value="Ali Raza">Ali Raza (NOC / MikroTik Tech)</option>
                </select>
              </div>

              <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setIsNewModalOpen(false)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Dispatch Support Ticket
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
