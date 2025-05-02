
export interface Order {
  id: string;
  code: number;
  customerId: string;
  customerName: string;
  date: Date;
  dueDate: Date;
  total: number;
  discount: number;
  notes: string;
  status: 'pending' | 'processing' | 'completed' | 'cancelled' | 'draft' | 'confirmed' | 'delivered';
  items: OrderItem[];
  payments: Payment[];
  salesRepId?: string;
  salesRepName?: string;
  paymentMethodId?: string;
  paymentTableId?: string;
  deliveryRouteId?: string;
  deliveryDate?: Date;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
  deliveryZip?: string;
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
  paymentStatus?: 'pending' | 'partial' | 'paid';
  paymentMethod?: string;
}

export interface OrderItem {
  productId: string;
  productCode: number;
  productName: string;
  quantity: number;
  price: number;
  discount: number;
  total: number;
  id?: string;
  unitPrice?: number;
}
