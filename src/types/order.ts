
export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'draft' | 'confirmed' | 'canceled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial';
export type ImportStatus = 'pending' | 'imported' | 'rejected';

/**
 * Order
 */
export interface Order {
  id: string;
  code: number;
  customerId: string;
  customerName: string;
  salesRepId: string;
  salesRepName: string;
  date: Date;
  dueDate: Date;
  deliveryDate?: Date;
  items: OrderItem[];
  total: number;
  discount: number;
  status: OrderStatus;
  paymentStatus: PaymentStatus;
  paymentMethod: string;
  paymentMethodId: string;
  paymentTableId: string;
  paymentTable?: string;
  payments: any[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  archived: boolean;
  deliveryAddress: string;
  deliveryCity: string;
  deliveryState: string;
  deliveryZip: string;
  sourceProject: string;
  mobileOrderId?: string;
  importStatus: ImportStatus;
  importedAt?: Date;
  importedBy?: string;
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
  unit?: string; // Added unit field to differentiate items by unit
}

/**
 * Payment Summary
 */
export interface PaymentSummary {
  paid: number;
  pending: number;
  total: number;
}
