
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { useAppData } from '@/context/providers/AppDataProvider';
import { orderService } from '@/services/supabase/orderService';
import { useOrdersEditState } from './orders/useOrdersEditState';
import { useOrderById } from './orders/useOrderById';
import { useOrdersState } from './orders/useOrdersState';

export const useOrders = () => {
  const { 
    orders, 
    isLoadingOrders, 
    addOrder, 
    updateOrder, 
    deleteOrder, 
    refreshOrders 
  } = useAppData();

  const { markOrderAsBeingEdited, unmarkOrderAsBeingEdited } = useOrdersEditState();
  const { lastRefresh } = useOrdersState();
  const { getOrderById } = useOrderById(orders, () => {}, lastRefresh);

  const generateNextCode = async (): Promise<number> => {
    try {
      return await orderService.generateNextCode();
    } catch (error) {
      console.error('Error generating order code:', error);
      return 1;
    }
  };

  return {
    orders,
    isLoading: isLoadingOrders,
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
