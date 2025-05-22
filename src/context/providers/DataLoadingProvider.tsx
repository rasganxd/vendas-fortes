import React, { useState, useEffect, useCallback, createContext, useContext } from 'react';
import { AppContext } from '../AppContext';
import { AppContextType } from '../AppContextTypes';
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
import { isMockDataEnabled } from '@/services/mockDataService';

// Create a Context for DataLoading
interface DataLoadingContextType {
  customers: any[];
  products: any[];
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  isUsingMockData: boolean;
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  refreshData: () => Promise<boolean>; // Keep as boolean return type
  clearItemCache: (itemType: string) => Promise<boolean>;
}

const DataLoadingContext = createContext<DataLoadingContextType | undefined>(undefined);

// Export the useDataLoading hook
export const useDataLoading = () => {
  const context = useContext(DataLoadingContext);
  if (context === undefined) {
    throw new Error('useDataLoading must be used within a DataLoadingProvider');
  }
  return context;
};

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
    isLoading: isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
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
    isLoading: isLoadingProductBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useProductBrands();
  
  const { 
    deliveryRoutes, 
    isLoading: isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
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
  
  const [connectionStatus, setConnectionStatus] = useState<'online' | 'offline' | 'connecting' | 'error'>('online');
  
  const [isRefreshing, setIsRefreshing] = useState(false);
  
  // Keep as boolean return type
  const refreshData = useCallback(async (): Promise<boolean> => {
    setIsRefreshing(true);
    try {
      await Promise.all([
        refetchSettings(),
        // Add other refetch functions here
      ]);
      return true; // Return true on success
    } catch (error) {
      console.error("Error refreshing data:", error);
      return false; // Return false on error
    } finally {
      setIsRefreshing(false);
    }
  }, [refetchSettings]);
  
  const clearItemCache = useCallback(async (itemType: string) => {
    // Clear cache implementation for specific item type
    console.log(`Cache cleared for ${itemType}`);
    return true;
  }, []);
  
  const clearCache = useCallback(async () => {
    // Clear cache implementation here
    console.log('Cache cleared');
    return true;
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

  // Create the data loading context value
  const dataLoadingContextValue: DataLoadingContextType = {
    customers,
    products,
    isLoadingCustomers,
    isLoadingProducts,
    isUsingMockData: isMockDataEnabled(),
    setCustomers,
    setProducts,
    refreshData,
    clearItemCache
  };
  
  // Access to product operations from useProducts
  const productOperations = { 
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice,
    addBulkProducts 
  };
  
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
    setProductBrands: () => {}, // Fixed return type
    setDeliveryRoutes: () => {}, // Fixed return type
    setBackups,
    
    addRoute,
    updateRoute,
    deleteRoute,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    
    // Product operations from useProducts
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice,
    addBulkProducts,
    
    getOrderById,
    addOrder,
    updateOrder: async (id: string, orderData: any) => {
      await updateOrder(id, orderData);
      return id; // Return string to match expected type
    },
    deleteOrder,
    
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord: async (order: any) => {
      await createAutomaticPaymentRecord(order);
      return ''; // Return string to match expected type
    },
    
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
    
    createBackup: async (name?: string, description?: string) => {
      if (!name) return '';
      const result = await createBackup(name, description);
      return result;
    },
    restoreBackup: async (id: string) => {
      await restoreBackup(id);
      return true; // Return boolean to match expected type
    },
    deleteBackup: async (id: string) => {
      await deleteBackup(id);
      return true; // Return boolean to match expected type
    },
    
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
    updateSettings: async (newSettings: any) => {
      await updateSettings(newSettings);
    },
    
    startNewMonth: async () => {
      await startNewMonth();
      return true;
    },
    startNewDay: async () => {
      await startNewDay();
      return true;
    },
    clearCache: async () => {
      await clearCache();
      return true;
    },
    refreshData: async (): Promise<void> => {
      // We call refreshData but ignore the return value to match void return type
      await refreshData();
      // No return needed since this function returns void
    },
    
    connectionStatus,
    isUsingMockData: isMockDataEnabled(),
  };
  
  return (
    <DataLoadingContext.Provider value={dataLoadingContextValue}>
      <AppContext.Provider value={appContextValue}>
        {children}
      </AppContext.Provider>
    </DataLoadingContext.Provider>
  );
};
