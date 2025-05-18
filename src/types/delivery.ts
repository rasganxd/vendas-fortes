
import { OrderItem } from './order';

export interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Vehicle {
  id: string;
  name: string;
  plateNumber: string;
  type: string;
  capacity?: number;
  notes?: string;
  active?: boolean;
  createdAt?: Date;
  updatedAt?: Date;
}

export interface Load {
  id: string;
  code: number;
  description?: string;
  vehicleId?: string;
  vehicleName?: string;
  driverId?: string;
  driverName?: string;
  salesRepId?: string;
  salesRepName?: string;
  routeId?: string;
  routeName?: string;
  status: 'pending' | 'loading' | 'in_transit' | 'delivered' | 'completed';
  departureDate?: Date;
  deliveryDate?: Date;
  returnDate?: Date;
  notes?: string;
  items?: LoadItem[];
  orders?: string[]; // Order IDs
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
  orderId?: string;
  orderItemId?: string;
  status: 'pending' | 'loaded' | 'delivered' | 'returned';
}
