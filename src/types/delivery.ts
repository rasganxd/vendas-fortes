
import { OrderItem } from './order';

export interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  status: "completed" | "pending" | "in-progress" | "planning" | "assigned";
  date: Date;
  driverId: string;
  driverName: string;
  vehicleId: string;
  vehicleName: string;
  stops: RouteStop[];
  createdAt: Date;
  updatedAt: Date;
  salesRepId?: string;
  salesRepName?: string;
  lastUpdated?: Date;
  customers?: Customer[];
}

// Import Customer type from customer.ts
interface Customer {
  id: string;
  code: number;
  name: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  phone: string;
  email: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  deliveryRouteId?: string;
}

export interface RouteStop {
  id: string;
  orderId: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zipCode?: string;
  sequence: number;
  position: number;
  status: 'pending' | 'completed' | 'in-progress';
  completed: boolean;
  lat: number;
  lng: number;
  notes?: string;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  licensePlate: string;
  type: string;
  capacity?: number;
  model?: string;
  driverName?: string;
  active?: boolean;
  status?: string;
  notes?: string;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Load {
  id: string;
  name: string;
  code?: number;
  description?: string;
  date: Date;
  vehicleId?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  salesRepId?: string;
  salesRepName?: string;
  routeId?: string;
  routeName?: string;
  status: 'pending' | 'loading' | 'loaded' | 'in_transit' | 'delivered' | 'completed' | 'planning';
  departureDate?: Date;
  deliveryDate?: Date;
  returnDate?: Date;
  notes?: string;
  items?: LoadItem[];
  orders?: string[];
  orderIds?: string[];
  total?: number;
  locked?: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadItem {
  id: string;
  loadId: string;
  productId: string;
  productName: string;
  productCode: number;
  quantity: number;
  price: number;
  total?: number;
  orderId?: string;
  orderItemId?: string;
  customerId?: string;
  status: 'pending' | 'loaded' | 'delivered' | 'returned';
}
