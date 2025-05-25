
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';

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
    unmarkOrderAsBeingEdited
  };
};
