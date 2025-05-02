
export interface DeliveryRoute {
  id: string;
  name: string;
  date: Date;
  driverId: string;
  driverName: string; // For compatibility
  vehicleId: string;
  vehicleName: string; // For compatibility
  stops: RouteStop[];
  status: 'pending' | 'in-progress' | 'completed' | 'planning' | 'assigned';
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStop {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zipCode?: string; // For compatibility
  lat: number;
  lng: number;
  sequence: number;
  position: number; // For compatibility
  status: 'pending' | 'completed';
  completed: boolean;
  orderId?: string;
}

export interface Load {
  id: string;
  name: string;
  date: Date;
  vehicleId: string;
  vehicleName?: string; // For compatibility
  items: LoadItem[];
  status: 'pending' | 'in-progress' | 'completed' | 'planning' | 'loading' | 'loaded' | 'in-transit' | 'delivered';
  total: number;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  orderIds?: string[];
  locked?: boolean;
}

export interface LoadItem {
  id?: string;
  productId: string;
  productName: string;
  quantity: number;
  total?: number;
  orderId?: string;
  orderItems?: OrderItem[];
  productCode?: number; // For compatibility
}

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productCode: number;
  quantity: number;
  price: number;
  unitPrice: number;
  discount: number;
  total: number;
}
