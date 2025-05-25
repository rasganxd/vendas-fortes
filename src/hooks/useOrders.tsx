
import { useOrdersState } from './orders/useOrdersState';
import { useOrdersEditState } from './orders/useOrdersEditState';
import { useOrdersLoader } from './orders/useOrdersLoader';
import { useOrdersEventHandlers } from './orders/useOrdersEventHandlers';
import { useOrdersRefresh } from './orders/useOrdersRefresh';
import { useOrderById } from './orders/useOrderById';
import { useOrdersOperations } from './orders/useOrdersOperations';
import { orderService } from '@/services/supabase/orderService';
import { Order } from '@/types';

export const useOrders = () => {
  const {
    orders,
    setOrders,
    isLoading,
    setIsLoading,
    lastRefresh,
    setLastRefresh
  } = useOrdersState();

  const {
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited,
    isOrderBeingEdited
  } = useOrdersEditState();

  const { refreshOrders } = useOrdersRefresh(
    setOrders,
    setLastRefresh,
    isOrderBeingEdited
  );

  const { getOrderById } = useOrderById(orders, setOrders, lastRefresh);

  const {
    generateNextCode,
    addOrder,
    updateOrder,
    deleteOrder
  } = useOrdersOperations(setOrders, unmarkOrderAsBeingEdited, refreshOrders);

  // Load orders initially
  useOrdersLoader(setOrders, setIsLoading, setLastRefresh);

  // Handle events
  useOrdersEventHandlers(isOrderBeingEdited, refreshOrders);

  return {
    orders,
    isLoading,
    addOrder,
    updateOrder,
    deleteOrder,
    setOrders,
    generateNextCode,
    getOrderById,
    refreshOrders,
    lastRefresh,
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited,
    isOrderBeingEdited
  };
};

// Export function for backward compatibility
export const loadOrders = async (): Promise<Order[]> => {
  try {
    return await orderService.getAll();
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
};
