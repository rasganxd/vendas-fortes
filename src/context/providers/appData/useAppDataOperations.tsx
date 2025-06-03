
import { useCallback } from 'react';
import { Product, Order, Customer } from '@/types';

export const useAppDataOperations = (
  // Product hooks
  addProductHook: (product: Omit<Product, 'id'>) => Promise<string>,
  updateProductHook: (id: string, product: Partial<Product>) => Promise<void>,
  deleteProductHook: (id: string) => Promise<void>,
  forceRefreshProducts: () => Promise<boolean>,
  
  // Order hooks
  addOrderHook: (order: Omit<Order, 'id'>) => Promise<string>,
  updateOrderHook: (id: string, order: Partial<Order>) => Promise<string>,
  deleteOrderHook: (id: string) => Promise<void>,
  refreshOrdersHook: () => Promise<void>,

  // Customer hooks
  addCustomerHook: (customer: Omit<Customer, 'id'>) => Promise<string>,
  updateCustomerHook: (id: string, customer: Partial<Customer>) => Promise<void>,
  deleteCustomerHook: (id: string) => Promise<void>
) => {
  
  // Product operations
  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding product through centralized system');
    return await addProductHook(product);
  }, [addProductHook]);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    console.log('🔄 [AppDataOperations] Updating product through centralized system');
    await updateProductHook(id, product);
  }, [updateProductHook]);

  const deleteProduct = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting product through centralized system');
    await deleteProductHook(id);
  }, [deleteProductHook]);

  const refreshProducts = useCallback(async () => {
    console.log('🔄 [AppDataOperations] Refreshing products through centralized system');
    return await forceRefreshProducts();
  }, [forceRefreshProducts]);

  // Order operations
  const addOrder = useCallback(async (order: Omit<Order, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding order through centralized system');
    return await addOrderHook(order);
  }, [addOrderHook]);

  const updateOrder = useCallback(async (id: string, order: Partial<Order>) => {
    console.log('🔄 [AppDataOperations] Updating order through centralized system');
    return await updateOrderHook(id, order);
  }, [updateOrderHook]);

  const deleteOrder = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting order through centralized system');
    await deleteOrderHook(id);
  }, [deleteOrderHook]);

  const refreshOrders = useCallback(async () => {
    console.log('🔄 [AppDataOperations] Refreshing orders through centralized system');
    await refreshOrdersHook();
  }, [refreshOrdersHook]);

  // Customer operations
  const addCustomer = useCallback(async (customer: Omit<Customer, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding customer through centralized system');
    return await addCustomerHook(customer);
  }, [addCustomerHook]);

  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    console.log('🔄 [AppDataOperations] Updating customer through centralized system');
    await updateCustomerHook(id, customer);
  }, [updateCustomerHook]);

  const deleteCustomer = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting customer through centralized system');
    await deleteCustomerHook(id);
  }, [deleteCustomerHook]);

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    addCustomer,
    updateCustomer,
    deleteCustomer
  };
};
