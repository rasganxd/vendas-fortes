import React, { createContext, useState } from 'react';
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
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { AppContextType } from './AppContextTypes';
import { defaultContextValues } from './defaultContextValues';
import { startNewMonth as startNewMonthUtil } from './utils/systemOperations';
import { Customer, Product, Order, Payment, Route, Load, SalesRep, 
  Vehicle, PaymentMethod, PaymentTable, ProductGroup, 
  ProductCategory, ProductBrand, DeliveryRoute } from '@/types';

export const AppContext = createContext<AppContextType>(defaultContextValues);

export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  
  // Get customers hook data
  const { 
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode: generateNextCustomerCode,
    isLoading: isLoadingCustomers,
    setCustomers
  } = useCustomers();
  
  // Get products hook data
  const { 
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading: isLoadingProducts,
    setProducts
  } = useProducts();
  
  // Get orders hook data
  const { 
    orders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    isLoading: isLoadingOrders,
    setOrders
  } = useOrders();
  
  // Get payments hook data
  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    isLoading: isLoadingPayments,
    setPayments,
    createAutomaticPaymentRecord
  } = usePayments();
  
  // Get routes hook data
  const {
    routes,
    addRoute,
    updateRoute,
    deleteRoute,
    isLoading: isLoadingRoutes,
    setRoutes
  } = useRoutes();
  
  // Get loads hook data
  const {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    isLoading: isLoadingLoads,
    setLoads
  } = useLoads();
  
  // Get sales reps hook data
  const {
    salesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    isLoading: isLoadingSalesReps,
    setSalesReps
  } = useSalesReps();
  
  // Get vehicles hook data
  const {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    isLoading: isLoadingVehicles,
    setVehicles
  } = useVehicles();
  
  // Get payment tables hook data
  const {
    paymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    isLoading: isLoadingPaymentTables,
    setPaymentTables
  } = usePaymentTables();
  
  // Get product groups, categories, and brands data
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
  
  // Get delivery routes data
  const {
    deliveryRoutes: fetchedDeliveryRoutes,
    isLoading: isLoadingDeliveryRoutes,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  } = useDeliveryRoutes();
  
  // Get backups hook data
  const {
    backups,
    createBackup,
    restoreBackup,
    deleteBackup,
    isLoading: isLoadingBackups,
    setBackups
  } = useBackups();
  
  // Get app settings hook data
  const { 
    settings,
    updateSettings,
    isLoading: isLoadingSettings
  } = useAppSettings();

  const startNewMonth = () => {
    startNewMonthUtil(createBackup);
  };

  // Build context value object
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
    productGroups: productGroups.length > 0 ? productGroups : fetchedProductGroups,
    productCategories: productCategories.length > 0 ? productCategories : fetchedProductCategories,
    productBrands: productBrands.length > 0 ? productBrands : fetchedProductBrands,
    deliveryRoutes: deliveryRoutes.length > 0 ? deliveryRoutes : fetchedDeliveryRoutes,
    backups,
    
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
    
    // Route operations with fixed return types
    addRoute,
    updateRoute,
    deleteRoute,
    
    // Customer operations
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    
    // Product operations
    addProduct,
    updateProduct,
    deleteProduct,
    
    // Order operations
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    
    // Vehicle operations
    addVehicle,
    updateVehicle,
    deleteVehicle,
    
    // Payment operations with fixed return types
    addPayment,
    updatePayment,
    deletePayment,
    
    // PaymentMethod operations
    addPaymentMethod: async (method) => {
      const { addPaymentMethod } = usePaymentMethods();
      return addPaymentMethod(method);
    },
    updatePaymentMethod: async (id, method) => {
      const { updatePaymentMethod } = usePaymentMethods();
      await updatePaymentMethod(id, method);
    },
    deletePaymentMethod: async (id) => {
      const { deletePaymentMethod } = usePaymentMethods();
      await deletePaymentMethod(id);
    },
    
    // Load operations
    addLoad,
    updateLoad,
    deleteLoad,
    
    // SalesRep operations
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    
    // PaymentTable operations with fixed return types
    addPaymentTable,
    updatePaymentTable: async (id, paymentTable) => {
      await updatePaymentTable(id, paymentTable);
    },
    deletePaymentTable: async (id) => {
      await deletePaymentTable(id);
    },
    
    // Product classification operations
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    
    // DeliveryRoute operations with fixed return types
    addDeliveryRoute,
    updateDeliveryRoute: async (id: string, route: Partial<DeliveryRoute>) => {
      await updateDeliveryRoute(id, route);
    },
    deleteDeliveryRoute: async (id: string) => {
      await deleteDeliveryRoute(id);
    },
    
    // Backup operations
    createBackup,
    restoreBackup: (id) => {
      restoreBackup(id);
      return true;
    },
    deleteBackup: (id) => {
      deleteBackup(id);
      return true;
    },
    
    settings,
    updateSettings,
    startNewMonth
  };

  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
