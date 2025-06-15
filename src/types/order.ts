
import { SalesRep } from './personnel';
import { PaymentMethod } from './payment';

export type OrderStatus = 'pending' | 'processing' | 'completed' | 'cancelled' | 'draft' | 'confirmed' | 'canceled';
export type PaymentStatus = 'pending' | 'paid' | 'refunded' | 'partial';
export type ImportStatus = 'pending' | 'imported' | 'rejected';

// Enum para motivos de recusa padronizados
export type RejectionReason = 
  | 'sem_interesse' 
  | 'fechado' 
  | 'sem_dinheiro' 
  | 'produto_indisponivel' 
  | 'cliente_ausente' 
  | 'outro';

export interface OrderAdvancedFilters {
  salesRepId?: string;
  status?: OrderStatus;
  minTotal?: string;
  maxTotal?: string;
  paymentMethodId?: string;
}

/**
 * Order
 */
export interface Order {
  id: string;
  code: number;
  customerId: string;
  customerName: string;
  customerCode?: number; // Código numérico do cliente
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
  importStatus: ImportStatus;
  importedAt?: Date;
  importedBy?: string;
  sourceProject: string;
  mobileOrderId?: string;
  // Novos campos para pedidos negativados
  rejectionReason?: RejectionReason;
  visitNotes?: string;
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

/**
 * Mobile Order Import Types
 */
export interface MobileOrderGroup {
  salesRepId: string;
  salesRepName: string;
  orders: Order[];
  totalValue: number;
  count: number;
}

export interface ImportSelectionState {
  selectedOrders: Set<string>;
  selectedSalesReps: Set<string>;
}
