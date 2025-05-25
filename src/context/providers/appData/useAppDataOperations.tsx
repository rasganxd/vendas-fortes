
import { Order } from '@/types';

export const useAppDataOperations = (
  addProductHook: any,
  updateProductHook: any,
  deleteProductHook: any,
  forceRefreshProducts: any,
  addOrderHook: any,
  updateOrderHook: any,
  deleteOrderHook: any,
  refreshOrdersHook: any
) => {
  const addProduct = async (product: any) => {
    const result = await addProductHook(product);
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'add', productId: result } }));
    return result;
  };

  const updateProduct = async (id: string, product: any) => {
    await updateProductHook(id, product);
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'update', productId: id } }));
  };

  const deleteProduct = async (id: string) => {
    await deleteProductHook(id);
    window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'delete', productId: id } }));
  };

  const refreshProducts = async (): Promise<boolean> => {
    try {
      const result = await forceRefreshProducts();
      window.dispatchEvent(new CustomEvent('productsUpdated', { detail: { action: 'refresh' } }));
      return result;
    } catch (error) {
      console.error('Error refreshing products:', error);
      return false;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    return await addOrderHook(order);
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    await updateOrderHook(id, order);
  };

  const deleteOrder = async (id: string) => {
    await deleteOrderHook(id);
  };

  const refreshOrders = async (): Promise<void> => {
    await refreshOrdersHook();
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders
  };
};
