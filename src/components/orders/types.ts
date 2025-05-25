
import React from 'react';
import { Customer, SalesRep, PaymentTable, Product, OrderItem } from '@/types';
import { ConnectionStatus as ConnectionStatusType } from '@/context/AppContextTypes';

export interface OrderFormLayoutProps {
  // Data
  customers: Customer[];
  salesReps: SalesRep[];
  paymentTables: PaymentTable[];
  products: Product[];
  
  // State
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedSalesRep: SalesRep | null;
  setSelectedSalesRep: (salesRep: SalesRep | null) => void;
  orderItems: OrderItem[];
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  customerInputValue: string;
  salesRepInputValue: string;
  isEditMode: boolean;
  isSubmitting: boolean;
  connectionStatus: ConnectionStatusType;
  
  // Handlers
  handleCreateOrder: () => Promise<void>;
  handleViewRecentPurchases: () => void;
  handleAddItem: (product: Product, quantity: number, price: number) => void;
  handleRemoveItem: (productId: string) => void;
  calculateTotal: () => number;
  
  // Refs
  salesRepInputRef: React.RefObject<HTMLInputElement>;
  customerInputRef: React.RefObject<HTMLInputElement>;
  paymentTableRef: React.RefObject<HTMLButtonElement>;
  productInputRef: React.RefObject<HTMLInputElement>;
  
  // Navigation handlers
  onSalesRepNext: () => void;
  onCustomerNext: () => void;
  onPaymentNext: () => void;
}
