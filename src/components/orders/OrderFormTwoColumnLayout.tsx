
import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import OrderFormHeader from './OrderFormHeader';
import OrderFormFields from './OrderFormFields';
import OrderFormActions from './OrderFormActions';
import EnhancedProductSearch from './EnhancedProductSearch';
import OrderSummaryPanel from './OrderSummaryPanel';
import EnhancedOrderItemsTable from './EnhancedOrderItemsTable';
import { OrderFormLayoutProps } from './types';

export default function OrderFormTwoColumnLayout({
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
  handleCreateOrder,
  handleViewRecentPurchases,
  handleAddItem,
  handleRemoveItem,
  calculateTotal,
  salesRepInputRef,
  customerInputRef,
  paymentTableRef,
  productInputRef,
  onSalesRepNext,
  onCustomerNext,
  onPaymentNext
}: OrderFormLayoutProps) {
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'F2') {
        e.preventDefault();
        productInputRef.current?.focus();
      }

      if (e.key === 'F3') {
        e.preventDefault();
        customerInputRef.current?.focus();
      }

      if (e.key === 'F4') {
        e.preventDefault();
        salesRepInputRef.current?.focus();
      }

      if (e.ctrlKey && e.key === 'Enter') {
        e.preventDefault();
        if (selectedCustomer && selectedSalesRep && orderItems.length > 0) {
          handleCreateOrder();
        }
      }
    };
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [selectedCustomer, selectedSalesRep, orderItems, handleCreateOrder, productInputRef, customerInputRef, salesRepInputRef]);

  return (
    <div className="w-full h-screen flex flex-col overflow-hidden">
      {/* Fixed Action Bar for Mobile */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-50 bg-white border-t shadow-lg p-4">
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

      {/* Main Content with proper grid alignment */}
      <div className="flex-1 overflow-hidden">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 h-full p-6">
          {/* Left Column - Form Fields (3/4 width on XL screens) */}
          <div className="xl:col-span-3 flex flex-col space-y-6 pb-20 lg:pb-0 min-w-0">
            {/* Order Form Fields */}
            <Card className="shadow-sm border-gray-200 flex-shrink-0">
              <CardContent className="pt-6 pb-6">
                <div className="space-y-4">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">Dados do Pedido</h3>
                    <div className="text-xs text-gray-500 space-x-4 hidden lg:block">
                      <span>F3: Cliente</span>
                      <span>F4: Vendedor</span>
                      <span>F2: Produto</span>
                    </div>
                  </div>
                  
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
                </div>
              </CardContent>
            </Card>

            {/* Enhanced Product Search */}
            <Card className="shadow-sm border-gray-200 flex-shrink-0">
              <CardContent className="pt-6 pb-6">
                <EnhancedProductSearch 
                  products={products}
                  handleAddItem={handleAddItem}
                  productInputRef={productInputRef}
                  isEditMode={isEditMode}
                  selectedCustomer={selectedCustomer}
                />
              </CardContent>
            </Card>

            {/* Order Items Table with better overflow handling */}
            <Card className="shadow-sm border-gray-200 flex-1 flex flex-col min-h-0">
              <CardContent className="p-0 flex-1 flex flex-col min-h-0">
                <div className="flex-1 overflow-auto">
                  <EnhancedOrderItemsTable 
                    orderItems={orderItems}
                    handleRemoveItem={handleRemoveItem}
                    calculateTotal={calculateTotal}
                    isEditMode={isEditMode}
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Properly aligned with left column */}
          <div className="xl:col-span-1 hidden lg:block min-w-0">
            <div className="sticky top-6 space-y-6 max-h-[calc(100vh-3rem)] overflow-y-auto">
              {/* Compact Summary - Financial info only */}
              <Card className="shadow-sm border-gray-200">
                <CardContent className="pt-6 pb-6">
                  <OrderSummaryPanel 
                    orderItems={orderItems}
                    selectedCustomer={selectedCustomer}
                    selectedSalesRep={selectedSalesRep}
                    selectedPaymentTable={selectedPaymentTable}
                    calculateTotal={calculateTotal}
                    isEditMode={isEditMode}
                    compact={true}
                  />
                </CardContent>
              </Card>

              {/* Actions - Positioned consistently */}
              <Card className="shadow-sm border-gray-200">
                <CardContent className="pt-6 pb-6">
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
                </CardContent>
              </Card>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
