// Customer types
export interface Customer {
  id: string;
  code?: number;
  name: string;
  companyName?: string;
  email?: string;
  phone?: string;
  document?: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  region?: string;
  category?: string;
  paymentTerms?: string;
  creditLimit?: number;
  active: boolean;
  salesRepId?: string;
  visitFrequency?: string;
  visitDays?: string[];
  deliveryRouteId?: string;
  visitSequence?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sales Rep types
export interface SalesRep {
  id: string;
  code: number;
  name: string;
  email?: string;
  phone?: string;
  active: boolean;
  authUserId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Order types
export interface Order {
  id: string;
  code: number;
  customerId?: string;
  customerName?: string;
  salesRepId?: string;
  salesRepName?: string;
  date: Date;
  dueDate?: Date;
  deliveryDate?: Date;
  total: number;
  discount?: number;
  status: 'pending' | 'confirmed' | 'delivered' | 'cancelled';
  paymentStatus?: 'pending' | 'paid' | 'overdue';
  paymentMethod?: string;
  paymentMethodId?: string;
  paymentTableId?: string;
  paymentTable?: string;
  payments?: any[];
  notes?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  mobileOrderId?: string;
  syncStatus?: 'synced' | 'pending' | 'error';
  sourceProject?: 'admin' | 'mobile';
  archived?: boolean;
  imported?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  id: string;
  orderId?: string;
  productName?: string;
  productCode?: number;
  quantity: number;
  unitPrice?: number;
  price: number;
  discount?: number;
  total: number;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Payment types
export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTable {
  id: string;
  name: string;
  description?: string;
  type?: string;
  payableeTo?: string;
  paymentLocation?: string;
  installments?: any[];
  terms?: any;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  orderId?: string;
  amount: number;
  paymentDate: Date;
  paymentMethod: string;
  customerName: string;
  status: 'completed' | 'pending' | 'failed';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Vehicle types
export interface Vehicle {
  id: string;
  name: string;
  type: string;
  brand?: string;
  model: string;
  year?: number;
  plateNumber: string;
  licensePlate: string;
  capacity?: number;
  driverName?: string;
  active: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Delivery Route types
export interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  salesRepId?: string;
  salesRepName?: string;
  vehicleId?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  date?: Date;
  status?: string;
  stops?: any[];
  active: boolean;
  lastUpdated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Load types
export interface Load {
  id: string;
  code: number;
  salesRepId?: string;
  vehicleId?: string;
  date: Date;
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled';
  totalValue?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadItem {
  id: string;
  loadId?: string;
  orderId?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sale types
export interface Sale {
  id: string;
  customerId?: string;
  date?: Date;
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface SaleItem {
  id: string;
  saleId?: string;
  quantity: number;
  price: number;
  createdAt: Date;
  updatedAt: Date;
}

// App Settings types
export interface AppSettings {
  id: string;
  companyName: string;
  primaryColor?: string;
  company?: {
    name: string;
    email: string;
    phone: string;
    address: string;
    document: string;
    footer: string;
  };
  companyLogo?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Sync types
export interface SyncToken {
  id: string;
  token: string;
  salesRepId?: string;
  deviceId?: string;
  deviceIp?: string;
  projectType: string;
  active: boolean;
  expiresAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncLog {
  id: string;
  salesRepId?: string;
  syncTokenId?: string;
  eventType: string;
  dataType?: string;
  recordsCount?: number;
  status: string;
  errorMessage?: string;
  deviceId?: string;
  deviceIp?: string;
  metadata?: any;
  createdAt: Date;
}

export interface SyncSettings {
  id: string;
  autoSyncEnabled: boolean;
  syncIntervalMinutes: number;
  maxOfflineDays: number;
  requireAdminApproval: boolean;
  allowedDataTypes: string[];
  createdAt: Date;
  updatedAt: Date;
}

export interface SyncUpdate {
  id: string;
  dataTypes: string[];
  description?: string;
  isActive: boolean;
  completedAt?: Date;
  createdByUser?: string;
  metadata?: any;
  createdAt: Date;
  updatedAt: Date;
}

// API Token types
export interface ApiToken {
  id: string;
  token: string;
  name: string;
  salesRepId?: string;
  permissions?: string[];
  isActive?: boolean;
  lastUsedAt?: Date;
  expiresAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

// Unit types
export interface Unit {
  id: string;
  code: string;
  description: string;
  packaging?: string;
  createdAt: Date;
  updatedAt: Date;
}
