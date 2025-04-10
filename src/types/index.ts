
import { LucideIcon } from "lucide-react";

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
  code?: number;
  visitDays?: string[];
  notes?: string;
  segment?: string;
  priority?: 'high' | 'medium' | 'low';
  visitFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  preferredVisitDay?: string;
  preferredVisitTime?: string;
  visitSequence?: number;
  lastVisitDate?: Date;
}

export interface Product {
  id: string;
  name: string;
  description?: string;
  price: number;
  imageUrl?: string;
  createdAt?: Date;
  code?: number;
  unit?: string;
  stock?: number;
  category?: string;
  groupId?: string;
  categoryId?: string;
  brandId?: string;
  commission?: number;
  taxRate?: number;
  costPrice?: number;
  maxDiscountPercentage?: number;
  minimumPrice?: number;
  volumeDiscounts?: VolumeDiscount[];
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productCode?: number | undefined;
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
  paymentMethod?: string;
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdAt: Date;
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
  notes?: string;
  archived?: boolean;
  salesRepId?: string;
  salesRepName?: string;
  paymentTableId?: string;
  deliveryDate?: Date;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
}

export interface Payment {
  id: string;
  orderId: string;
  customerId?: string;
  customerName?: string;
  amount: number;
  paymentMethod?: string;
  method?: 'cash' | 'credit' | 'debit' | 'transfer' | 'check';
  status?: 'pending' | 'completed' | 'failed';
  date?: Date;
  paymentDate?: Date;
  notes?: string;
}

export interface Route {
  id: string;
  name: string;
  salesRepId: string;
  customerIds: string[];
  segment?: string;
  visitDay?: string;
  visitFrequency?: 'weekly' | 'biweekly' | 'monthly';
}

export interface LoadItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  orderId?: string;
  orderItems?: OrderItem[];
  productCode?: number;
}

export interface Load {
  id: string;
  name: string;
  date: Date;
  vehicleId: string;
  vehicleName?: string;
  salesRepId?: string;
  orderIds?: string[];
  items?: any[];
  status?: string;
  notes?: string;
  locked?: boolean;
}

export interface SalesRep {
  id: string;
  name: string;
  phone: string;
  email: string;
  code?: number;
  role?: string;
  region?: string;
  active?: boolean;
  commission?: number;
}

export interface Vehicle {
  id: string;
  name: string;
  capacity: number;
  type: 'truck' | 'van' | 'car' | 'motorcycle';
  licensePlate?: string;
  driverName?: string;
  active?: boolean;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  type: 'cash' | 'credit' | 'debit' | 'transfer' | 'check' | 'card' | 'bank_transfer' | 'other';
  active?: boolean;
  installments?: boolean;
  maxInstallments?: number;
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
  description?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface ProductGroup {
  id: string;
  name: string;
  description?: string;
}

export interface ProductCategory {
  id: string;
  name: string;
  groupId?: string;
  description?: string;
}

export interface ProductBrand {
  id: string;
  name: string;
  description?: string;
}

export interface VolumeDiscount {
  minQuantity: number;
  discountPercentage: number;
}

export interface NavItem {
  title: string;
  href: string;
  icon: LucideIcon;
  group: string;
  name?: string;
  submenu?: NavItem[];
}

export interface DeliveryRoute {
  id: string;
  name: string;
  date: Date;
  salesRepId?: string;
  salesRepName?: string;
  driverName?: string;
  vehicleId?: string; 
  vehicleName?: string;
  stops: RouteStop[];
  totalDistance?: number;
  status: 'planned' | 'in_progress' | 'completed' | 'cancelled' | 'planning' | 'assigned' | 'in-progress';
  notes?: string;
}

export interface RouteStop {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  position: number;
  sequence?: number;
  status?: 'pending' | 'completed';
  completed?: boolean;
  arrivalTime?: Date;
  departureTime?: Date;
  estimatedArrival?: Date;
  lat?: number;
  lng?: number;
}

export interface Backup {
  id: string;
  name: string;
  date: Date;
  description?: string;
  filename?: string;
  size?: number;
  createdAt?: Date;
  dataType?: 'all' | 'customers' | 'products' | 'orders' | 'payments';
  recordCount?: number;
  downloadUrl?: string;
  data?: {
    customers?: Customer[];
    products?: Product[];
    orders?: Order[];
    payments?: Payment[];
    routes?: DeliveryRoute[];
    loads?: Load[];
    salesReps?: SalesRep[];
    vehicles?: Vehicle[];
  };
}
