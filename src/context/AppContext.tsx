import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  Client,
  NetworkNode,
  CableRun,
  InventoryItem,
  InventoryTransaction,
  NetworkAlert,
  MaintenanceSchedule,
  StaffMember,
  ExpenseItem,
  PaymentRecord,
} from '../types';
import {
  INITIAL_NODES,
  INITIAL_CABLE_RUNS,
  INITIAL_CLIENTS,
  INITIAL_INVENTORY,
  INITIAL_TRANSACTIONS,
  INITIAL_ALERTS,
  INITIAL_MAINTENANCE,
  INITIAL_STAFF,
  INITIAL_EXPENSES,
  INITIAL_PAYMENTS,
} from '../data/mockData';
import { alertAudio } from '../utils/audioChime';

interface AppContextType {
  // Navigation
  activeTab: string;
  setActiveTab: (tab: string) => void;
  isMobileFieldMode: boolean;
  setIsMobileFieldMode: (val: boolean) => void;

  // Sound
  soundEnabled: boolean;
  setSoundEnabled: (val: boolean) => void;

  // Data
  nodes: NetworkNode[];
  cableRuns: CableRun[];
  clients: Client[];
  inventory: InventoryItem[];
  transactions: InventoryTransaction[];
  alerts: NetworkAlert[];
  maintenance: MaintenanceSchedule[];
  staff: StaffMember[];
  expenses: ExpenseItem[];
  payments: PaymentRecord[];

  // Real-time telemetry simulation
  isSimulating: boolean;
  setIsSimulating: (val: boolean) => void;
  simulateFiberCut: (cableId: string) => void;
  restoreFiberCut: (cableId: string) => void;
  simulateLatencySpike: (nodeId: string) => void;

  // Client operations
  addClient: (client: Omit<Client, 'id'>) => void;
  updateClient: (id: string, updates: Partial<Client>) => void;
  deleteClient: (id: string) => void;
  recordClientPayment: (data: {
    clientId: string;
    amount: number;
    extensionMonths: number;
    paymentMethod: PaymentRecord['paymentMethod'];
    collectorName: string;
    notes?: string;
  }) => PaymentRecord;

  // Inventory operations
  addInventoryItem: (item: Omit<InventoryItem, 'id'>) => void;
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>) => void;
  transactInventory: (data: {
    itemId: string;
    type: 'stock_in' | 'stock_out' | 'audit_adjustment';
    quantity: number;
    technicianName?: string;
    purpose: string;
  }) => void;

  // Maintenance operations
  addMaintenance: (item: Omit<MaintenanceSchedule, 'id'>) => void;
  updateMaintenanceStatus: (id: string, status: MaintenanceSchedule['status']) => void;

  // Alerts operations
  acknowledgeAlert: (id: string) => void;
  resolveAlert: (id: string) => void;
  createAlert: (alert: Omit<NetworkAlert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>) => void;

  // Staff operations
  addStaff: (member: Omit<StaffMember, 'id'>) => void;
  updateStaff: (id: string, updates: Partial<StaffMember>) => void;

  // Expenses operations
  addExpense: (expense: Omit<ExpenseItem, 'id'>) => void;
  deleteExpense: (id: string) => void;

  // Reset demo data
  resetDemoData: () => void;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

const STORAGE_KEY_PREFIX = 'opticable_erp_v2_';

function loadFromStorage<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_PREFIX + key);
    if (raw) return JSON.parse(raw);
  } catch (e) {
    console.error('Failed reading localStorage', e);
  }
  return fallback;
}

function saveToStorage<T>(key: string, value: T) {
  try {
    localStorage.setItem(STORAGE_KEY_PREFIX + key, JSON.stringify(value));
  } catch (e) {
    console.error('Failed saving localStorage', e);
  }
}

export const AppProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [activeTab, setActiveTab] = useState<string>('overview');
  const [isMobileFieldMode, setIsMobileFieldMode] = useState<boolean>(false);
  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);

  // Core Data States
  const [nodes, setNodes] = useState<NetworkNode[]>(() => loadFromStorage('nodes', INITIAL_NODES));
  const [cableRuns, setCableRuns] = useState<CableRun[]>(() => loadFromStorage('cable_runs', INITIAL_CABLE_RUNS));
  const [clients, setClients] = useState<Client[]>(() => loadFromStorage('clients', INITIAL_CLIENTS));
  const [inventory, setInventory] = useState<InventoryItem[]>(() => loadFromStorage('inventory', INITIAL_INVENTORY));
  const [transactions, setTransactions] = useState<InventoryTransaction[]>(() => loadFromStorage('transactions', INITIAL_TRANSACTIONS));
  const [alerts, setAlerts] = useState<NetworkAlert[]>(() => loadFromStorage('alerts', INITIAL_ALERTS));
  const [maintenance, setMaintenance] = useState<MaintenanceSchedule[]>(() => loadFromStorage('maintenance', INITIAL_MAINTENANCE));
  const [staff, setStaff] = useState<StaffMember[]>(() => loadFromStorage('staff', INITIAL_STAFF));
  const [expenses, setExpenses] = useState<ExpenseItem[]>(() => loadFromStorage('expenses', INITIAL_EXPENSES));
  const [payments, setPayments] = useState<PaymentRecord[]>(() => loadFromStorage('payments', INITIAL_PAYMENTS));

  // Sync state to storage
  useEffect(() => saveToStorage('nodes', nodes), [nodes]);
  useEffect(() => saveToStorage('cable_runs', cableRuns), [cableRuns]);
  useEffect(() => saveToStorage('clients', clients), [clients]);
  useEffect(() => saveToStorage('inventory', inventory), [inventory]);
  useEffect(() => saveToStorage('transactions', transactions), [transactions]);
  useEffect(() => saveToStorage('alerts', alerts), [alerts]);
  useEffect(() => saveToStorage('maintenance', maintenance), [maintenance]);
  useEffect(() => saveToStorage('staff', staff), [staff]);
  useEffect(() => saveToStorage('expenses', expenses), [expenses]);
  useEffect(() => saveToStorage('payments', payments), [payments]);

  const setSoundEnabled = (val: boolean) => {
    setSoundEnabledState(val);
    alertAudio.setSoundEnabled(val);
  };

  // Client operations
  const addClient = useCallback((clientData: Omit<Client, 'id'>) => {
    const newClient: Client = {
      ...clientData,
      id: `cli-${Date.now().toString().slice(-5)}`,
    };
    setClients(prev => [newClient, ...prev]);
    alertAudio.playSuccessChime();
  }, []);

  const updateClient = useCallback((id: string, updates: Partial<Client>) => {
    setClients(prev => prev.map(c => c.id === id ? { ...c, ...updates } : c));
  }, []);

  const deleteClient = useCallback((id: string) => {
    setClients(prev => prev.filter(c => c.id !== id));
  }, []);

  const recordClientPayment = useCallback((data: {
    clientId: string;
    amount: number;
    extensionMonths: number;
    paymentMethod: PaymentRecord['paymentMethod'];
    collectorName: string;
    notes?: string;
  }): PaymentRecord => {
    const client = clients.find(c => c.id === data.clientId);
    const clientName = client ? client.name : 'Unknown Client';

    const newPayment: PaymentRecord = {
      id: `pay-${Date.now().toString().slice(-6)}`,
      clientId: data.clientId,
      clientName,
      amount: data.amount,
      date: new Date().toISOString().split('T')[0],
      packageExtendedMonths: data.extensionMonths,
      paymentMethod: data.paymentMethod,
      receiptNumber: `REC-${new Date().getFullYear()}-${Math.floor(1000 + Math.random() * 9000)}`,
      collectorName: data.collectorName || 'Billing Desk',
      notes: data.notes,
    };

    setPayments(prev => [newPayment, ...prev]);

    // Update client balance and expiry date
    setClients(prev => prev.map(c => {
      if (c.id !== data.clientId) return c;

      // Calculate new expiry date
      const currentExpiry = new Date(c.packageExpiryDate);
      const baseDate = isNaN(currentExpiry.getTime()) || currentExpiry < new Date() ? new Date() : currentExpiry;
      const newExpiry = new Date(baseDate);
      newExpiry.setMonth(newExpiry.getMonth() + (data.extensionMonths || 1));
      const formattedExpiry = newExpiry.toISOString().split('T')[0];

      const newBalance = Math.max(0, c.balanceDue - data.amount);

      return {
        ...c,
        balanceDue: newBalance,
        packageExpiryDate: formattedExpiry,
        status: 'active',
        lastPaymentDate: newPayment.date,
      };
    }));

    alertAudio.playSuccessChime();
    return newPayment;
  }, [clients]);

  // Inventory operations
  const addInventoryItem = useCallback((itemData: Omit<InventoryItem, 'id'>) => {
    const newItem: InventoryItem = {
      ...itemData,
      id: `inv-${Date.now().toString().slice(-5)}`,
    };
    setInventory(prev => [newItem, ...prev]);
    alertAudio.playSuccessChime();
  }, []);

  const updateInventoryItem = useCallback((id: string, updates: Partial<InventoryItem>) => {
    setInventory(prev => prev.map(item => item.id === id ? { ...item, ...updates } : item));
  }, []);

  const transactInventory = useCallback((data: {
    itemId: string;
    type: 'stock_in' | 'stock_out' | 'audit_adjustment';
    quantity: number;
    technicianName?: string;
    purpose: string;
  }) => {
    const item = inventory.find(i => i.id === data.itemId);
    if (!item) return;

    const newTx: InventoryTransaction = {
      id: `tx-${Date.now().toString().slice(-6)}`,
      itemId: data.itemId,
      itemName: item.name,
      type: data.type,
      quantity: data.quantity,
      technicianName: data.technicianName,
      purpose: data.purpose,
      date: new Date().toISOString().replace('T', ' ').slice(0, 16),
    };

    setTransactions(prev => [newTx, ...prev]);

    setInventory(prev => prev.map(i => {
      if (i.id !== data.itemId) return i;
      let newQty = i.quantityInStock;
      if (data.type === 'stock_in') newQty += data.quantity;
      else if (data.type === 'stock_out') newQty = Math.max(0, newQty - data.quantity);
      else if (data.type === 'audit_adjustment') newQty = data.quantity;
      return { ...i, quantityInStock: newQty, lastAuditDate: new Date().toISOString().split('T')[0] };
    }));

    alertAudio.playSuccessChime();
  }, [inventory]);

  // Maintenance operations
  const addMaintenance = useCallback((item: Omit<MaintenanceSchedule, 'id'>) => {
    const newMaint: MaintenanceSchedule = {
      ...item,
      id: `maint-${Date.now().toString().slice(-5)}`,
    };
    setMaintenance(prev => [newMaint, ...prev]);
    alertAudio.playSuccessChime();
  }, []);

  const updateMaintenanceStatus = useCallback((id: string, status: MaintenanceSchedule['status']) => {
    setMaintenance(prev => prev.map(m => m.id === id ? { ...m, status } : m));
  }, []);

  // Alert operations
  const acknowledgeAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, acknowledged: true } : a));
  }, []);

  const resolveAlert = useCallback((id: string) => {
    setAlerts(prev => prev.map(a => a.id === id ? { ...a, resolved: true, acknowledged: true } : a));
  }, []);

  const createAlert = useCallback((data: Omit<NetworkAlert, 'id' | 'timestamp' | 'acknowledged' | 'resolved'>) => {
    const newAlert: NetworkAlert = {
      ...data,
      id: `alt-${Date.now().toString().slice(-5)}`,
      timestamp: 'Just now',
      acknowledged: false,
      resolved: false,
    };
    setAlerts(prev => [newAlert, ...prev]);
    if (data.severity === 'critical') {
      alertAudio.playCriticalChime();
    }
  }, []);

  // Staff operations
  const addStaff = useCallback((member: Omit<StaffMember, 'id'>) => {
    const newMember: StaffMember = {
      ...member,
      id: `stf-${Date.now().toString().slice(-4)}`,
    };
    setStaff(prev => [...prev, newMember]);
    alertAudio.playSuccessChime();
  }, []);

  const updateStaff = useCallback((id: string, updates: Partial<StaffMember>) => {
    setStaff(prev => prev.map(s => s.id === id ? { ...s, ...updates } : s));
  }, []);

  // Expenses operations
  const addExpense = useCallback((expense: Omit<ExpenseItem, 'id'>) => {
    const newExp: ExpenseItem = {
      ...expense,
      id: `exp-${Date.now().toString().slice(-5)}`,
    };
    setExpenses(prev => [newExp, ...prev]);
    alertAudio.playSuccessChime();
  }, []);

  const deleteExpense = useCallback((id: string) => {
    setExpenses(prev => prev.filter(e => e.id !== id));
  }, []);

  // Network Simulation: Fiber Cut Test & Latency Spike Test
  const simulateFiberCut = useCallback((cableId: string) => {
    setCableRuns(prev => prev.map(c => {
      if (c.id === cableId) {
        return { ...c, status: 'cut', damagedCores: c.totalCores };
      }
      return c;
    }));

    const cutCable = cableRuns.find(c => c.id === cableId);
    const affectedNodeId = cutCable?.targetNodeId;

    if (affectedNodeId) {
      setNodes(prev => prev.map(n => {
        if (n.id === affectedNodeId) {
          return { ...n, status: 'offline', rxPowerDbm: -39.9, packetLossPercent: 100, latencyMs: 0 };
        }
        return n;
      }));
    }

    createAlert({
      severity: 'critical',
      title: `CRITICAL FIBER CUT: ${cutCable?.name || 'Trunk Cable'}`,
      description: `Complete Loss of Signal (LOS). OTDR event detected at distance marker. Immediate lineman dispatch needed.`,
      cableRunId: cableId,
      nodeId: affectedNodeId,
    });
  }, [cableRuns, createAlert]);

  const restoreFiberCut = useCallback((cableId: string) => {
    setCableRuns(prev => prev.map(c => {
      if (c.id === cableId) {
        return { ...c, status: 'nominal', damagedCores: 0 };
      }
      return c;
    }));

    const cable = cableRuns.find(c => c.id === cableId);
    const affectedNodeId = cable?.targetNodeId;

    if (affectedNodeId) {
      setNodes(prev => prev.map(n => {
        if (n.id === affectedNodeId) {
          return { ...n, status: 'online', rxPowerDbm: -20.5, packetLossPercent: 0, latencyMs: 5.2 };
        }
        return n;
      }));
    }

    createAlert({
      severity: 'info',
      title: `Fiber Link Restored: ${cable?.name || 'Trunk Cable'}`,
      description: `Splice complete. Attenuation nominal at 0.22 dB/km. Service restored.`,
      cableRunId: cableId,
      nodeId: affectedNodeId,
    });
  }, [cableRuns, createAlert]);

  const simulateLatencySpike = useCallback((nodeId: string) => {
    const node = nodes.find(n => n.id === nodeId);
    const spikeLatency = Math.floor(95 + Math.random() * 45);

    setNodes(prev => prev.map(n => {
      if (n.id === nodeId) {
        return { ...n, latencyMs: spikeLatency, status: 'degraded' };
      }
      return n;
    }));

    createAlert({
      severity: 'warning',
      title: `Latency Spike (${spikeLatency}ms) on ${node?.name || 'Optical Node'}`,
      description: `Transit buffer congestion or laser dispersion observed on uplink. Monitored for auto-clearing.`,
      nodeId,
    });
  }, [nodes, createAlert]);

  // Background mild telemetry fluctuation simulation
  useEffect(() => {
    if (!isSimulating) return;

    const interval = setInterval(() => {
      setNodes(prev => prev.map(node => {
        if (node.status === 'offline') return node;
        // Minor natural optical and ping fluctuation
        const deltaLatency = (Math.random() - 0.48) * 0.4;
        const newLatency = Math.max(1.2, +(node.latencyMs + deltaLatency).toFixed(1));
        const deltaRx = (Math.random() - 0.5) * 0.1;
        const newRx = node.rxPowerDbm !== undefined ? +(node.rxPowerDbm + deltaRx).toFixed(2) : undefined;
        return {
          ...node,
          latencyMs: newLatency,
          rxPowerDbm: newRx,
          lastPingTime: 'Just now',
        };
      }));
    }, 6000);

    return () => clearInterval(interval);
  }, [isSimulating]);

  const resetDemoData = () => {
    setNodes(INITIAL_NODES);
    setCableRuns(INITIAL_CABLE_RUNS);
    setClients(INITIAL_CLIENTS);
    setInventory(INITIAL_INVENTORY);
    setTransactions(INITIAL_TRANSACTIONS);
    setAlerts(INITIAL_ALERTS);
    setMaintenance(INITIAL_MAINTENANCE);
    setStaff(INITIAL_STAFF);
    setExpenses(INITIAL_EXPENSES);
    setPayments(INITIAL_PAYMENTS);
    alertAudio.playSuccessChime();
  };

  return (
    <AppContext.Provider
      value={{
        activeTab,
        setActiveTab,
        isMobileFieldMode,
        setIsMobileFieldMode,
        soundEnabled,
        setSoundEnabled,
        nodes,
        cableRuns,
        clients,
        inventory,
        transactions,
        alerts,
        maintenance,
        staff,
        expenses,
        payments,
        isSimulating,
        setIsSimulating,
        simulateFiberCut,
        restoreFiberCut,
        simulateLatencySpike,
        addClient,
        updateClient,
        deleteClient,
        recordClientPayment,
        addInventoryItem,
        updateInventoryItem,
        transactInventory,
        addMaintenance,
        updateMaintenanceStatus,
        acknowledgeAlert,
        resolveAlert,
        createAlert,
        addStaff,
        updateStaff,
        addExpense,
        deleteExpense,
        resetDemoData,
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) throw new Error('useApp must be used within AppProvider');
  return context;
};
