export interface Customer {
  id: string;
  name: string;
  phone: string;
  document: string;
  address?: string;
  city?: string;
  state?: string;
  zipCode?: string;
  createdAt?: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  createdAt?: Date;
}

export interface OrderItem {
  id: string;
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface Order {
  id: string;
  customerId: string;
  customerName: string;
  items: OrderItem[];
  total: number;
  paymentMethod: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdAt: Date;
  notes?: string;
  archived?: boolean;
  salesRepId?: string;
}

export interface Payment {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  amount: number;
  paymentMethod: string;
  paymentDate: Date;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  salesRepId: string;
  customerIds: string[];
}

export interface Load {
  id: string;
  name: string;
  date: Date;
  vehicleId: string;
  salesRepId: string;
  orderIds: string[];
  notes?: string;
}

export interface SalesRep {
  id: string;
  name: string;
  phone: string;
  email: string;
}

export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  type: 'truck' | 'van' | 'car';
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  type: 'cash' | 'card' | 'check' | 'bank_transfer' | 'other';
}

export interface PaymentTableTerm {
  id: string;
  days: number;
  percentage: number;
  description?: string;
}

export interface PaymentTable {
  id: string;
  name: string;
  terms: PaymentTableTerm[];
  type?: 'standard' | 'promissory_note' | 'financing';
  payableTo?: string;
  paymentLocation?: string;
}
