
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import OrderFormHeader from './OrderFormHeader';
import OrderFormFields from './OrderFormFields';
import OrderFormActions from './OrderFormActions';
import ProductAddition from './ProductAddition';
import OrderItemsSection from './OrderItemsSection';
import { OrderFormLayoutProps } from './types';

export default function OrderFormLayout({
  // Form state
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
  connectionStatus,
  
  // Handlers
  handleCreateOrder,
  handleViewRecentPurchases,
  handleAddItem,
  handleRemoveItem,
  calculateTotal,
  
  // Refs
  salesRepInputRef,
  customerInputRef,
  paymentTableRef,
  productInputRef,
  
  // Navigation handlers
  onSalesRepNext,
  onCustomerNext,
  onPaymentNext
}: OrderFormLayoutProps) {
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
              onSalesRepNext={onSalesRepNext}
              onCustomerNext={onCustomerNext}
              onPaymentNext={onPaymentNext}
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
