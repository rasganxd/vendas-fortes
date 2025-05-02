
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
  status?: string;
  date?: Date;
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
  name?: string;
  status?: string;
  locked?: boolean;
  orderIds?: string[];
}

export interface LoadItem {
  productId: string;
  productCode: number;
  productName: string;
  quantity: number;
  weight: number;
  volume: number;
  id?: string;
  orderId?: string;
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
  type?: string;
  active?: boolean;
  driverName?: string;
}

export interface RouteStop {
  id: string;
  customerId: string;
  customerName: string;
  address: string;
  city: string;
  state: string;
  position: number;
}
