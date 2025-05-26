import React from 'react';
import { AppContext } from '../AppContext';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { useConnection } from './ConnectionProvider';
import { useAppOperations } from '@/context/operations/appOperations';
import { useAppDataState } from './appData/useAppDataState';
import { useAppDataOperations } from './appData/useAppDataOperations';
import { useAppDataEventHandlers } from './appData/useAppDataEventHandlers';
import { buildContextValue } from '../utils/buildContextValue';

/**
 * Inner provider for the AppContext
 * Combines data and operations from various sources into a unified context
 */
export const AppContextInnerProvider = ({ children }: { children: React.ReactNode }) => {
  // Get connection status
  const connection = useConnection();
  
  // Get app operations (customer, product brands, etc.)
  const appOperations = useAppOperations();
  
  // Get hooks for various data operations
  const hookOperations = useAppContextHooks();

  // Get app data state directly (products, orders)
  const {
    products,
    isLoadingProducts,
    addProductHook,
    updateProductHook,
    deleteProductHook,
    forceRefreshProducts,
    orders,
    isLoadingOrders,
    addOrderHook,
    updateOrderHook,
    deleteOrderHook,
    refreshOrdersHook,
    markOrderAsBeingEdited,
    unmarkOrderAsBeingEdited
  } = useAppDataState();

  // Get app data operations
  const {
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders
  } = useAppDataOperations(
    addProductHook,
    updateProductHook,
    deleteProductHook,
    forceRefreshProducts,
    addOrderHook,
    updateOrderHook,
    deleteOrderHook,
    refreshOrdersHook
  );

  const refreshData = async (): Promise<boolean> => {
    try {
      console.log('🔄 Refreshing all app data...');
      await Promise.all([
        refreshProducts(),
        refreshOrders()
      ]);
      console.log('✅ All app data refreshed successfully');
      return true;
    } catch (error) {
      console.error('❌ Error refreshing data:', error);
      return false;
    }
  };

  useAppDataEventHandlers(refreshData, markOrderAsBeingEdited, unmarkOrderAsBeingEdited);
  
  // Initialize theme
  useThemeInitializer('#3b82f6');
  
  // Build the full context value combining all data sources
  const contextValue = {
    // Use centralized products from useProducts hook
    products,
    isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    
    // Use centralized orders from useOrders hook  
    orders,
    isLoadingOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    
    // Keep existing operations from appOperations
    ...appOperations,
    customers: appOperations.customers,
    isLoading: appOperations.isLoading,
    addCustomer: appOperations.addCustomer,
    updateCustomer: appOperations.updateCustomer,
    deleteCustomer: appOperations.deleteCustomer,
    generateNextCustomerCode: appOperations.generateNextCustomerCode,
    productBrands: appOperations.productBrands,
    isLoadingProductBrands: appOperations.isLoadingProductBrands,
    addProductBrand: appOperations.addProductBrand,
    updateProductBrand: appOperations.updateProductBrand,
    deleteProductBrand: appOperations.deleteProductBrand,
    productCategories: appOperations.productCategories,
    isLoadingProductCategories: appOperations.isLoadingProductCategories,
    addProductCategory: appOperations.addProductCategory,
    updateProductCategory: appOperations.updateProductCategory,
    deleteProductCategory: appOperations.deleteProductCategory,
    productGroups: appOperations.productGroups,
    isLoadingProductGroups: appOperations.isLoadingProductGroups,
    addProductGroup: appOperations.addProductGroup,
    updateProductGroup: appOperations.updateProductGroup,
    deleteProductGroup: appOperations.deleteProductGroup,
    salesReps: appOperations.salesReps,
    isLoadingSalesReps: appOperations.isLoadingSalesReps,
    addSalesRep: appOperations.addSalesRep,
    updateSalesRep: appOperations.updateSalesRep,
    deleteSalesRep: appOperations.deleteSalesRep,
    vehicles: appOperations.vehicles,
    isLoadingVehicles: appOperations.isLoadingVehicles,
    addVehicle: appOperations.addVehicle,
    updateVehicle: appOperations.updateVehicle,
    deleteVehicle: appOperations.deleteVehicle,
    deliveryRoutes: appOperations.deliveryRoutes,
    isLoadingDeliveryRoutes: appOperations.isLoadingDeliveryRoutes,
    addDeliveryRoute: appOperations.addDeliveryRoute,
    updateDeliveryRoute: appOperations.updateDeliveryRoute,
    deleteDeliveryRoute: appOperations.deleteDeliveryRoute,
    loads: appOperations.loads,
    isLoadingLoads: appOperations.isLoadingLoads,
    addLoad: appOperations.addLoad,
    updateLoad: appOperations.updateLoad,
    deleteLoad: appOperations.deleteLoad,
    payments: appOperations.payments,
    isLoadingPayments: appOperations.isLoadingPayments,
    addPayment: appOperations.addPayment,
    updatePayment: appOperations.updatePayment,
    deletePayment: appOperations.deletePayment,
    paymentMethods: appOperations.paymentMethods,
    isLoadingPaymentMethods: appOperations.isLoadingPaymentMethods,
    addPaymentMethod: appOperations.addPaymentMethod,
    updatePaymentMethod: appOperations.updatePaymentMethod,
    deletePaymentMethod: appOperations.deletePaymentMethod,
    paymentTables: appOperations.paymentTables,
    isLoadingPaymentTables: appOperations.isLoadingPaymentTables,
    addPaymentTable: appOperations.addPaymentTable,
    updatePaymentTable: appOperations.updatePaymentTable,
    deletePaymentTable: appOperations.deletePaymentTable,
    connectionStatus: connection.connectionStatus,
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection,
    settings: {
      primaryColor: '#3b82f6'
    },
    productOperations: appOperations.productOperations,
    customerOperations: appOperations.customerOperations,
    systemOperations: appOperations.systemOperations,
    refreshData
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
