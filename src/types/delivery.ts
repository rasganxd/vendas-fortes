
export interface LoadItem {
  id: string;
  load_id?: string;
  loadId?: string; // Alias for compatibility
  order_id?: string;
  orderId?: string; // Alias for compatibility
  productId?: string;
  productName?: string;
  productCode?: number;
  quantity?: number;
  price?: number;
  customerId?: string;
  status?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Load {
  id: string;
  code: number;
  name?: string; // Add name property
  date: Date;
  status: string;
  notes?: string;
  total_value?: number;
  sales_rep_id?: string;
  vehicle_id?: string;
  vehicleName?: string; // Add vehicleName property
  locked?: boolean; // Add locked property
  orderIds?: string[]; // Add orderIds property
  items?: LoadItem[]; // Add items property
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  active: boolean;
  stops: RouteStop[];
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStop {
  id: string;
  route_id: string;
  customer_id: string;
  sequence: number;
  estimated_time?: string;
  actual_time?: string;
  status: 'pending' | 'completed' | 'skipped';
  notes?: string;
}
