
import { useState } from 'react';
import { Order } from '@/types';

export const useOrdersState = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

  return {
    orders,
    setOrders,
    isLoading,
    setIsLoading,
    lastRefresh,
    setLastRefresh
  };
};
