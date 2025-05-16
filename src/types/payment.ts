
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
  
  // Additional properties used in PromissoryNoteView
  dueDate?: Date;
  amountInWords?: string;
  paymentLocation?: string;
  emissionLocation?: string;
  customerName?: string;
  customerDocument?: string;
  customerAddress?: string;
  installments?: PaymentInstallment[];
  paymentDate?: Date;
}

export interface PaymentInstallment {
  dueDate: Date;
  amount: number;
}

export interface PaymentMethod {
  id: string;
  name: string;
  description: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  type?: string;
  active?: boolean;
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
  terms?: PaymentTableTerm[];
  payableTo?: string;
  paymentLocation?: string;
  active?: boolean;
}

export interface PaymentTableInstallment {
  installment: number;
  percentage: number;
  days: number;
  id?: string;
  description?: string;
}

export interface PaymentTableTerm {
  id: string;
  days: number;
  percentage: number;
  description?: string;
  installment: number;
}
