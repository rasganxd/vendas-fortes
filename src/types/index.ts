// Customer Types
export interface Customer {
  id: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes?: string;
  createdAt: Date;
}

// Product Types
export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  unit: string;
  stock: number;
  category: string;
  image?: string;
}

// Order Types
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
  salesRepId: string;
  salesRepName: string;
  items: OrderItem[];
  total: number;
  status: 'draft' | 'confirmed' | 'delivered' | 'cancelled';
  paymentStatus: 'pending' | 'partial' | 'paid';
  createdAt: Date;
  deliveryDate?: Date;
  notes?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZipCode?: string;
}

// Payment Types
export interface Payment {
  id: string;
  orderId: string;
  amount: number;
  method: 'cash' | 'credit' | 'debit' | 'transfer' | 'check';
  status: 'pending' | 'completed' | 'failed';
  date: Date;
  notes?: string;
}

// Payment Method Types
export interface PaymentMethod {
  id: string;
  name: string;
  type: 'cash' | 'credit' | 'debit' | 'transfer' | 'check' | 'other';
  active: boolean;
  installments: boolean;
  maxInstallments?: number;
}

// Route and Delivery Types
export interface RouteStop {
  id: string;
  orderId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  sequence: number;
  status: 'pending' | 'completed';
  estimatedArrival?: Date;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  date: Date;
  driverId?: string;
  driverName?: string;
  vehicleId?: string;
  vehicleName?: string;
  status: 'planning' | 'assigned' | 'in-progress' | 'completed';
  stops: RouteStop[];
}

// Vehicle Types
export interface Vehicle {
  id: string;
  name: string;
  licensePlate: string;
  type: 'car' | 'van' | 'truck' | 'motorcycle';
  capacity: number;
  active: boolean;
}

// Load Types
export interface LoadItem {
  id: string;
  orderId: string;
  orderItems: OrderItem[];
  totalWeight?: number;
  totalVolume?: number;
  status: 'pending' | 'loaded' | 'delivered';
}

export interface Load {
  id: string;
  name: string;
  date: Date;
  vehicleId?: string;
  vehicleName?: string;
  items: LoadItem[];
  status: 'planning' | 'loading' | 'loaded' | 'in-transit' | 'delivered';
  notes?: string;
}

// User/Sales Rep Types
export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'manager' | 'sales' | 'driver';
  region?: string;
  active: boolean;
}

// Backup Types
export interface Backup {
  id: string;
  name: string;
  description?: string;
  date: Date;
  data: {
    customers: Customer[];
    products: Product[];
    orders: Order[];
    payments: Payment[];
    routes: DeliveryRoute[];
    loads: Load[];
    salesReps: SalesRep[];
  }
}

// Add NavItem export for SideNav
export interface NavItem {
  name: string;
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  group: string;
}
