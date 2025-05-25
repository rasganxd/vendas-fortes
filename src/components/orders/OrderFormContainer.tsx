
import React, { useEffect, useMemo, useCallback } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useOrderForm } from '@/hooks/useOrderForm';
import { useOrderLoader } from '@/hooks/useOrderLoader';
import { useOrderOperations } from '@/hooks/useOrderOperations';
import OrderForm from './OrderForm';
import { RecentPurchasesManager } from './RecentPurchasesManager';
import { OrderFormSkeleton } from '@/components/ui/order-skeleton';
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

  // Mark order as being edited when in edit mode
  useEffect(() => {
    if (isEditMode && currentOrderId) {
      console.log("🔒 Order is now being edited:", currentOrderId);
      
      // Dispatch event to mark order as being edited
      window.dispatchEvent(new CustomEvent('orderEditStarted', { 
        detail: { orderId: currentOrderId } 
      }));
      
      return () => {
        console.log("🔓 Order editing finished:", currentOrderId);
        window.dispatchEvent(new CustomEvent('orderEditFinished', { 
          detail: { orderId: currentOrderId } 
        }));
      };
    }
  }, [isEditMode, currentOrderId]);

  // Memoize the view recent purchases handler to prevent re-renders
  const handleViewRecentPurchases = useCallback(() => {
    // This will be handled by the RecentPurchasesManager component
  }, []);

  // Memoize form props to prevent unnecessary re-renders
  const formProps = useMemo(() => ({
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
    salesRepInputValue,
    handleAddItem,
    handleRemoveItem,
    connectionStatus
  }), [
    customers, salesReps, paymentTables, products,
    selectedCustomer, selectedSalesRep, orderItems, selectedPaymentTable,
    isSubmitting, isEditMode, customerInputValue, salesRepInputValue,
    connectionStatus, handleCreateOrder, handleViewRecentPurchases,
    handleAddItem, handleRemoveItem
  ]);

  // Show error state with smooth transition
  if (loadError) {
    return (
      <div className="flex justify-center items-center h-64 animate-fade-in">
        <div className="text-center">
          <div className="rounded-full h-12 w-12 border-2 border-red-500 mx-auto mb-4 flex items-center justify-center">
            <span className="text-red-500 text-xl">!</span>
          </div>
          <p className="text-lg text-gray-700 mb-2">Erro ao carregar pedido</p>
          <p className="text-sm text-gray-500">{loadError}</p>
          <button 
            onClick={() => window.location.href = '/pedidos'} 
            className="mt-4 bg-gray-200 hover:bg-gray-300 text-gray-800 px-4 py-2 rounded transition-colors"
          >
            Voltar para lista de pedidos
          </button>
        </div>
      </div>
    );
  }

  // Show skeleton loading state
  if (isLoading) {
    return <OrderFormSkeleton />;
  }

  return (
    <div className="animate-fade-in">
      <OrderForm {...formProps} />

      <RecentPurchasesManager
        selectedCustomer={selectedCustomer}
        orders={orders}
      />
    </div>
  );
}
