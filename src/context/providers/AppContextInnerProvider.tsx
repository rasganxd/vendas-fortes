
import React from 'react';
import { AppContext } from '../AppContext';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { useConnection } from './ConnectionProvider';
import { useAppOperations } from '@/context/operations/appOperations';
import { useAppDataEventHandlers } from './appData/useAppDataEventHandlers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAppData } from './AppDataProvider';

/**
 * Inner provider for the AppContext
 * Now uses AppDataProvider as the unified source for core data
 */
export const AppContextInnerProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🚀 [AppContextInnerProvider] Initializing inner provider...');
  
  // Get connection status
  const connection = useConnection();
  
  // Get app operations (product brands, payment tables, etc.)
  const appOperations = useAppOperations();
  
  // Get hooks for various data operations
  const hookOperations = useAppContextHooks();

  // Get real settings from the database
  const { settings, updateSettings: updateSettingsHook, isLoading: isLoadingSettings } = useAppSettings();

  // Get unified data from AppDataProvider
  const appData = useAppData();

  // Wrap updateSettings to match the expected return type (Promise<void>)
  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    await updateSettingsHook(newSettings);
  };

  const refreshData = async (): Promise<boolean> => {
    try {
      console.log('🔄 [AppContextInnerProvider] Refreshing all app data...');
      const result = await appData.refreshData();
      console.log('✅ [AppContextInnerProvider] All app data refreshed successfully');
      return result;
    } catch (error) {
      console.error('❌ [AppContextInnerProvider] Error refreshing data:', error);
      return false;
    }
  };

  useAppDataEventHandlers(refreshData, () => {}, () => {});
  
  // Initialize theme with the real primary color or fallback
  useThemeInitializer(settings?.theme?.primaryColor || '#3b82f6');
  
  // Log current settings state for debugging
  console.log('🏢 [AppContextInnerProvider] Current settings in context:', {
    settingsLoaded: !!settings,
    companyName: settings?.company?.name,
    isLoadingSettings
  });

  // Build the full context value combining all data sources
  const contextValue = {
    // Use AppDataProvider as the unified source for core entities
    customers: appData.customers,
    isLoadingCustomers: appData.isLoading,
    addCustomer: appData.addCustomer,
    updateCustomer: appData.updateCustomer,
    deleteCustomer: appData.deleteCustomer,
    generateNextCustomerCode: appData.generateNextCustomerCode,
    
    products: appData.products,
    isLoadingProducts: appData.isLoadingProducts,
    addProduct: appData.addProduct,
    updateProduct: appData.updateProduct,
    deleteProduct: appData.deleteProduct,
    refreshProducts: appData.refreshProducts,
    
    orders: appData.orders,
    isLoadingOrders: appData.isLoadingOrders,
    addOrder: appData.addOrder,
    updateOrder: appData.updateOrder,
    deleteOrder: appData.deleteOrder,
    refreshOrders: appData.refreshOrders,
    
    // Product operations from appOperations
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
    
    // Sales reps operations
    salesReps: appOperations.salesReps,
    isLoadingSalesReps: appOperations.isLoadingSalesReps,
    addSalesRep: appOperations.addSalesRep,
    updateSalesRep: appOperations.updateSalesRep,
    deleteSalesRep: appOperations.deleteSalesRep,
    
    // Vehicle operations
    vehicles: appOperations.vehicles,
    isLoadingVehicles: appOperations.isLoadingVehicles,
    addVehicle: appOperations.addVehicle,
    updateVehicle: appOperations.updateVehicle,
    deleteVehicle: appOperations.deleteVehicle,
    
    // Delivery routes operations
    deliveryRoutes: appOperations.deliveryRoutes,
    isLoadingDeliveryRoutes: appOperations.isLoadingDeliveryRoutes,
    addDeliveryRoute: appOperations.addDeliveryRoute,
    updateDeliveryRoute: appOperations.updateDeliveryRoute,
    deleteDeliveryRoute: appOperations.deleteDeliveryRoute,
    
    // Load operations
    loads: appOperations.loads,
    isLoadingLoads: appOperations.isLoadingLoads,
    addLoad: appOperations.addLoad,
    updateLoad: appOperations.updateLoad,
    deleteLoad: appOperations.deleteLoad,
    
    // Payment operations
    payments: appOperations.payments,
    isLoadingPayments: appOperations.isLoadingPayments,
    addPayment: appOperations.addPayment,
    updatePayment: appOperations.updatePayment,
    deletePayment: appOperations.deletePayment,
    createAutomaticPaymentRecord: hookOperations.createAutomaticPaymentRecord,
    
    // Payment method operations
    paymentMethods: appOperations.paymentMethods,
    isLoadingPaymentMethods: appOperations.isLoadingPaymentMethods,
    addPaymentMethod: appOperations.addPaymentMethod,
    updatePaymentMethod: appOperations.updatePaymentMethod,
    deletePaymentMethod: appOperations.deletePaymentMethod,
    
    // Payment table operations
    paymentTables: appOperations.paymentTables,
    isLoadingPaymentTables: appOperations.isLoadingPaymentTables,
    addPaymentTable: appOperations.addPaymentTable,
    updatePaymentTable: appOperations.updatePaymentTable,
    deletePaymentTable: appOperations.deletePaymentTable,
    
    // Routes operations from hook operations
    routes: hookOperations.routes,
    isLoadingRoutes: hookOperations.isLoadingRoutes,
    addRoute: hookOperations.addRoute,
    updateRoute: hookOperations.updateRoute,
    deleteRoute: hookOperations.deleteRoute,
    
    // Hook operations that might not be in appOperations
    getOrderById: hookOperations.getOrderById,
    generateNextOrderCode: hookOperations.generateNextOrderCode,
    
    // Connection and settings - use real settings
    connectionStatus: connection.connectionStatus as 'online' | 'offline' | 'connecting' | 'error',
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection,
    
    // Use real settings from database, with fallback only if completely unavailable
    settings: settings || {
      id: 'loading',
      company: {
        name: 'Carregando...',
        address: '',
        phone: '',
        email: '',
        document: '',
        footer: ''
      },
      theme: {
        primaryColor: '#6B7280'
      }
    },
    
    // Settings operations
    updateSettings,
    
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
    
    // Backup operations (placeholders)
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
    
    // Required but not used properties
    isUsingMockData: false
  };

  console.log('✅ [AppContextInnerProvider] Context value assembled:', {
    customersLength: contextValue.customers.length,
    productsLength: contextValue.products.length,
    ordersLength: contextValue.orders.length,
    paymentTablesLength: contextValue.paymentTables.length,
    isLoadingCustomers: contextValue.isLoadingCustomers,
    isLoadingProducts: contextValue.isLoadingProducts,
    isLoadingPaymentTables: contextValue.isLoadingPaymentTables
  });
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
