
export interface Payment {
  id: string;
  orderId: string;
  date: Date;
  amount: number;
  method: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  status?: string;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface PaymentTable {
  id: string;
  name: string;
  description: string;
  installments: PaymentTableInstallment[];
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  type?: string;
  terms?: string;
  payableTo?: string;
  paymentLocation?: string;
}

export interface PaymentTableInstallment {
  installment: number;
  percentage: number;
  days: number;
}
