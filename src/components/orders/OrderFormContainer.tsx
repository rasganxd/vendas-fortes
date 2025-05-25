
import React from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useOrderForm } from '@/hooks/useOrderForm';
import { useOrderLoader } from '@/hooks/useOrderLoader';
import { useOrderOperations } from '@/hooks/useOrderOperations';
import OrderForm from './OrderForm';
import { RecentPurchasesManager } from './RecentPurchasesManager';
import { Order } from '@/types';

interface OrderFormContainerProps {
  preloadedOrder?: Order | null;
  orderId?: string | null;
}

export default function OrderFormContainer({ preloadedOrder, orderId }: OrderFormContainerProps) {
  const { customers, salesReps, products, orders, connectionStatus } = useAppContext();
  const { paymentTables } = usePaymentTables();
  
  const {
    selectedCustomer,
    setSelectedCustomer,
    selectedSalesRep,
    setSelectedSalesRep,
    orderItems,
    setOrderItems,
    selectedPaymentTable,
    setSelectedPaymentTable,
    customerInputValue,
    setCustomerInputValue,
    salesRepInputValue,
    setSalesRepInputValue,
    isEditMode,
    setIsEditMode,
    currentOrderId,
    setCurrentOrderId,
    originalOrder,
    setOriginalOrder,
    resetForm,
    calculateTotal,
    handleAddItem,
    handleRemoveItem
  } = useOrderForm();

  const { isLoading, loadError } = useOrderLoader({
    preloadedOrder,
    orderId,
    customers,
    salesReps,
    paymentTables,
    setSelectedCustomer,
    setSelectedSalesRep,
    setOrderItems,
    setSelectedPaymentTable,
    setCustomerInputValue,
    setSalesRepInputValue,
    setIsEditMode,
    setCurrentOrderId,
    setOriginalOrder
  });

  const { isSubmitting, handleCreateOrder } = useOrderOperations({
    selectedCustomer,
    selectedSalesRep,
    orderItems,
    selectedPaymentTable,
    paymentTables,
    isEditMode,
    currentOrderId,
    originalOrder,
    connectionStatus,
    resetForm
  });

  const handleViewRecentPurchases = () => {
    // This will be handled by the RecentPurchasesManager component
  };

  // Show loading state or error message if applicable
  if (loadError) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-2 border-red-500 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-lg text-gray-700 mb-2">Erro ao carregar pedido</p>
          <p className="text-sm text-gray-500">{loadError}</p>
          <button 
            onClick={() => window.location.href = '/pedidos'} 
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded"
          >
            Voltar para lista de pedidos
          </button>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-800 mx-auto mb-4"></div>
          <p className="text-lg text-gray-700">Carregando pedido...</p>
        </div>
      </div>
    );
  }

  return (
    <>
      <OrderForm 
        customers={customers}
        salesReps={salesReps}
        paymentTables={paymentTables}
        products={products}
        selectedCustomer={selectedCustomer}
        setSelectedCustomer={setSelectedCustomer}
        selectedSalesRep={selectedSalesRep}
        setSelectedSalesRep={setSelectedSalesRep}
        orderItems={orderItems}
        setOrderItems={setOrderItems}
        selectedPaymentTable={selectedPaymentTable}
        setSelectedPaymentTable={setSelectedPaymentTable}
        isSubmitting={isSubmitting}
        handleCreateOrder={handleCreateOrder}
        isEditMode={isEditMode}
        handleViewRecentPurchases={handleViewRecentPurchases}
        customerInputValue={customerInputValue}
        salesRepInputValue={salesRepInputValue}
        handleAddItem={handleAddItem}
        handleRemoveItem={handleRemoveItem}
        connectionStatus={connectionStatus}
      />

      <RecentPurchasesManager
        selectedCustomer={selectedCustomer}
        orders={orders}
      />
    </>
  );
}
