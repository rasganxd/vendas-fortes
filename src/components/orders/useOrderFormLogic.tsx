
import { useRef } from 'react';
import { Customer, SalesRep, PaymentTable, Product, OrderItem } from '@/types';
import { ConnectionStatus as ConnectionStatusType } from '@/context/AppContextTypes';

interface UseOrderFormLogicProps {
  customers: Customer[];
  salesReps: SalesRep[];
  paymentTables: PaymentTable[];
  products: Product[];
  selectedCustomer: Customer | null;
  setSelectedCustomer: (customer: Customer | null) => void;
  selectedSalesRep: SalesRep | null;
  setSelectedSalesRep: (salesRep: SalesRep | null) => void;
  orderItems: OrderItem[];
  setOrderItems: React.Dispatch<React.SetStateAction<OrderItem[]>>;
  selectedPaymentTable: string;
  setSelectedPaymentTable: (id: string) => void;
  isSubmitting: boolean;
  isSaving: boolean;
  handleCreateOrder: () => Promise<void>;
  isEditMode: boolean;
  handleViewRecentPurchases: () => void;
  customerInputValue: string;
  salesRepInputValue: string;
  handleAddItem: (product: Product, quantity: number, price: number) => void;
  handleRemoveItem: (productId: string) => void;
  connectionStatus: ConnectionStatusType;
}

export function useOrderFormLogic({
  customers,
  salesReps,
  paymentTables,
  products,
  selectedCustomer,
  setSelectedCustomer,
  selectedSalesRep,
  setSelectedSalesRep,
  orderItems,
  setOrderItems,
  selectedPaymentTable,
  setSelectedPaymentTable,
  isSubmitting,
  isSaving,
  handleCreateOrder,
  isEditMode,
  handleViewRecentPurchases,
  customerInputValue,
  salesRepInputValue,
  handleAddItem,
  handleRemoveItem,
  connectionStatus
}: UseOrderFormLogicProps) {
  const salesRepInputRef = useRef<HTMLInputElement>(null);
  const customerInputRef = useRef<HTMLInputElement>(null);
  const paymentTableRef = useRef<HTMLButtonElement>(null);
  const productInputRef = useRef<HTMLInputElement>(null);
  
  const calculateTotal = () => {
    return orderItems.reduce((total, item) => total + (item.unitPrice || 0) * (item.quantity || 0), 0);
  };

  const handleSalesRepNext = () => {
    if (customerInputRef.current) {
      customerInputRef.current.focus();
    }
  };

  const handleCustomerNext = () => {
    if (paymentTableRef.current) {
      paymentTableRef.current.focus();
    }
  };

  const handlePaymentNext = () => {
    if (productInputRef.current) {
      productInputRef.current.focus();
    }
  };

  return {
    // Refs
    salesRepInputRef,
    customerInputRef,
    paymentTableRef,
    productInputRef,
    
    // Calculated values
    calculateTotal,
    
    // Navigation handlers
    handleSalesRepNext,
    handleCustomerNext,
    handlePaymentNext,
    
    // Pass-through props for layout
    layoutProps: {
      customers,
      salesReps,
      paymentTables,
      products,
      selectedCustomer,
      setSelectedCustomer,
      selectedSalesRep,
      setSelectedSalesRep,
      orderItems,
      selectedPaymentTable,
      setSelectedPaymentTable,
      customerInputValue,
      salesRepInputValue,
      isEditMode,
      isSubmitting,
      isSaving,
      connectionStatus,
      handleCreateOrder,
      handleViewRecentPurchases,
      handleAddItem,
      handleRemoveItem,
      calculateTotal,
      salesRepInputRef,
      customerInputRef,
      paymentTableRef,
      productInputRef,
      onSalesRepNext: handleSalesRepNext,
      onCustomerNext: handleCustomerNext,
      onPaymentNext: handlePaymentNext
    }
  };
}
