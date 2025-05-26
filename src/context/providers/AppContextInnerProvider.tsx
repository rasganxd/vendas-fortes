
import React from 'react';
import { AppContext } from '../AppContext';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { useConnection } from './ConnectionProvider';
import { useAppOperations } from '@/context/operations/appOperations';
import { useAppDataState } from './appData/useAppDataState';
import { useAppDataOperations } from './appData/useAppDataOperations';
import { useAppDataEventHandlers } from './appData/useAppDataEventHandlers';

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
    // Core data from app operations
    ...appOperations,
    
    // Products data (override with direct state)
    products,
    isLoadingProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    refreshProducts,
    
    // Orders data (override with direct state)
    orders,
    isLoadingOrders,
    addOrder,
    updateOrder,
    deleteOrder,
    refreshOrders,
    
    // Hook operations that might not be in appOperations
    getOrderById: hookOperations.getOrderById,
    generateNextOrderCode: hookOperations.generateNextOrderCode,
    
    // Connection and settings
    connectionStatus: connection.connectionStatus,
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection,
    settings: {
      primaryColor: '#3b82f6'
    },
    
    // System operations
    refreshData,
    
    // Required setters (placeholders for compatibility)
    setCustomers: () => {},
    setProducts: () => {},
    setOrders: () => {},
    setPayments: () => {},
    setRoutes: () => {},
    setLoads: () => {},
    setSalesReps: () => {},
    setVehicles: () => {},
    setPaymentMethods: () => {},
    setPaymentTables: () => {},
    setProductGroups: () => {},
    setProductCategories: () => {},
    setProductBrands: () => {},
    setDeliveryRoutes: () => {},
    setBackups: () => {},
    
    // Required operations that might be missing
    routes: appOperations.routes || [],
    isLoadingRoutes: appOperations.isLoadingRoutes || false,
    addRoute: appOperations.addRoute || (async () => ''),
    updateRoute: appOperations.updateRoute || (async () => {}),
    deleteRoute: appOperations.deleteRoute || (async () => {}),
    
    backups: [],
    isLoadingBackups: false,
    createBackup: async () => '',
    restoreBackup: async () => false,
    deleteBackup: async () => false,
    
    // Product operations that might be missing
    validateProductDiscount: () => true,
    getMinimumPrice: () => 0,
    addBulkProducts: async () => [],
    
    // Route operations
    generateRouteUpdate: async () => 0,
    getRouteWithCustomers: async () => null,
    
    // System operations that might be missing
    startNewMonth: async () => false,
    startNewDay: async () => false,
    clearCache: async () => {},
    updateSettings: async () => {},
    
    // Required but not used properties
    isUsingMockData: false,
    connectionStatus: connection.connectionStatus,
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
