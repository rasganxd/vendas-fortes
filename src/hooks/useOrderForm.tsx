
import { useOrderFormState } from './orderForm/useOrderFormState';
import { useOrderFormItemOperations } from './orderForm/useOrderFormItemOperations';

export function useOrderForm() {
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
    isProcessingItem,
    setIsProcessingItem,
    lastOperation,
    setLastOperation,
    resetForm,
    calculateTotal
  } = useOrderFormState();

  const { handleAddItem, handleRemoveItem } = useOrderFormItemOperations(
    orderItems,
    setOrderItems,
    isEditMode,
    currentOrderId,
    isProcessingItem,
    setIsProcessingItem,
    lastOperation,
    setLastOperation
  );

  return {
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
    isProcessingItem,
    resetForm,
    calculateTotal,
    handleAddItem,
    handleRemoveItem
  };
}
