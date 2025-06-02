
export interface Load {
  id: string;
  code: number;
  date: Date;
  sales_rep_id?: string;
  vehicle_id?: string;
  status: string;
  total_value?: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface LoadItem {
  id: string;
  load_id?: string;
  order_id?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface DeliveryRoute {
  id: string;
  name: string;
  description?: string;
  sales_rep_id?: string;
  sales_rep_name?: string;
  vehicle_id?: string;
  vehicle_name?: string;
  driver_name?: string;
  driver_id?: string;
  date?: Date;
  status?: string;
  stops?: any[];
  active: boolean;
  last_updated?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface RouteStop {
  id: string;
  customerId: string;
  customerName: string;
  orderId: string;
  address: string;
  city: string;
  state: string;
  sequence: number;
  position: number;
  status?: string;
  completed?: boolean;
}
