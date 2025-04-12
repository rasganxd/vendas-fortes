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
  
  const { 
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode: generateNextCustomerCode,
    isLoading: isLoadingCustomers,
    setCustomers
  } = useCustomers();
  
  const { 
    products,
    addProduct,
    updateProduct,
    deleteProduct,
    isLoading: isLoadingProducts,
    setProducts
  } = useProducts();
  
  const { 
    orders,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    isLoading: isLoadingOrders,
    setOrders
  } = useOrders();
  
  const {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    isLoading: isLoadingPayments,
    setPayments
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
    createBackup,
    restoreBackup,
    deleteBackup,
    isLoading: isLoadingBackups,
    setBackups
  } = useBackups();
  
  const { 
    settings,
    updateSettings,
    isLoading: isLoadingSettings
  } = useAppSettings();

  const startNewMonth = () => {
    startNewMonthUtil(createBackup);
  };

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
