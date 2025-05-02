
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
  status: 'pending' | 'processing' | 'completed' | 'canceled';
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
}

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
