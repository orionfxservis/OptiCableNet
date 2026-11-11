import React, { useState } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ShieldAlert,
  UserCheck,
  MapPin,
  Phone,
  Calendar,
  CheckCircle2,
  Clock,
  AlertTriangle,
  PlusCircle,
  Banknote,
  Search,
  Filter,
  Share2,
  FileText,
} from 'lucide-react';

interface RecoveryTask {
  id: string;
  clientId: string;
  clientName: string;
  phone: string;
  address: string;
  area: string;
  amountDue: number;
  assignedStaff: string;
  status: 'pending' | 'promised' | 'collected' | 'disconnected';
  promiseDate?: string;
  lastVisitNotes?: string;
}

export const RecoveryView: React.FC<{ onOpenQuickPayment?: (clientId?: string) => void }> = ({
  onOpenQuickPayment,
}) => {
  const { clients, staff, recordClientPayment } = useApp();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [selectedStaff, setSelectedStaff] = useState<string>('all');
  const [collectModalClient, setCollectModalClient] = useState<RecoveryTask | null>(null);
  const [collectAmount, setCollectAmount] = useState<number>(0);
  const [collectCollector, setCollectCollector] = useState<string>('Tariq Ahmed');

  // Seed recovery tasks from defaulters
  const defaulterClients = clients.filter(c => c.balanceDue > 0);

  const [tasks, setTasks] = useState<RecoveryTask[]>([
    {
      id: 'rec-1',
      clientId: 'cli-002',
      clientName: 'Farhan Zaidi',
      phone: '0301-9876543',
      address: 'House 42, St 7, Sector F-8/2',
      area: 'Sector F-8',
      amountDue: 2400,
      assignedStaff: 'Tariq Ahmed',
      status: 'promised',
      promiseDate: '2026-11-15',
      lastVisitNotes: 'Met customer at doorstep. Promised cash clearance on Saturday salary day.',
    },
    {
      id: 'rec-2',
      clientId: 'cli-005',
      clientName: 'Saima Khan',
      phone: '0345-2233445',
      address: 'Flat 3-B, Madina Heights, Commercial Area',
      area: 'Sector G-9',
      amountDue: 4500,
      assignedStaff: 'Bilal Hussain',
      status: 'pending',
      lastVisitNotes: 'Gate was locked. Left recovery reminder slip under door.',
    },
    {
      id: 'rec-3',
      clientId: 'cli-007',
      clientName: 'Muhammad Arshad',
      phone: '0321-7788990',
      address: 'Plot 18, Block C, Blue Area Market',
      area: 'Blue Area',
      amountDue: 3200,
      assignedStaff: 'Hamza Malik',
      status: 'pending',
      lastVisitNotes: 'First notice sent. Scheduled for morning doorstep visit.',
    },
  ]);

  const totalOutstanding = tasks.reduce((sum, t) => sum + t.amountDue, 0);
  const collectedToday = tasks
    .filter(t => t.status === 'collected')
    .reduce((sum, t) => sum + t.amountDue, 0);

  const filteredTasks = tasks.filter(t => {
    if (statusFilter !== 'all' && t.status !== statusFilter) return false;
    if (selectedStaff !== 'all' && t.assignedStaff !== selectedStaff) return false;
    const q = search.toLowerCase();
    return (
      t.clientName.toLowerCase().includes(q) ||
      t.phone.includes(q) ||
      t.address.toLowerCase().includes(q) ||
      t.area.toLowerCase().includes(q)
    );
  });

  const handleOpenDoorstepCollect = (task: RecoveryTask) => {
    setCollectModalClient(task);
    setCollectAmount(task.amountDue);
  };

  const handleConfirmDoorstepPayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!collectModalClient) return;

    recordClientPayment({
      clientId: collectModalClient.clientId,
      amount: collectAmount,
      extensionMonths: 1,
      paymentMethod: 'cash_at_doorstep',
      collectorName: `${collectCollector} (Field Recovery)`,
      notes: `Doorstep cash collection via recovery squad. Task ID: ${collectModalClient.id}`,
    });

    setTasks(prev =>
      prev.map(t =>
        t.id === collectModalClient.id
          ? {
              ...t,
              status: 'collected',
              amountDue: Math.max(0, t.amountDue - collectAmount),
              lastVisitNotes: `Collected Rs. ${collectAmount.toLocaleString()} in cash at doorstep by ${collectCollector}.`,
            }
          : t
      )
    );

    setCollectModalClient(null);
  };

  const recoveryRiders = [
    { name: 'Tariq Ahmed', area: 'Sector F-8 & E-7', activeTasks: 5, collectedToday: 7200 },
    { name: 'Bilal Hussain', area: 'Sector G-9 & G-10', activeTasks: 8, collectedToday: 5400 },
    { name: 'Hamza Malik', area: 'Blue Area & Commercial', activeTasks: 4, collectedToday: 9800 },
  ];

  return (
    <div className="space-y-6 pb-12">
      {/* Top Banner */}
      <div className="bg-white border border-slate-200 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="p-2 rounded-lg bg-rose-50 text-rose-700">
                <ShieldAlert className="w-5 h-5" />
              </span>
              <h1 className="text-xl font-bold text-slate-900 tracking-tight">Recovery & Field Collections</h1>
            </div>
            <p className="text-sm text-slate-500 mt-1">
              Field recovery staff assignments, doorstep collections, and defaulter recovery ledger.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                if (defaulterClients.length > 0 && onOpenQuickPayment) {
                  onOpenQuickPayment(defaulterClients[0].id);
                }
              }}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold flex items-center gap-2 shadow-xs transition-colors cursor-pointer"
            >
              <Banknote className="w-4 h-4" />
              <span>Record Doorstep Payment</span>
            </button>
          </div>
        </div>

        {/* Quick KPI stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-5 pt-5 border-t border-slate-100">
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Total Active Defaulters</span>
            <span className="text-lg font-bold text-slate-900">{defaulterClients.length} subscribers</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Outstanding in Field</span>
            <span className="text-lg font-bold text-rose-600">Rs. {totalOutstanding.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Recovered Today (Cash)</span>
            <span className="text-lg font-bold text-emerald-600">Rs. {collectedToday.toLocaleString()}</span>
          </div>
          <div className="bg-slate-50 border border-slate-200/80 rounded-lg p-3">
            <span className="text-xs font-medium text-slate-500 block">Field Riders On Duty</span>
            <span className="text-lg font-bold text-slate-900">3 Squads</span>
          </div>
        </div>
      </div>

      {/* Field Staff Squad Cards */}
      <div>
        <h2 className="text-sm font-bold text-slate-800 uppercase tracking-wider mb-3">
          Assigned Recovery Staff & Daily Performance
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {recoveryRiders.map(rider => (
            <div key={rider.name} className="bg-white border border-slate-200 rounded-xl p-4 shadow-xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 rounded-full bg-sky-100 text-sky-700 font-bold flex items-center justify-center text-xs">
                    {rider.name.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-slate-900">{rider.name}</h3>
                    <p className="text-xs text-slate-500 flex items-center gap-1">
                      <MapPin className="w-3 h-3 text-slate-400" />
                      {rider.area}
                    </p>
                  </div>
                </div>
                <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                  Active
                </span>
              </div>
              <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-100 text-xs">
                <div>
                  <span className="text-slate-400 block text-[11px]">Tasks Today</span>
                  <span className="font-semibold text-slate-700">{rider.activeTasks} visits</span>
                </div>
                <div>
                  <span className="text-slate-400 block text-[11px]">Cash Realized</span>
                  <span className="font-bold text-emerald-600">Rs. {rider.collectedToday.toLocaleString()}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recovery Tasks List */}
      <div className="bg-white border border-slate-200 rounded-xl shadow-xs overflow-hidden">
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 bg-slate-50/50">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-slate-900">Doorstep Recovery Queue</h2>
            <span className="px-2 py-0.5 bg-slate-200 text-slate-700 rounded-full text-xs font-semibold">
              {filteredTasks.length}
            </span>
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <div className="relative">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search defaulter or phone..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="pl-8 pr-3 py-1.5 text-xs bg-white border border-slate-300 rounded-lg focus:outline-none focus:ring-1 focus:ring-sky-500"
              />
            </div>

            <select
              value={statusFilter}
              onChange={e => setStatusFilter(e.target.value)}
              className="text-xs bg-white border border-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:ring-1 focus:ring-sky-500 text-slate-700"
            >
              <option value="all">All Statuses</option>
              <option value="pending">Pending Visit</option>
              <option value="promised">Promise to Pay (PTP)</option>
              <option value="collected">Collected</option>
              <option value="disconnected">Disconnected</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-slate-50 text-slate-600 font-semibold border-b border-slate-200 uppercase tracking-wider text-[11px]">
              <tr>
                <th className="px-4 py-3">Subscriber & Address</th>
                <th className="px-4 py-3">Due Amount</th>
                <th className="px-4 py-3">Assigned Lineman</th>
                <th className="px-4 py-3">Visit Notes & PTP</th>
                <th className="px-4 py-3">Status</th>
                <th className="px-4 py-3 text-right">Doorstep Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredTasks.map(task => (
                <tr key={task.id} className="hover:bg-slate-50/70 transition-colors">
                  <td className="px-4 py-3">
                    <div className="font-semibold text-slate-900">{task.clientName}</div>
                    <div className="text-slate-500 flex items-center gap-1 mt-0.5">
                      <Phone className="w-3 h-3 text-slate-400" />
                      {task.phone}
                    </div>
                    <div className="text-slate-400 text-[11px] truncate max-w-xs mt-0.5">
                      {task.address}
                    </div>
                  </td>
                  <td className="px-4 py-3">
                    <span className="font-bold text-rose-600">
                      Rs. {task.amountDue.toLocaleString()}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <div className="font-medium text-slate-800">{task.assignedStaff}</div>
                    <span className="text-[10px] text-slate-400">{task.area}</span>
                  </td>
                  <td className="px-4 py-3 max-w-xs">
                    {task.promiseDate && (
                      <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded border border-amber-200 mb-1">
                        <Calendar className="w-3 h-3" /> PTP: {task.promiseDate}
                      </span>
                    )}
                    <p className="text-[11px] text-slate-600 line-clamp-2">
                      {task.lastVisitNotes || 'No visit logged yet.'}
                    </p>
                  </td>
                  <td className="px-4 py-3">
                    <span
                      className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        task.status === 'collected'
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                          : task.status === 'promised'
                          ? 'bg-amber-50 text-amber-700 border border-amber-200'
                          : task.status === 'disconnected'
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-slate-100 text-slate-700 border border-slate-200'
                      }`}
                    >
                      {task.status === 'collected' && <CheckCircle2 className="w-3 h-3" />}
                      {task.status === 'promised' && <Clock className="w-3 h-3" />}
                      {task.status === 'pending' && <AlertTriangle className="w-3 h-3" />}
                      {task.status.toUpperCase()}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-right">
                    {task.status !== 'collected' ? (
                      <button
                        onClick={() => handleOpenDoorstepCollect(task)}
                        className="px-2.5 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded text-xs font-semibold inline-flex items-center gap-1 shadow-xs transition-colors cursor-pointer"
                      >
                        <Banknote className="w-3.5 h-3.5" />
                        <span>Collect Cash</span>
                      </button>
                    ) : (
                      <span className="text-emerald-700 font-semibold text-xs inline-flex items-center gap-1">
                        <CheckCircle2 className="w-3.5 h-3.5" /> Settled
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Collect Modal */}
      {collectModalClient && (
        <div className="fixed inset-0 z-50 bg-slate-900/40 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-xl border border-slate-200 max-w-md w-full p-5">
            <h3 className="text-base font-bold text-slate-900">
              Collect Cash at Doorstep
            </h3>
            <p className="text-xs text-slate-500 mt-0.5">
              Subscriber: <strong className="text-slate-800">{collectModalClient.clientName}</strong> ({collectModalClient.phone})
            </p>

            <form onSubmit={handleConfirmDoorstepPayment} className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Cash Amount Collected (Pak Rs.)
                </label>
                <input
                  type="number"
                  min="1"
                  value={collectAmount}
                  onChange={e => setCollectAmount(Number(e.target.value))}
                  className="w-full px-3 py-2 text-sm border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-medium text-slate-700 mb-1">
                  Collecting Recovery Agent
                </label>
                <select
                  value={collectCollector}
                  onChange={e => setCollectCollector(e.target.value)}
                  className="w-full px-3 py-2 text-xs border border-slate-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:outline-none"
                >
                  <option value="Tariq Ahmed">Tariq Ahmed (Lineman/Recovery)</option>
                  <option value="Bilal Hussain">Bilal Hussain (Recovery Squad)</option>
                  <option value="Hamza Malik">Hamza Malik (Commercial Recovery)</option>
                </select>
              </div>

              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800">
                Payment mode will be recorded as <strong>Cash at Doorstep</strong> and client ledger balance will be automatically cleared in Pak Rs.
              </div>

              <div className="flex items-center justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setCollectModalClient(null)}
                  className="px-3 py-1.5 text-xs text-slate-600 hover:text-slate-800 font-medium cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
                >
                  Confirm Doorstep Cash Receipt
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
