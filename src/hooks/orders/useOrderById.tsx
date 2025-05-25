
import { useState } from 'react';
import { orderService } from '@/services/supabase/orderService';
import { Order } from '@/types';

export const useOrderById = (
  orders: Order[],
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  lastRefresh: Date
) => {
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      const localOrder = orders.find(order => order.id === id);
      if (localOrder && (new Date().getTime() - lastRefresh.getTime()) < 30000) {
        console.log("📋 Using cached order:", id);
        return localOrder;
      }
      
      console.log("🔍 Fetching order from server:", id);
      const serverOrder = await orderService.getById(id);
      
      if (serverOrder) {
        setOrders(prevOrders => {
          const existingIndex = prevOrders.findIndex(o => o.id === id);
          if (existingIndex !== -1) {
            const updated = [...prevOrders];
            updated[existingIndex] = serverOrder;
            return updated;
          } else {
            return [...prevOrders, serverOrder];
          }
        });
      }
      
      return serverOrder;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return null;
    }
  };

  return { getOrderById };
};
