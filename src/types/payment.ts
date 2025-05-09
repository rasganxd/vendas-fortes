
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
  paymentDate?: Date; // Added payment date field to match database column
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
  terms?: PaymentTableTerm[]; // Use PaymentTableTerm type
  payableTo?: string;
  paymentLocation?: string;
  active?: boolean; // Added active property
}

export interface PaymentTableInstallment {
  installment: number;
  percentage: number;
  days: number;
  id?: string; // Make id optional here
  description?: string;
}

// Make PaymentTableTerm and PaymentTableInstallment interface compatible
export interface PaymentTableTerm {
  id: string;
  days: number;
  percentage: number;
  description?: string;
  installment: number; // This property is required
}
