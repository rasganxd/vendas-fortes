
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';

export const useAppDataState = () => {
  const {
    products,
    isLoading: isLoadingProducts,
    addProduct: addProductHook,
    updateProduct: updateProductHook,
    deleteProduct: deleteProductHook,
    forceRefreshProducts
  } = useProducts();

  const {
    orders,
    isLoading: isLoadingOrders,
    addOrder: addOrderHook,
    updateOrder: updateOrderHook,
    deleteOrder: deleteOrderHook,
    refreshOrders: refreshOrdersHook,
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited
  } = useOrders();

  const {
    customers,
    isLoading: isLoadingCustomers,
    addCustomer: addCustomerHook,
    updateCustomer: updateCustomerHook,
    deleteCustomer: deleteCustomerHook,
    generateNextCustomerCode
  } = useCustomers();

  return {
    products,
    isLoadingProducts,
    addProductHook,
    updateProductHook,
    deleteProductHook,
    forceRefreshProducts,
    orders,
    isLoadingOrders,
    addOrderHook,
    updateOrderHook,
    deleteOrderHook,
    refreshOrdersHook,
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited,
    customers,
    isLoadingCustomers,
    addCustomerHook,
    updateCustomerHook,
    deleteCustomerHook,
    generateNextCustomerCode
  };
};
