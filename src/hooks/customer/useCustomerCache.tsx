
import { useState } from 'react';
import { Customer } from '@/types';

// Cache key for localStorage
const CUSTOMERS_CACHE_KEY = 'app_customers_cache';
const CUSTOMERS_CACHE_TIMESTAMP_KEY = 'app_customers_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

/**
 * Hook for managing customer data caching
 */
export const useCustomerCache = () => {
  // Helper function to filter valid customers
  const filterValidCustomers = (customers: Customer[]): Customer[] => {
    return customers.filter(customer => 
      customer && 
      customer.id && 
      customer.name && 
      customer.name.trim() !== ''
    );
  };

  const saveToCache = (customers: Customer[]) => {
    const validCustomers = filterValidCustomers(customers);
    localStorage.setItem(CUSTOMERS_CACHE_KEY, JSON.stringify(validCustomers));
    localStorage.setItem(CUSTOMERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    return validCustomers;
  };

  const getFromCache = (): { customers: Customer[], isFresh: boolean } => {
    const cachedData = localStorage.getItem(CUSTOMERS_CACHE_KEY);
    const cachedTimestamp = localStorage.getItem(CUSTOMERS_CACHE_TIMESTAMP_KEY);
    
    if (!cachedData || !cachedTimestamp) {
      return { customers: [], isFresh: false };
    }
    
    const timestamp = parseInt(cachedTimestamp, 10);
    const now = Date.now();
    const isFresh = now - timestamp < CACHE_MAX_AGE;
    
    return {
      customers: filterValidCustomers(JSON.parse(cachedData) as Customer[]),
      isFresh
    };
  };

  return {
    saveToCache,
    getFromCache,
    filterValidCustomers
  };
};

