
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { useAppData } from '@/context/providers/AppDataProvider';

export const useOrders = () => {
  const { 
    orders, 
    isLoadingOrders, 
    addOrder, 
    updateOrder, 
    deleteOrder, 
    refreshOrders 
  } = useAppData();

  return {
    orders,
    isLoading: isLoadingOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders
  };
};
