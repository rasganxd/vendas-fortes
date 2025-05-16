
import { FirestoreEntity } from '@/services/firebase/FirestoreService';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'draft' | 'confirmed' | 'canceled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial';

/**
 * Order
 */
export interface Order extends FirestoreEntity {
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
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentMethodId: string;
  paymentTableId: string;
  payments: any[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
}

/**
 * Order Item
 */
export interface OrderItem {
  id: string;
  orderId?: string;
  productId?: string;
  productName: string;
  productCode: number;
  quantity: number;
  unitPrice: number;
  price: number;
  discount?: number;
  total: number;
}

/**
 * Payment Summary
 */
export interface PaymentSummary {
  paid: number;
  pending: number;
  total: number;
}
