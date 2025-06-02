
export interface OrderItem {
  id: string;
  order_id?: string;
  product_code?: number;
  product_name?: string;
  quantity: number;
  unit_price?: number;
  price: number;
  discount?: number;
  total: number;
  unit?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Order {
  id: string;
  code: number;
  customer_id?: string;
  customer_name?: string;
  sales_rep_id?: string;
  sales_rep_name?: string;
  date: Date;
  due_date?: Date;
  delivery_date?: Date;
  total: number;
  discount?: number;
  status: string;
  payment_status?: string;
  payment_method?: string;
  payment_method_id?: string;
  payment_table_id?: string;
  payment_table?: string;
  payments?: any[];
  notes?: string;
  delivery_address?: string;
  delivery_city?: string;
  delivery_state?: string;
  delivery_zip?: string;
  mobile_order_id?: string;
  sync_status?: string;
  source_project: string;
  archived?: boolean;
  imported?: boolean;
  createdAt: Date;
  updatedAt: Date;
}
