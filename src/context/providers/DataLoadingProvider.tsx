import React, { useState, useEffect, useCallback } from 'react';
import { AppContext } from '../AppContext';
import { AppContextType, AppSettings } from '../AppContextTypes';
import defaultContextValues from '../defaultContextValues';
import { useCustomers } from '@/hooks/useCustomers';
import { useProducts } from '@/hooks/useProducts';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useRoutes } from '@/hooks/useRoutes';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useOnlineStatus } from '@/hooks/useOnlineStatus';
import { isMockDataEnabled } from '@/services/mockDataService';

interface DataLoadingProviderProps {
  children: React.ReactNode;
}

export const DataLoadingProvider: React.FC<DataLoadingProviderProps> = ({ children }) => {
  // Load data using custom hooks
  const { 
    customers, 
    setCustomers, 
    addCustomer, 
    updateCustomer, 
    deleteCustomer, 
    isLoading: isLoadingCustomers,
    generateNextCustomerCode
  } = useCustomers();
  
  const { 
    products, 
    setProducts, 
    addProduct, 
    updateProduct, 
    deleteProduct, 
    isLoading: isLoadingProducts,
    validateProductDiscount,
    getMinimumPrice,
    addBulkProducts
  } = useProducts();
  
  const { 
    orders, 
    setOrders, 
    getOrderById,
    addOrder, 
    updateOrder, 
    deleteOrder, 
    isLoading: isLoadingOrders 
  } = useOrders();
  
  const { 
    payments, 
    setPayments, 
    addPayment, 
    updatePayment, 
    deletePayment, 
    isLoading: isLoadingPayments,
    createAutomaticPaymentRecord
  } = usePayments();
  
  const { 
    routes, 
    setRoutes, 
    addRoute, 
    updateRoute, 
    deleteRoute, 
    isLoading: isLoadingRoutes 
  } = useRoutes();
  
  const { 
    loads, 
    setLoads, 
    addLoad, 
    updateLoad, 
    deleteLoad, 
    isLoading: isLoadingLoads 
  } = useLoads();
  
  const { 
    salesReps, 
    setSalesReps, 
    addSalesRep, 
    updateSalesRep, 
    deleteSalesRep, 
    isLoading: isLoadingSalesReps 
  } = useSalesReps();
  
  const { 
    vehicles, 
    setVehicles, 
    addVehicle, 
    updateVehicle, 
    deleteVehicle, 
    isLoading: isLoadingVehicles 
  } = useVehicles();
  
  const { 
    paymentMethods, 
    setPaymentMethods, 
    addPaymentMethod, 
    updatePaymentMethod, 
    deletePaymentMethod, 
    isLoading: isLoadingPaymentMethods 
  } = usePaymentMethods();
  
  const { 
    paymentTables, 
    setPaymentTables, 
    addPaymentTable, 
    updatePaymentTable, 
    deletePaymentTable, 
    isLoading: isLoadingPaymentTables 
  } = usePaymentTables();
  
  const { 
    productGroups, 
    setProductGroups, 
    addProductGroup, 
    updateProductGroup, 
    deleteProductGroup, 
    isLoading: isLoadingProductGroups 
  } = useProductGroups();
  
  const { 
    productCategories, 
    setProductCategories, 
    addProductCategory, 
    updateProductCategory, 
    deleteProductCategory, 
    isLoading: isLoadingProductCategories 
  } = useProductCategories();
  
  const { 
    productBrands, 
    setProductBrands, 
    addProductBrand, 
    updateProductBrand, 
    deleteProductBrand, 
    isLoading: isLoadingProductBrands 
  } = useProductBrands();
  
  const { 
    deliveryRoutes, 
    setDeliveryRoutes, 
    addDeliveryRoute, 
    updateDeliveryRoute, 
    deleteDeliveryRoute, 
    isLoading: isLoadingDeliveryRoutes 
  } = useDeliveryRoutes();
  
  const { 
    backups, 
    setBackups, 
    createBackup,
    restoreBackup,
    deleteBackup,
    isLoading: isLoadingBackups 
  } = useBackups();
  
  const { 
    settings, 
    updateSettings,
    isLoading: isLoadingSettings,
    refetch: refetchSettings
  } = useAppSettings();
  
  const onlineStatus = useOnlineStatus();
  const [connectionStatus, setConnectionStatus] = useState(onlineStatus);
  
  useEffect(() => {
    setConnectionStatus(onlineStatus);
  }, [onlineStatus]);
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  const refreshData = useCallback(async () => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSettings(),
        // Add other refetch functions here
      ]);
      return true;
    } catch (error) {
      console.error("Error refreshing data:", error);
      return false;
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchSettings]);
  
  const clearCache = useCallback(async () => {
    // Clear cache implementation here
    console.log('Cache cleared');
  }, []);
  
  const startNewMonth = useCallback(async () => {
    // Start new month implementation here
    console.log('New month started');
    return true;
  }, []);
  
  const startNewDay = useCallback(async () => {
    // Start new day implementation here
    console.log('New day started');
    return true;
  }, []);
  
  const appContextValue: AppContextType = {
    ...defaultContextValues,
    customers,
    products,
    orders,
    payments,
    routes,
    loads,
    salesReps,
    vehicles,
    paymentMethods,
    paymentTables,
    productGroups,
    productCategories,
    productBrands,
    deliveryRoutes,
    backups,
    
    setCustomers,
    setProducts,
    setOrders,
    setPayments,
    setRoutes,
    setLoads,
    setSalesReps,
    setVehicles,
    setPaymentMethods,
    setPaymentTables,
    setProductGroups,
    setProductCategories,
    setProductBrands,
    setDeliveryRoutes,
    setBackups,
    
    addRoute,
    updateRoute,
    deleteRoute,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice,
    addBulkProducts,
    
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord,
    
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    
    addLoad,
    updateLoad,
    deleteLoad,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,
    
    createBackup,
    restoreBackup,
    deleteBackup,
    
    isLoadingCustomers,
    isLoadingProducts,
    isLoadingOrders,
    isLoadingPayments,
    isLoadingRoutes,
    isLoadingLoads,
    isLoadingSalesReps,
    isLoadingVehicles,
    isLoadingPaymentMethods,
    isLoadingPaymentTables,
    isLoadingProductGroups,
    isLoadingProductCategories,
    isLoadingProductBrands,
    isLoadingDeliveryRoutes,
    isLoadingBackups,
    
    settings: settings || defaultContextValues.settings,
    updateSettings,
    
    startNewMonth,
    startNewDay,
    clearCache,
    refreshData,
    
    connectionStatus: connectionStatus,
    isUsingMockData: isMockDataEnabled(),
  };
  
  return (
    <AppContext.Provider value={appContextValue}>
      {children}
    </AppContext.Provider>
  );
};
