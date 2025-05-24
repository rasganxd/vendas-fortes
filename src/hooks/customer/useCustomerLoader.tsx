import { useState, useCallback } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/firebase/customerService';
import { customerLocalService } from '@/services/local/customerLocalService';
import { useCustomerCache } from './useCustomerCache';
import { useCustomerConnection } from './useCustomerConnection';

const CUSTOMERS_CACHE_KEY = 'app_customers_cache';
const CUSTOMERS_CACHE_TIMESTAMP_KEY = 'app_customers_timestamp';
const CACHE_MAX_AGE = 1000 * 60 * 60 * 24; // 24 hours

export const useCustomerLoader = () => {
  const [isLoading, setIsLoading] = useState(false);
  const { isOnline } = useCustomerConnection();
  const { saveToCache, getFromCache, filterValidCustomers } = useCustomerCache();

  const shouldRefreshCache = useCallback(() => {
    const timestamp = localStorage.getItem(CUSTOMERS_CACHE_TIMESTAMP_KEY);
    if (!timestamp) return true;
    
    const lastUpdated = parseInt(timestamp, 10);
    const now = Date.now();
    return now - lastUpdated > CACHE_MAX_AGE;
  }, []);

  const loadCustomers = useCallback(async (): Promise<Customer[]> => {
    setIsLoading(true);
    let customers: Customer[] = [];
    
    try {
      // Try loading from cache first for faster initial load
      const { customers: cachedCustomers } = getFromCache();
      if (cachedCustomers.length > 0) {
        console.log(`Loaded ${cachedCustomers.length} customers from cache`);
        customers = cachedCustomers;
      }

      // If online, try to load from Firebase
      if (isOnline) {
        try {
          // Check if we need to refresh the cache
          const shouldRefresh = shouldRefreshCache();
          if (shouldRefresh || customers.length === 0) {
            console.log('Fetching customers from Firebase');
            const firebaseCustomers = await customerService.getAll();
            
            if (firebaseCustomers.length > 0) {
              console.log(`Loaded ${firebaseCustomers.length} customers from Firebase`);
              
              // Filter out invalid customers
              const validFirebaseCustomers = filterValidCustomers(firebaseCustomers);
              
              // Update cache with Firebase data
              saveToCache(validFirebaseCustomers);
              
              // Also update the local storage service
              await customerLocalService.setAll(validFirebaseCustomers);
              
              customers = validFirebaseCustomers;
            }
          }
        } catch (firebaseError) {
          console.error('Error fetching from Firebase, will use local data:', firebaseError);
        }
      }
      
      // If we couldn't load from Firebase, try local storage
      if (customers.length === 0) {
        try {
          console.log('Fetching customers from local storage');
          const localCustomers = await customerLocalService.getAll();
          
          if (localCustomers.length > 0) {
            console.log(`Loaded ${localCustomers.length} customers from local storage`);
            
            // Filter out invalid customers
            const validLocalCustomers = filterValidCustomers(localCustomers);
            
            // Update cache with local data
            saveToCache(validLocalCustomers);
            
            customers = validLocalCustomers;
          }
        } catch (localError) {
          console.error('Error fetching from local storage:', localError);
        }
      }
      
      return customers;
    } catch (error) {
      console.error('Error loading customers:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, saveToCache, getFromCache, filterValidCustomers, shouldRefreshCache]);

  const refreshCustomers = useCallback(async (): Promise<Customer[]> => {
    setIsLoading(true);
    try {
      // Always try Firebase first when explicitly refreshing
      if (isOnline) {
        try {
          console.log('Refreshing customers from Firebase');
          const firebaseCustomers = await customerService.getAll();
          
          if (firebaseCustomers.length > 0) {
            console.log(`Refreshed ${firebaseCustomers.length} customers from Firebase`);
            
            // Filter out invalid customers
            const validFirebaseCustomers = filterValidCustomers(firebaseCustomers);
            
            // Update cache with Firebase data
            saveToCache(validFirebaseCustomers);
            
            // Also update the local storage service
            await customerLocalService.setAll(validFirebaseCustomers);
            
            return validFirebaseCustomers;
          }
        } catch (firebaseError) {
          console.error('Error refreshing from Firebase:', firebaseError);
        }
      }
      
      // Fall back to local storage
      const localCustomers = await customerLocalService.getAll();
      const validLocalCustomers = filterValidCustomers(localCustomers);
      return validLocalCustomers;
    } catch (error) {
      console.error('Error refreshing customers:', error);
      return [];
    } finally {
      setIsLoading(false);
    }
  }, [isOnline, saveToCache, filterValidCustomers]);

  return {
    loadCustomers,
    refreshCustomers,
    isLoading
  };
};
