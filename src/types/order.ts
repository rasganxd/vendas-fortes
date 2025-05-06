
export interface Order {
  id: string;
  code: number;
  customerId: string;
  customerName: string;
  salesRepId: string;
  salesRepName: string;
  date: Date;
  dueDate: Date;
  items: OrderItem[];
  total: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: 'pending' | 'partial' | 'paid';
  paymentMethodId: string;
  paymentMethod: string; // For compatibility
  paymentTableId: string;
  payments: string[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  archived?: boolean;
  deliveryZip?: string;
  deliveryAddress?: string;
  deliveryCity?: string;
  deliveryState?: string;
}

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'canceled' | 'confirmed' | 'draft';

export interface OrderItem {
  id?: string;
  productId: string;
  productName: string;
  productCode: number;
  quantity: number;
  price: number;
  unitPrice: number; // For compatibility
  discount: number;
  total: number;
}

export interface PaymentSummary {
  total: number;
  paid: number;
  pending: number;
}
