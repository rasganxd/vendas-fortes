import React, { useEffect } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import OrderFormHeader from './OrderFormHeader';
import OrderFormFields from './OrderFormFields';
import OrderActionBar from './OrderActionBar';
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
  return <div className="w-full space-y-6 bg-gray-50 min-h-screen">
      

      {/* Action Bar */}
      <div className="px-4">
        <OrderActionBar selectedCustomer={selectedCustomer} selectedSalesRep={selectedSalesRep} orderItems={orderItems} isSubmitting={isSubmitting} isEditMode={isEditMode} connectionStatus={connectionStatus} handleViewRecentPurchases={handleViewRecentPurchases} handleCreateOrder={handleCreateOrder} />
      </div>

      {/* Main Content */}
      <div className="px-4">
        <div className="grid grid-cols-1 xl:grid-cols-4 gap-6">
          {/* Left Column - Form Fields (3/4 width on XL screens) */}
          <div className="xl:col-span-3 space-y-6">
            {/* Order Form Fields */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-800">Dados do Pedido</h3>
                <div className="text-xs text-gray-500 space-x-4 hidden md:flex">
                  <span className="bg-gray-100 px-2 py-1 rounded">F3: Cliente</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">F4: Vendedor</span>
                  <span className="bg-gray-100 px-2 py-1 rounded">F2: Produto</span>
                </div>
              </div>
              
              <OrderFormFields customers={customers} salesReps={salesReps} paymentTables={paymentTables} selectedCustomer={selectedCustomer} setSelectedCustomer={setSelectedCustomer} selectedSalesRep={selectedSalesRep} setSelectedSalesRep={setSelectedSalesRep} selectedPaymentTable={selectedPaymentTable} setSelectedPaymentTable={setSelectedPaymentTable} customerInputValue={customerInputValue} salesRepInputValue={salesRepInputValue} isEditMode={isEditMode} salesRepInputRef={salesRepInputRef} customerInputRef={customerInputRef} paymentTableRef={paymentTableRef} onSalesRepNext={onSalesRepNext} onCustomerNext={onCustomerNext} onPaymentNext={onPaymentNext} />
            </div>

            {/* Enhanced Product Search */}
            <div className="bg-white border border-gray-200 rounded-lg p-4 relative z-10">
              <h4 className="text-md font-medium text-gray-800 mb-3">Adicionar Produtos</h4>
              <EnhancedProductSearch products={products} handleAddItem={handleAddItem} productInputRef={productInputRef} isEditMode={isEditMode} />
            </div>

            {/* Order Items Table */}
            <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
              <EnhancedOrderItemsTable orderItems={orderItems} handleRemoveItem={handleRemoveItem} calculateTotal={calculateTotal} isEditMode={isEditMode} />
            </div>
          </div>

          {/* Right Column - Summary Panel (1/4 width on XL screens) */}
          <div className="xl:col-span-1">
            <div className="sticky top-6">
              <OrderSummaryPanel orderItems={orderItems} selectedCustomer={selectedCustomer} selectedSalesRep={selectedSalesRep} selectedPaymentTable={selectedPaymentTable} calculateTotal={calculateTotal} isEditMode={isEditMode} />
            </div>
          </div>
        </div>
      </div>
    </div>;
}