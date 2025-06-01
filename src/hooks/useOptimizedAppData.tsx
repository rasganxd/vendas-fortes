
import { useState, useEffect, useCallback, useRef } from 'react';
import { Product, Order, Customer, SalesRep } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { useCustomers } from '@/hooks/useCustomers';
import { useSalesReps } from '@/hooks/useSalesReps';

interface OptimizedAppData {
  products: Product[];
  orders: Order[];
  customers: Customer[];
  salesReps: SalesRep[];
  isLoading: boolean;
  error: string | null;
  lastRefresh: Date | null;
}

const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export const useOptimizedAppData = () => {
  const [cache, setCache] = useState<OptimizedAppData>({
    products: [],
    orders: [],
    customers: [],
    salesReps: [],
    isLoading: true,
    error: null,
    lastRefresh: null
  });

  const isRefreshingRef = useRef(false);
  const lastRequestRef = useRef<Date | null>(null);

  const productsHook = useProducts();
  const ordersHook = useOrders();
  const customersHook = useCustomers();
  const salesRepsHook = useSalesReps();

  // Debounced refresh to prevent multiple simultaneous calls
  const refreshData = useCallback(async (): Promise<boolean> => {
    const now = new Date();
    
    // Prevent multiple simultaneous refreshes
    if (isRefreshingRef.current) {
      console.log('⏳ Refresh already in progress, skipping');
      return false;
    }

    // Check if cache is still valid
    if (cache.lastRefresh && now.getTime() - cache.lastRefresh.getTime() < CACHE_DURATION) {
      console.log('✅ Cache still valid, skipping refresh');
      return true;
    }

    // Prevent rapid successive calls
    if (lastRequestRef.current && now.getTime() - lastRequestRef.current.getTime() < 1000) {
      console.log('🚫 Too many rapid requests, throttling');
      return false;
    }

    try {
      isRefreshingRef.current = true;
      lastRequestRef.current = now;
      
      console.log('🔄 Starting optimized data refresh');
      
      setCache(prev => ({ ...prev, isLoading: true, error: null }));

      // Update cache with current data from hooks
      setCache({
        products: productsHook.products,
        orders: ordersHook.orders,
        customers: customersHook.customers,
        salesReps: salesRepsHook.salesReps,
        isLoading: false,
        error: null,
        lastRefresh: now
      });

      console.log('✅ Optimized data refresh completed');
      return true;
    } catch (error) {
      console.error('❌ Error in optimized refresh:', error);
      setCache(prev => ({
        ...prev,
        isLoading: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      }));
      return false;
    } finally {
      isRefreshingRef.current = false;
    }
  }, [productsHook.products, ordersHook.orders, customersHook.customers, salesRepsHook.salesReps, cache.lastRefresh]);

  // Initial load and sync with hooks
  useEffect(() => {
    if (!cache.lastRefresh) {
      refreshData();
    }
  }, [refreshData, cache.lastRefresh]);

  // Sync when hook data changes
  useEffect(() => {
    if (!isRefreshingRef.current) {
      setCache(prev => ({
        ...prev,
        products: productsHook.products,
        orders: ordersHook.orders,
        customers: customersHook.customers,
        salesReps: salesRepsHook.salesReps,
        isLoading: productsHook.isLoading || ordersHook.isLoading || customersHook.isLoading || salesRepsHook.isLoading
      }));
    }
  }, [
    productsHook.products, 
    ordersHook.orders, 
    customersHook.customers, 
    salesRepsHook.salesReps,
    productsHook.isLoading,
    ordersHook.isLoading,
    customersHook.isLoading,
    salesRepsHook.isLoading
  ]);

  return {
    ...cache,
    refreshData,
    isCacheValid: cache.lastRefresh && new Date().getTime() - cache.lastRefresh.getTime() < CACHE_DURATION
  };
};
