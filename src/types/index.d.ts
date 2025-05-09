export interface Customer {
  id: string;
  code: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  document: string;
  notes: string;
  visitFrequency: string;
  visitDays: string[];
  visitSequence: number;
}

export interface Product {
  id: string;
  code: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  unit: string;
  photo: string;
  active: boolean;
  notes: string;
  maxDiscountPercentage: number;
  groupId: string;
  categoryId: string;
  brandId: string;
}

export type OrderStatus = 'completed' | 'pending' | 'in-progress' | 'planning' | 'assigned' | 'draft' | 'canceled';
export type PaymentStatus = 'pending' | 'partial' | 'paid';

export interface Order {
  id: string;
  code: number;
  customerId: string;
  customerName: string;
  salesRepId: string;
  salesRepName: string;
  date: Date;
  dueDate: Date;
  items: OrderItem[];
  total: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentMethodId: string;
  paymentTableId: string;
  payments: Payment[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  deliveryAddress?: string;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  productCode: number;
  quantity: number;
  price: number;
  unitPrice: number;
  discount: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  customerName: string;
  customerDocument: string;
  customerAddress: string;
  amount: number;
  method: string;
  status: string;
  date: Date;
  paymentDate?: Date;
  paymentLocation: string;
  emissionLocation: string;
  notes: string;
  dueDate?: Date;
  amountInWords: string;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  date: Date;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleName: string;
  status: "completed" | "pending" | "in-progress" | "planning" | "assigned";
  stops: RouteStop[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStop {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  latitude: number;
  longitude: number;
  status: string;
  notes: string;
}

export interface Load {
  id: string;
  name: string;
  date: Date;
  salesRepId: string;
  vehicleId: string;
  vehicleName: string;
  status: string;
  notes: string;
  locked: boolean;
  items: LoadItem[];
  total: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadItem {
  id: string;
  productId: string;
  productName: string;
  productCode: number;
  quantity: number;
  price: number;
  customerId: string;
  loadId: string;
  orderId: string;
  total: number;
}

export interface SalesRep {
  id: string;
  code: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  region: string;
  document: string;
  role: string;
  active: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  name: string;
  model: string;
  licensePlate: string;
  type: string;
  capacity: number;
  driverName: string;
  active: boolean;
  status: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  name: string;
  type: string;
  description: string;
  active: boolean;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTable {
  id: string;
  name: string;
  description: string;
  payableTo: string;
  paymentLocation: string;
  type: string;
  terms: PaymentTerm[];
  notes: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTerm {
  id: string;
  days: number;
  percentage: number;
  installment: number;
}

export interface ProductGroup {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductCategory {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductBrand {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Backup {
  id: string;
  name: string;
  description: string;
  createdAt: Date;
}

// Update AppSettings interface to include id property
export interface AppSettings {
  id?: string;
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    document: string;
    footer: string;
  };
  theme: {
    primaryColor: string;
    secondaryColor: string;
    accentColor: string;
  };
}
