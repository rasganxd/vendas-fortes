
export interface SyncRequest {
  salesRepCode?: number;
  lastSync?: string;
  action?: 'get_sales_rep' | 'get_customers' | 'get_products' | 'sync_orders';
  orders?: MobileOrderData[]; // Para envio de pedidos do mobile
}

export interface MobileOrderData {
  id: string;
  customerId: string;
  customerName: string;
  customerCode?: number;
  salesRepId: string;
  salesRepName: string;
  date: string;
  dueDate?: string;
  deliveryDate?: string;
  total: number;
  discount?: number;
  status: string;
  paymentStatus: string;
  paymentMethod: string;
  paymentMethodId: string;
  paymentTableId?: string;
  paymentTable?: string;
  payments?: any[];
  notes?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  rejectionReason?: string;
  visitNotes?: string;
  items: MobileOrderItemData[];
}

export interface MobileOrderItemData {
  id?: string;
  productId?: string;
  productName: string;
  productCode: number;
  quantity: number;
  unitPrice: number;
  price: number;
  discount?: number;
  total: number;
  unit?: string;
}
