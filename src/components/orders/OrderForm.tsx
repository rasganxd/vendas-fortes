
import React, { useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Customer, SalesRep, PaymentTable, Product, OrderItem } from '@/types';
import { ConnectionStatus as ConnectionStatusType } from '@/context/AppContextTypes';
import OrderFormHeader from './OrderFormHeader';
import OrderFormFields from './OrderFormFields';
import OrderFormActions from './OrderFormActions';
import ProductAddition from './ProductAddition';
import OrderItemsSection from './OrderItemsSection';

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

export default function OrderForm({
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
  handleCreateOrder,
  isEditMode,
  handleViewRecentPurchases,
  customerInputValue,
  salesRepInputValue = '',
  handleAddItem,
  handleRemoveItem,
  connectionStatus = 'online'
}: OrderFormProps) {
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

  return (
    <div className="space-y-3">
      <Card className="shadow-sm border-gray-200">
        <CardContent className="pt-3 pb-3">
          <div className="space-y-3">
            <OrderFormHeader isEditMode={isEditMode} />
            
            <OrderFormFields
              customers={customers}
              salesReps={salesReps}
              paymentTables={paymentTables}
              selectedCustomer={selectedCustomer}
              setSelectedCustomer={setSelectedCustomer}
              selectedSalesRep={selectedSalesRep}
              setSelectedSalesRep={setSelectedSalesRep}
              selectedPaymentTable={selectedPaymentTable}
              setSelectedPaymentTable={setSelectedPaymentTable}
              customerInputValue={customerInputValue}
              salesRepInputValue={salesRepInputValue}
              isEditMode={isEditMode}
              salesRepInputRef={salesRepInputRef}
              customerInputRef={customerInputRef}
              paymentTableRef={paymentTableRef}
              onSalesRepNext={handleSalesRepNext}
              onCustomerNext={handleCustomerNext}
              onPaymentNext={handlePaymentNext}
            />
            
            <OrderFormActions
              selectedCustomer={selectedCustomer}
              selectedSalesRep={selectedSalesRep}
              orderItems={orderItems}
              isSubmitting={isSubmitting}
              isEditMode={isEditMode}
              connectionStatus={connectionStatus}
              handleViewRecentPurchases={handleViewRecentPurchases}
              handleCreateOrder={handleCreateOrder}
            />
          </div>
        </CardContent>
      </Card>
      
      <ProductAddition
        products={products}
        handleAddItem={handleAddItem}
        productInputRef={productInputRef}
        isEditMode={isEditMode}
      />
      
      <OrderItemsSection
        orderItems={orderItems}
        handleRemoveItem={handleRemoveItem}
        calculateTotal={calculateTotal}
        isEditMode={isEditMode}
      />
    </div>
  );
}
