
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services/supabase/orderService';
import { toast } from '@/components/ui/use-toast';
import { useOrdersState } from './orders/useOrdersState';
import { useOrdersEditState } from './orders/useOrdersEditState';
import { useOrdersRefresh } from './orders/useOrdersRefresh';
import { useOrdersLoader } from './orders/useOrdersLoader';
import { useOrderById } from './orders/useOrderById';
import { useOrdersEventHandlers } from './orders/useOrdersEventHandlers';
import { useOrdersOperations } from './orders/useOrdersOperations';

export const useOrders = () => {
  const { orders, setOrders, isLoading, setIsLoading, lastRefresh, setLastRefresh } = useOrdersState();
  const { markOrderAsBeingEdited, unmarkOrderAsBeingEdited, isOrderBeingEdited } = useOrdersEditState();
  
  const { refreshOrders } = useOrdersRefresh(setOrders, setLastRefresh, isOrderBeingEdited);
  const { getOrderById } = useOrderById(orders, setOrders, lastRefresh);
  const { generateNextCode, addOrder, updateOrder, deleteOrder } = useOrdersOperations(setOrders, unmarkOrderAsBeingEdited, refreshOrders);

  // Load orders on mount
  useOrdersLoader(setOrders, setIsLoading, setLastRefresh);
  
  // Set up event handlers
  useOrdersEventHandlers(isOrderBeingEdited, refreshOrders);

  return {
    orders,
    isLoading,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    getOrderById,
    generateNextCode,
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited
  };
};

// Export loadOrders function for backward compatibility
export const loadOrders = async (): Promise<Order[]> => {
  try {
    console.log("🔍 Loading all orders from orderService");
    const orders = await orderService.getAll();
    console.log(`✅ Loaded ${orders.length} orders`);
    return orders;
  } catch (error) {
    console.error("❌ Error loading orders:", error);
    throw error;
  }
};
