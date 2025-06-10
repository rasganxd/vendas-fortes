
import { useCallback } from 'react';
import { Product, Order, Customer } from '@/types';
import { Payment, PaymentTable } from '@/types/payment';

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
  deleteCustomerHook: (id: string) => Promise<void>,

  // Payment hooks
  refreshPayments: (silent?: boolean) => Promise<void>,
  addPaymentHook: (payment: Omit<Payment, 'id'>) => Promise<string>,
  updatePaymentHook: (id: string, payment: Partial<Payment>) => Promise<void>,
  deletePaymentHook: (id: string) => Promise<void>,
  confirmPaymentHook: (orderId: string, paymentInfo: any) => Promise<boolean>,
  calculatePaymentTotal: (orderId: string) => number,
  createAutomaticPaymentRecord: (order: Order) => Promise<void>,

  // Payment Table hooks
  addPaymentTableHook: (table: Omit<PaymentTable, 'id'>) => Promise<string>,
  updatePaymentTableHook: (id: string, table: Partial<PaymentTable>) => Promise<void>,
  deletePaymentTableHook: (id: string) => Promise<void>
) => {
  
  // Product operations
  const addProduct = useCallback(async (product: Omit<Product, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding product through centralized system');
    console.log('📝 [AppDataOperations] Product data:', product);
    try {
      const result = await addProductHook(product);
      console.log('✅ [AppDataOperations] Product added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Product add failed:', error);
      throw error;
    }
  }, [addProductHook]);

  const updateProduct = useCallback(async (id: string, product: Partial<Product>) => {
    console.log('🔄 [AppDataOperations] Updating product through centralized system');
    console.log('📝 [AppDataOperations] Product ID:', id, 'Data:', product);
    try {
      await updateProductHook(id, product);
      console.log('✅ [AppDataOperations] Product updated successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Product update failed:', error);
      throw error;
    }
  }, [updateProductHook]);

  const deleteProduct = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting product through centralized system');
    console.log('📝 [AppDataOperations] Product ID:', id);
    try {
      await deleteProductHook(id);
      console.log('✅ [AppDataOperations] Product deleted successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Product delete failed:', error);
      throw error;
    }
  }, [deleteProductHook]);

  const refreshProducts = useCallback(async () => {
    console.log('🔄 [AppDataOperations] Refreshing products through centralized system');
    try {
      const result = await forceRefreshProducts();
      console.log('✅ [AppDataOperations] Products refreshed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Products refresh failed:', error);
      throw error;
    }
  }, [forceRefreshProducts]);

  // Order operations
  const addOrder = useCallback(async (order: Omit<Order, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding order through centralized system');
    console.log('📝 [AppDataOperations] Order data:', order);
    try {
      const result = await addOrderHook(order);
      console.log('✅ [AppDataOperations] Order added successfully:', result);
      
      // Dispatch custom event for order creation
      window.dispatchEvent(new CustomEvent('orderCreated', {
        detail: { orderId: result, order }
      }));
      
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Order add failed:', error);
      throw error;
    }
  }, [addOrderHook]);

  const updateOrder = useCallback(async (id: string, order: Partial<Order>) => {
    console.log('🔄 [AppDataOperations] Updating order through centralized system');
    console.log('📝 [AppDataOperations] Order ID:', id, 'Data:', order);
    try {
      const result = await updateOrderHook(id, order);
      console.log('✅ [AppDataOperations] Order updated successfully:', result);
      
      // Dispatch custom event for order update
      window.dispatchEvent(new CustomEvent('orderUpdated', {
        detail: { orderId: id, order }
      }));
      
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Order update failed:', error);
      throw error;
    }
  }, [updateOrderHook]);

  const deleteOrder = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting order through centralized system');
    console.log('📝 [AppDataOperations] Order ID:', id);
    try {
      await deleteOrderHook(id);
      console.log('✅ [AppDataOperations] Order deleted successfully');
      
      // Dispatch custom event for order deletion
      window.dispatchEvent(new CustomEvent('orderDeleted', {
        detail: { orderId: id }
      }));
      
    } catch (error) {
      console.error('❌ [AppDataOperations] Order delete failed:', error);
      throw error;
    }
  }, [deleteOrderHook]);

  const refreshOrders = useCallback(async () => {
    console.log('🔄 [AppDataOperations] Refreshing orders through centralized system');
    try {
      await refreshOrdersHook();
      console.log('✅ [AppDataOperations] Orders refreshed successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Orders refresh failed:', error);
      throw error;
    }
  }, [refreshOrdersHook]);

  // Customer operations
  const addCustomer = useCallback(async (customer: Omit<Customer, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding customer through centralized system');
    console.log('📝 [AppDataOperations] Customer data:', customer);
    try {
      const result = await addCustomerHook(customer);
      console.log('✅ [AppDataOperations] Customer added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Customer add failed:', error);
      throw error;
    }
  }, [addCustomerHook]);

  const updateCustomer = useCallback(async (id: string, customer: Partial<Customer>) => {
    console.log('🔄 [AppDataOperations] Updating customer through centralized system');
    console.log('📝 [AppDataOperations] Customer ID:', id, 'Data:', customer);
    try {
      await updateCustomerHook(id, customer);
      console.log('✅ [AppDataOperations] Customer updated successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Customer update failed:', error);
      throw error;
    }
  }, [updateCustomerHook]);

  const deleteCustomer = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting customer through centralized system');
    console.log('📝 [AppDataOperations] Customer ID:', id);
    try {
      await deleteCustomerHook(id);
      console.log('✅ [AppDataOperations] Customer deleted successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Customer delete failed:', error);
      throw error;
    }
  }, [deleteCustomerHook]);

  // Payment operations
  const addPayment = useCallback(async (payment: Omit<Payment, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding payment through centralized system');
    console.log('📝 [AppDataOperations] Payment data:', payment);
    try {
      const result = await addPaymentHook(payment);
      console.log('✅ [AppDataOperations] Payment added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Payment add failed:', error);
      throw error;
    }
  }, [addPaymentHook]);

  const updatePayment = useCallback(async (id: string, payment: Partial<Payment>) => {
    console.log('🔄 [AppDataOperations] Updating payment through centralized system');
    console.log('📝 [AppDataOperations] Payment ID:', id, 'Data:', payment);
    try {
      await updatePaymentHook(id, payment);
      console.log('✅ [AppDataOperations] Payment updated successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Payment update failed:', error);
      throw error;
    }
  }, [updatePaymentHook]);

  const deletePayment = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting payment through centralized system');
    console.log('📝 [AppDataOperations] Payment ID:', id);
    try {
      await deletePaymentHook(id);
      console.log('✅ [AppDataOperations] Payment deleted successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Payment delete failed:', error);
      throw error;
    }
  }, [deletePaymentHook]);

  const confirmPayment = useCallback(async (orderId: string, paymentInfo: any) => {
    console.log('🔄 [AppDataOperations] Confirming payment through centralized system');
    console.log('📝 [AppDataOperations] Order ID:', orderId, 'Info:', paymentInfo);
    try {
      const result = await confirmPaymentHook(orderId, paymentInfo);
      console.log('✅ [AppDataOperations] Payment confirmed successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Payment confirmation failed:', error);
      throw error;
    }
  }, [confirmPaymentHook]);

  // Payment Table operations
  const addPaymentTable = useCallback(async (table: Omit<PaymentTable, 'id'>) => {
    console.log('🔄 [AppDataOperations] Adding payment table through centralized system');
    console.log('📝 [AppDataOperations] Payment table data:', table);
    try {
      const result = await addPaymentTableHook(table);
      console.log('✅ [AppDataOperations] Payment table added successfully:', result);
      return result;
    } catch (error) {
      console.error('❌ [AppDataOperations] Payment table add failed:', error);
      throw error;
    }
  }, [addPaymentTableHook]);

  const updatePaymentTable = useCallback(async (id: string, table: Partial<PaymentTable>) => {
    console.log('🔄 [AppDataOperations] Updating payment table through centralized system');
    console.log('📝 [AppDataOperations] Payment table ID:', id, 'Data:', table);
    try {
      await updatePaymentTableHook(id, table);
      console.log('✅ [AppDataOperations] Payment table updated successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Payment table update failed:', error);
      throw error;
    }
  }, [updatePaymentTableHook]);

  const deletePaymentTable = useCallback(async (id: string) => {
    console.log('🔄 [AppDataOperations] Deleting payment table through centralized system');
    console.log('📝 [AppDataOperations] Payment table ID:', id);
    try {
      await deletePaymentTableHook(id);
      console.log('✅ [AppDataOperations] Payment table deleted successfully');
    } catch (error) {
      console.error('❌ [AppDataOperations] Payment table delete failed:', error);
      throw error;
    }
  }, [deletePaymentTableHook]);

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
    deleteCustomer,
    refreshPayments,
    addPayment,
    updatePayment,
    deletePayment,
    confirmPayment,
    calculatePaymentTotal,
    createAutomaticPaymentRecord,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable
  };
};
