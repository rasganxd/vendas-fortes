
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
  type?: string; // Added type property
  active?: boolean; // Added active property
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
  terms?: PaymentTableInstallment[]; // Changed from PaymentTableTerm[] to match installments
  payableTo?: string;
  paymentLocation?: string;
  active?: boolean; // Added active property
}

export interface PaymentTableInstallment {
  installment: number;
  percentage: number;
  days: number;
  id: string; // Changed from optional to required to match PaymentTableTerm
  description?: string;
}

// Update PaymentTableTerm to match PaymentTableInstallment
export interface PaymentTableTerm {
  id: string;
  days: number;
  percentage: number;
  description?: string;
  installment: number; // Added to match PaymentTableInstallment
}
