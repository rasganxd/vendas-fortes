
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
  payable_to?: string;
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
  amount: number;
  payment_date: Date;
  payment_method: string;
  customer_name: string;
  status: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}
