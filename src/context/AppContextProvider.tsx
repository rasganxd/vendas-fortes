
import React, { createContext } from 'react';
import { AppContextType } from './AppContextTypes';
import { defaultContextValues } from './defaultContextValues';
import { useOrders } from '@/hooks/useOrders';
import { usePayments } from '@/hooks/usePayments';
import { useRoutes } from '@/hooks/useRoutes';
import { useLoads } from '@/hooks/useLoads';
import { useSalesReps } from '@/hooks/useSalesReps';
import { useVehicles } from '@/hooks/useVehicles';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { useCustomers } from '@/hooks/useCustomers';
import { Customer, Product, Order, Load } from '@/types';

// Providers
import { ConnectionProvider, useConnection } from './providers/ConnectionProvider';
import { DataLoadingProvider, useDataLoading } from './providers/DataLoadingProvider';

// Operations
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  validateProductDiscount,
  getMinimumPrice,
  addBulkProducts
} from './operations/productOperations';
import { startNewMonth } from './operations/systemOperations';

export const AppContext = createContext<AppContextType>(defaultContextValues);

const AppContextProviderInner = ({ children }: { children: React.ReactNode }) => {
  // Get connection status from provider
  const { connectionStatus } = useConnection();
  
  // Get core data from DataLoadingProvider
  const { 
    customers, 
    products, 
    isLoadingCustomers, 
    isLoadingProducts, 
    isUsingMockData, 
    setCustomers,
    setProducts,
    refreshData
  } = useDataLoading();
  
  // Get order hook data
  const { 
    orders,
    setOrders,
    isLoading: isLoadingOrders,
    getOrderById,
    addOrder,
    updateOrder: updateOrderHook,
    deleteOrder
  } = useOrders();
  
  // Customer operations
  const { 
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  } = useCustomers();
  
  // Get data from other hooks
  const { 
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    isLoading: isLoadingPayments,
    setPayments,
    createAutomaticPaymentRecord
  } = usePayments();
  
  const {
    routes,
    addRoute,
    updateRoute,
    deleteRoute,
    isLoading: isLoadingRoutes,
    setRoutes
  } = useRoutes();
  
  const {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    isLoading: isLoadingLoads,
    setLoads
  } = useLoads();
  
  const {
    salesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    isLoading: isLoadingSalesReps,
    setSalesReps
  } = useSalesReps();
  
  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    isLoading: isLoadingVehicles,
    setVehicles
  } = useVehicles();
  
  const {
    paymentMethods,
    setPaymentMethods,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod
  } = usePaymentMethods();
  
  const {
    paymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    isLoading: isLoadingPaymentTables,
    setPaymentTables
  } = usePaymentTables();
  
  const {
    productGroups: fetchedProductGroups,
    isLoading: isLoadingProductGroups,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();
  
  const {
    productCategories: fetchedProductCategories,
    isLoading: isLoadingProductCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();
  
  const {
    productBrands: fetchedProductBrands,
    isLoading: isLoadingProductBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useProductBrands();
  
  const {
    deliveryRoutes: fetchedDeliveryRoutes,
    isLoading: isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();
  
  const {
    backups,
    createBackup: createBackupFunc,
    restoreBackup,
    deleteBackup,
    isLoading: isLoadingBackups,
    setBackups
  } = useBackups();
  
  const { 
    settings,
    updateSettings: updateSettingsFunc,
    isLoading: isLoadingSettings
  } = useAppSettings();

  // Fix return type issues with these functions
  const createBackup = async (name?: string): Promise<string> => {
    return await Promise.resolve(createBackupFunc(name));
  };

  const updateSettings = async (settings: Partial<any>): Promise<void> => {
    await updateSettingsFunc(settings);
  };

  // Build context value with connection status
  const contextValue: AppContextType = {
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
    productGroups: fetchedProductGroups,
    productCategories: fetchedProductCategories,
    productBrands: fetchedProductBrands,
    deliveryRoutes: fetchedDeliveryRoutes,
    backups,
    connectionStatus,
    
    isLoadingCustomers,
    isLoadingProducts,
    isLoadingOrders,
    isLoadingPayments,
    isLoadingRoutes,
    isLoadingLoads,
    isLoadingSalesReps,
    isLoadingVehicles,
    isLoadingPaymentMethods: false,
    isLoadingPaymentTables,
    isLoadingProductGroups,
    isLoadingProductCategories,
    isLoadingProductBrands,
    isLoadingDeliveryRoutes,
    isLoadingBackups,
    isUsingMockData,
    
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
    setProductGroups: () => {},
    setProductCategories: () => {},
    setProductBrands: () => {},
    setDeliveryRoutes: () => {},
    setBackups,
    
    addRoute,
    updateRoute,
    deleteRoute,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    
    // Product operations with bound parameters
    addProduct: async (product) => {
      console.log("Context: Adding product", product);
      const id = await addProduct(product, products, setProducts);
      console.log("Context: Product added with ID:", id);
      return id;
    },
    updateProduct: (id, product) => {
      console.log("Context: Updating product", id, product);
      return updateProduct(id, product, products, setProducts);
    },
    deleteProduct: (id) => {
      console.log("Context: Deleting product", id);
      return deleteProduct(id, products, setProducts);
    },
    validateProductDiscount: (productId, discountedPrice) => validateProductDiscount(productId, discountedPrice, products),
    getMinimumPrice: (productId) => getMinimumPrice(productId, products),
    addBulkProducts: (productsArray) => {
      console.log("Context: Adding bulk products", productsArray.length);
      return addBulkProducts(productsArray, products, setProducts, () => {});
    },
    
    getOrderById,
    addOrder: async (order: Order): Promise<string> => {
      const result = await addOrder(order);
      return result;
    },
    updateOrder: updateOrderHook,
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
    updateProductGroup: async (id: string, data: Partial<ProductGroup>): Promise<void> => {
      updateProductGroup(id, data);
      return Promise.resolve();
    },
    deleteProductGroup: async (id: string): Promise<void> => {
      deleteProductGroup(id);
      return Promise.resolve();
    },
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
    restoreBackup: async (id: string) => {
      const result = restoreBackup(id);
      return Promise.resolve(result);
    },
    deleteBackup: async (id: string) => {
      const result = deleteBackup(id);
      return Promise.resolve(result);
    },
    
    settings,
    updateSettings,
    startNewMonth: async () => {
      await startNewMonth(createBackupFunc);
      return true;
    },
    clearCache: async () => {
      await refreshData();
    },
    refreshData
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectionProvider>
      <DataLoadingProvider>
        <AppContextProviderInner>
          {children}
        </AppContextProviderInner>
      </DataLoadingProvider>
    </ConnectionProvider>
  );
};
