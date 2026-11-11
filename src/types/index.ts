export type ConnectionType = 'FTTH_Fiber' | 'Coaxial_Cable' | 'Hybrid_HFC' | 'Wireless_PtP';

export type ClientStatus = 'active' | 'expiring_soon' | 'expired' | 'suspended';

export interface Client {
  id: string;
  name: string;
  phone: string;
  email?: string;
  address: string;
  zone: string;
  connectionType: ConnectionType;
  ipAddress: string;
  macAddress: string;
  onuSerial: string;
  connectedNodeId: string; // FDB / Splitter ID
  packageName: string;
  bandwidthMbps: number;
  monthlyFee: number;
  balanceDue: number;
  joiningDate: string;
  packageExpiryDate: string; // YYYY-MM-DD
  status: ClientStatus;
  lastPaymentDate?: string;
  notes?: string;
}

export type DeviceType = 'OLT' | 'Router' | 'FDH' | 'Splitter' | 'FDB' | 'EDFA' | 'ONU_CPE';
export type DeviceStatus = 'online' | 'degraded' | 'offline' | 'maintenance';

export interface NetworkNode {
  id: string;
  name: string;
  type: DeviceType;
  zone: string;
  location: string;
  latitude: number;
  longitude: number;
  status: DeviceStatus;
  ipAddress?: string;
  rxPowerDbm?: number; // Optical RX Power, nominal -18 to -24 dBm
  txPowerDbm?: number;
  attenuationDb?: number; // Signal loss in dB
  latencyMs: number;
  packetLossPercent: number;
  activeClientsCount: number;
  totalCapacity: number;
  parentId?: string; // upstream node ID
  firmwareVersion?: string;
  lastPingTime: string;
}

export interface CableRun {
  id: string;
  name: string;
  sourceNodeId: string;
  targetNodeId: string;
  cableType: 'Fiber_24Core' | 'Fiber_12Core' | 'Fiber_4Core' | 'Drop_2Core' | 'Coaxial_RG6' | 'Cat6_UTP';
  lengthMeters: number;
  totalCores: number;
  activeCores: number;
  damagedCores: number;
  attenuationDbPerKm: number;
  totalLossDb: number;
  routeDescription: string;
  status: 'nominal' | 'high_loss' | 'cut' | 'scheduled_splicing';
  installationDate: string;
}

export type InventoryCategory = 'cables' | 'active_devices' | 'passive_components' | 'tools_splicing' | 'power_ups';

export interface InventoryItem {
  id: string;
  sku: string;
  name: string;
  category: InventoryCategory;
  unit: 'meters' | 'pcs' | 'reels' | 'kits';
  quantityInStock: number;
  minimumThreshold: number;
  unitCost: number;
  location: string;
  condition: 'new' | 'deployed' | 'refurbished' | 'damaged';
  lastAuditDate: string;
  notes?: string;
}

export interface InventoryTransaction {
  id: string;
  itemId: string;
  itemName: string;
  type: 'stock_in' | 'stock_out' | 'audit_adjustment';
  quantity: number;
  technicianName?: string;
  purpose: string;
  date: string;
}

export type AlertSeverity = 'critical' | 'warning' | 'info';

export interface NetworkAlert {
  id: string;
  timestamp: string;
  severity: AlertSeverity;
  title: string;
  description: string;
  nodeId?: string;
  cableRunId?: string;
  acknowledged: boolean;
  resolved: boolean;
  assignedStaffId?: string;
}

export interface MaintenanceSchedule {
  id: string;
  title: string;
  description: string;
  nodeId?: string;
  cableRunId?: string;
  zone: string;
  scheduledDate: string;
  estimatedDurationHours: number;
  affectedClientsCount: number;
  assignedTechnician: string;
  priority: 'high' | 'medium' | 'low';
  status: 'scheduled' | 'in_progress' | 'completed' | 'cancelled';
  notes?: string;
}

export interface StaffMember {
  id: string;
  name: string;
  role: 'Lineman' | 'Fiber Splicer' | 'NOC Engineer' | 'Billing Agent' | 'Field Supervisor';
  phone: string;
  email: string;
  assignedZone: string;
  monthlySalary: number;
  status: 'on_field' | 'standby' | 'on_leave';
  activeTasksCount: number;
  joiningDate: string;
}

export type ExpenseCategory = 'pole_rental' | 'bandwidth_transit' | 'electricity_generator' | 'splicing_materials' | 'fuel_transport' | 'office_supplies' | 'equipment_maintenance' | 'miscellaneous';

export interface ExpenseItem {
  id: string;
  date: string;
  category: ExpenseCategory;
  title: string;
  amount: number;
  paidTo: string;
  paymentMethod: 'Cash' | 'Bank_Transfer' | 'Card' | 'Online';
  receiptRef?: string;
  notes?: string;
}

export interface PaymentRecord {
  id: string;
  clientId: string;
  clientName: string;
  amount: number;
  date: string;
  packageExtendedMonths: number;
  paymentMethod:
    | 'Cash'
    | 'Bank_Transfer'
    | 'Easypaisa'
    | 'JazzCash'
    | 'Cash at Doorstep'
    | 'Bank Wire / Transfer'
    | 'Online_Card'
    | 'Mobile_Wallet'
    | string;
  receiptNumber: string;
  collectorName: string;
  notes?: string;
}
