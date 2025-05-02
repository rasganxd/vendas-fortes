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
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  code: number;
  name: string;
  description: string;
  price: number;
  cost: number;
  stock: number;
  minStock: number;
  maxDiscountPercentage?: number;
  groupId?: string;
  categoryId?: string;
  brandId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  code: number;
  customerId: string;
  customerName: string;
  date: Date;
  dueDate: Date;
  total: number;
  discount: number;
  notes: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled';
  items: OrderItem[];
  payments: Payment[];
  salesRepId?: string;
  paymentMethodId?: string;
  paymentTableId?: string;
  deliveryRouteId?: string;
  deliveryDate?: Date;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface OrderItem {
  productId: string;
  productCode: number;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
}

export interface Payment {
  id: string;
  orderId: string;
  date: Date;
  amount: number;
  method: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  description: string;
  salesRepId?: string;
  vehicleId?: string;
  daysOfWeek: string[];
  startTime: string;
  endTime: string;
  frequency: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Load {
  id: string;
  code: number;
  date: Date;
  routeId: string;
  routeName: string;
  vehicleId: string;
  vehicleName: string;
  salesRepId: string;
  salesRepName: string;
  totalWeight: number;
  totalVolume: number;
  notes: string;
  items: LoadItem[];
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadItem {
  productId: string;
  productCode: number;
  productName: string;
  quantity: number;
  weight: number;
  volume: number;
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
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Vehicle {
  id: string;
  code: number;
  name: string;
  description: string;
  capacityWeight: number;
  capacityVolume: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTable {
  id: string;
  name: string;
  description: string;
  installments: PaymentTableInstallment[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTableInstallment {
  installment: number;
  percentage: number;
  days: number;
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
  updatedAt: Date;
}

export interface AppSettings {
  company: {
    name: string;
    address: string;
    phone: string;
    email: string;
    document: string;
    footer: string;
  };
  theme?: {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  };
}
