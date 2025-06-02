
import React from 'react';
import { Customer, SalesRep, PaymentTable, Product, OrderItem } from '@/types';
import { ConnectionStatus as ConnectionStatusType } from '@/context/AppContextTypes';
import { useOrderFormLogic } from './useOrderFormLogic';
import OrderFormLayout from './OrderFormLayout';

interface OrderFormProps {
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
  handleCreateOrder: () => Promise<void>;
  isEditMode: boolean;
  handleViewRecentPurchases: () => void;
  customerInputValue: string;
  salesRepInputValue?: string;
  handleAddItem: (product: Product, quantity: number, price: number) => void;
  handleRemoveItem: (productId: string) => void;
  connectionStatus?: ConnectionStatusType;
}

export default function OrderForm(props: OrderFormProps) {
  const {
    salesRepInputValue = '',
    connectionStatus = 'online',
    ...restProps
  } = props;

  const { layoutProps } = useOrderFormLogic({
    ...restProps,
    salesRepInputValue,
    connectionStatus
  });

  return <OrderFormLayout {...layoutProps} />;
}
