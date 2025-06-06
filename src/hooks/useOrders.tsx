
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services/supabase/orderService';
import { useOrdersEditState } from './orders/useOrdersEditState';
import { useOrderById } from './orders/useOrderById';
import { useOrdersState } from './orders/useOrdersState';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const { markOrderAsBeingEdited, unmarkOrderAsBeingEdited } = useOrdersEditState();
  const { lastRefresh } = useOrdersState();
  
  // Create a simple refreshOrders function
  const refreshOrders = async () => {
    try {
      setIsLoading(true);
      const ordersData = await orderService.getAllOrders();
      setOrders(ordersData);
    } catch (error) {
      console.error('Error refreshing orders:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const { getOrderById } = useOrderById(orders, refreshOrders, lastRefresh);

  const addOrder = async (orderData: Omit<Order, 'id'>): Promise<string> => {
    try {
      const orderId = await orderService.createOrder(orderData);
      await refreshOrders();
      return orderId;
    } catch (error) {
      console.error('Error adding order:', error);
      throw error;
    }
  };

  const updateOrder = async (id: string, updates: Partial<Order>): Promise<string> => {
    try {
      await orderService.updateOrder(id, updates);
      await refreshOrders();
      return id;
    } catch (error) {
      console.error('Error updating order:', error);
      throw error;
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      await orderService.deleteOrder(id);
      await refreshOrders();
    } catch (error) {
      console.error('Error deleting order:', error);
      throw error;
    }
  };

  const generateNextCode = async (): Promise<number> => {
    try {
      return await orderService.generateNextCode();
    } catch (error) {
      console.error('Error generating order code:', error);
      return 1;
    }
  };

  // Load orders on mount
  useEffect(() => {
    refreshOrders();
  }, []);

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
