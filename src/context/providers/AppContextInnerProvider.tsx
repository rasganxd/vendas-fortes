import React from 'react';
import { AppContext } from '../AppContext';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { useConnection } from './ConnectionProvider';
import { useAppOperations } from '@/context/operations/useAppOperations';
import { useAppDataEventHandlers } from './appData/useAppDataEventHandlers';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useAppData } from './AppDataProvider';

export const AppContextInnerProvider = ({ children }: { children: React.ReactNode }) => {
  console.log('🚀 [AppContextInnerProvider] Initializing inner provider...');
  
  const connection = useConnection();
  const appOperations = useAppOperations();
  const hookOperations = useAppContextHooks();
  const { settings, updateSettings: updateSettingsHook, isLoading: isLoadingSettings } = useAppSettings();

  let appData;
  try {
    appData = useAppData();
  } catch (error) {
    console.error('❌ [AppContextInnerProvider] Error accessing AppData:', error);
    appData = {
      customers: [],
      isLoading: true,
      addCustomer: async () => '',
      updateCustomer: async () => {},
      deleteCustomer: async () => {},
      generateNextCustomerCode: async () => 1,
      products: [],
      isLoadingProducts: true,
      addProduct: async () => '',
      updateProduct: async () => {},
      deleteProduct: async () => {},
      refreshProducts: async () => true,
      orders: [],
      isLoadingOrders: true,
      addOrder: async () => '',
      updateOrder: async () => '',
      deleteOrder: async () => {},
      refreshOrders: async () => {},
      refreshData: async () => true,
      productBrands: [],
      isLoadingProductBrands: false,
      addProductBrand: async () => '',
      updateProductBrand: async () => {},
      deleteProductBrand: async () => {},
      productCategories: [],
      isLoadingProductCategories: false,
      addProductCategory: async () => '',
      updateProductCategory: async () => {},
      deleteProductCategory: async () => {},
      productGroups: [],
      isLoadingProductGroups: false,
      addProductGroup: async () => '',
      updateProductGroup: async () => {},
      deleteProductGroup: async () => {},
      salesReps: [],
      isLoadingSalesReps: false,
      addSalesRep: async () => '',
      updateSalesRep: async () => {},
      deleteSalesRep: async () => {},
      vehicles: [],
      isLoadingVehicles: false,
      addVehicle: async () => '',
      updateVehicle: async () => {},
      deleteVehicle: async () => {},
      deliveryRoutes: [],
      isLoadingDeliveryRoutes: false,
      addDeliveryRoute: async () => '',
      updateDeliveryRoute: async () => {},
      deleteDeliveryRoute: async () => {},
      loads: [],
      isLoadingLoads: false,
      addLoad: async () => '',
      updateLoad: async () => {},
      deleteLoad: async () => {},
      payments: [],
      isLoadingPayments: false,
      addPayment: async () => '',
      updatePayment: async () => {},
      deletePayment: async () => {},
      paymentMethods: [],
      isLoadingPaymentMethods: false,
      addPaymentMethod: async () => '',
      updatePaymentMethod: async () => {},
      deletePaymentMethod: async () => {},
      paymentTables: [],
      isLoadingPaymentTables: false,
      addPaymentTable: async () => '',
      updatePaymentTable: async () => {},
      deletePaymentTable: async () => {},
      connectionStatus: 'connecting' as const,
      lastConnectAttempt: null,
      reconnectToSupabase: async () => {},
      testConnection: async () => false,
      settings: undefined
    };
  }

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
  useThemeInitializer(settings?.theme?.primaryColor || '#3b82f6');
  
  console.log('🏢 [AppContextInnerProvider] Current settings in context:', {
    settingsLoaded: !!settings,
    companyName: settings?.company?.name,
    isLoadingSettings
  });

  const contextValue = {
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
    createAutomaticPaymentRecord: hookOperations.createAutomaticPaymentRecord,
    
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
    
    routes: hookOperations.routes || [],
    isLoadingRoutes: hookOperations.isLoadingRoutes || false,
    addRoute: hookOperations.addRoute || (async () => ''),
    updateRoute: hookOperations.updateRoute || (async () => {}),
    deleteRoute: hookOperations.deleteRoute || (async () => {}),
    
    getOrderById: hookOperations.getOrderById,
    generateNextOrderCode: hookOperations.generateNextOrderCode,
    
    connectionStatus: connection.connectionStatus as 'online' | 'offline' | 'connecting' | 'error',
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection,
    
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
    
    updateSettings,
    refreshData,
    
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
    
    backups: [],
    isLoadingBackups: false,
    createBackup: async () => '',
    restoreBackup: async () => false,
    deleteBackup: async () => false,
    
    validateProductDiscount: () => true,
    getMinimumPrice: () => 0,
    addBulkProducts: async () => [],
    
    generateRouteUpdate: async () => 0,
    getRouteWithCustomers: async () => null,
    
    startNewMonth: async () => false,
    startNewDay: async () => false,
    clearCache: async () => {},
    
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
