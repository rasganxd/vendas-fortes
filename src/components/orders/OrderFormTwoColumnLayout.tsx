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
  // Keyboard shortcuts
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // F2 - Focus on product search
      if (e.key === 'F2') {
        e.preventDefault();
        productInputRef.current?.focus();
      }

      // F3 - Focus on customer search
      if (e.key === 'F3') {
        e.preventDefault();
        customerInputRef.current?.focus();
      }

      // F4 - Focus on sales rep search
      if (e.key === 'F4') {
        e.preventDefault();
        salesRepInputRef.current?.focus();
      }

      // Ctrl+Enter - Submit order
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
  return <div className="w-full space-y-4">
      {/* Header */}
      

      {/* Expanded Two Column Layout */}
      <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
        {/* Left Column - Form Fields (3/4 width on XL screens) */}
        <div className="xl:col-span-3 space-y-4">
          {/* Order Form Fields */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="pt-4 pb-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-lg font-semibold text-gray-800">Dados do Pedido</h3>
                  <div className="text-xs text-gray-500 space-x-4">
                    <span>F3: Cliente</span>
                    <span>F4: Vendedor</span>
                    <span>F2: Produto</span>
                  </div>
                </div>
                
                <OrderFormFields customers={customers} salesReps={salesReps} paymentTables={paymentTables} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} selectedSalesRep={selectedSalesRep} setSelectedSalesRep={setSelectedSalesRep} selectedPaymentTable={selectedPaymentTable} setSelectedPaymentTable={setSelectedPaymentTable} customerInputValue={customerInputValue} salesRepInputValue={salesRepInputValue} isEditMode={isEditMode} salesRepInputRef={salesRepInputRef} customerInputRef={customerInputRef} paymentTableRef={paymentTableRef} onSalesRepNext={onSalesRepNext} onCustomerNext={onCustomerNext} onPaymentNext={onPaymentNext} />
              </div>
            </CardContent>
          </Card>

          {/* Enhanced Product Search - Increased z-index and relative positioning */}
          <Card className="shadow-sm border-gray-200 relative z-10">
            <CardContent className="pt-4 pb-4 relative">
              <EnhancedProductSearch products={products} handleAddItem={handleAddItem} productInputRef={productInputRef} isEditMode={isEditMode} selectedCustomer={selectedCustomer} />
            </CardContent>
          </Card>

          {/* Order Items Table */}
          <Card className="shadow-sm border-gray-200">
            <CardContent className="p-0">
              <EnhancedOrderItemsTable orderItems={orderItems} handleRemoveItem={handleRemoveItem} calculateTotal={calculateTotal} isEditMode={isEditMode} />
            </CardContent>
          </Card>
        </div>

        {/* Right Column - Summary Panel (1/4 width on XL screens) */}
        <div className="xl:col-span-1 space-y-4">
          <OrderSummaryPanel orderItems={orderItems} selectedCustomer={selectedCustomer} selectedSalesRep={selectedSalesRep} selectedPaymentTable={selectedPaymentTable} calculateTotal={calculateTotal} isEditMode={isEditMode} />

          <OrderFormActions selectedCustomer={selectedCustomer} selectedSalesRep={selectedSalesRep} orderItems={orderItems} isSubmitting={isSubmitting} isEditMode={isEditMode} connectionStatus={connectionStatus} handleViewRecentPurchases={handleViewRecentPurchases} handleCreateOrder={handleCreateOrder} />
        </div>
      </div>
    </div>;
}