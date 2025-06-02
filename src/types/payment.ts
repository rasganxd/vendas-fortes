
export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTable {
  id: string;
  name: string;
  description?: string;
  payment_location?: string;
  paymentLocation?: string; // Alias for compatibility
  payable_to?: string;
  payableTo?: string; // Alias for compatibility
  type?: string;
  installments?: any[];
  terms?: any;
  notes?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface Payment {
  id: string;
  order_id?: string;
  orderId?: string; // Alias for compatibility
  amount: number;
  payment_date: Date;
  date?: Date; // Alias for compatibility
  payment_method: string;
  method?: string; // Alias for compatibility
  customer_name: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

// Export PaymentStatus type
export type PaymentStatus = 'pending' | 'completed' | 'cancelled' | 'failed';
