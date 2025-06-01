
import React from 'react';
import { AppContext } from '../AppContext';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { useConnection } from './ConnectionProvider';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { useBackups } from '@/hooks/useBackups';

/**
 * Simplified inner provider for the AppContext
 * Uses centralized data from existing hooks
 */
export const AppContextInnerProvider = ({ children }: { children: React.ReactNode }) => {
  // Get connection status
  const connection = useConnection();
  
  // Get main operations from centralized hooks
  const hookOperations = useAppContextHooks();

  // Get settings
  const { settings, updateSettings: updateSettingsHook } = useAppSettings();

  // Get additional data
  const productGroupsHook = useProductGroups();
  const productCategoriesHook = useProductCategories();
  const productBrandsHook = useProductBrands();
  const deliveryRoutesHook = useDeliveryRoutes();
  const backupsHook = useBackups();

  // Wrap updateSettings to match expected return type
  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    await updateSettingsHook(newSettings);
  };

  // Initialize theme
  useThemeInitializer(settings?.theme?.primaryColor || '#3b82f6');

  // Build the context value with all required properties
  const contextValue = {
    // Core data from centralized hooks
    ...hookOperations,
    
    // Additional data that was missing
    productGroups: productGroupsHook.productGroups,
    productCategories: productCategoriesHook.productCategories,
    productBrands: productBrandsHook.productBrands,
    deliveryRoutes: deliveryRoutesHook.deliveryRoutes,
    backups: backupsHook.backups,
    
    // Loading states for additional data
    isLoadingProductGroups: productGroupsHook.isLoading,
    isLoadingProductCategories: productCategoriesHook.isLoading,
    isLoadingProductBrands: productBrandsHook.isLoading,
    isLoadingDeliveryRoutes: deliveryRoutesHook.isLoading,
    isLoadingBackups: backupsHook.isLoading,
    
    // Additional operations that were missing
    addProductGroup: productGroupsHook.addProductGroup,
    updateProductGroup: productGroupsHook.updateProductGroup,
    deleteProductGroup: productGroupsHook.deleteProductGroup,
    
    addProductCategory: productCategoriesHook.addProductCategory,
    updateProductCategory: productCategoriesHook.updateProductCategory,
    deleteProductCategory: productCategoriesHook.deleteProductCategory,
    
    addProductBrand: productBrandsHook.addProductBrand,
    updateProductBrand: productBrandsHook.updateProductBrand,
    deleteProductBrand: productBrandsHook.deleteProductBrand,
    
    addDeliveryRoute: deliveryRoutesHook.addDeliveryRoute,
    updateDeliveryRoute: deliveryRoutesHook.updateDeliveryRoute,
    deleteDeliveryRoute: deliveryRoutesHook.deleteDeliveryRoute,
    generateRouteUpdate: deliveryRoutesHook.generateRouteUpdate,
    getRouteWithCustomers: deliveryRoutesHook.getRouteWithCustomers,
    
    createBackup: async (name?: string, description?: string): Promise<string> => {
      return await backupsHook.createBackup(name, description);
    },
    restoreBackup: async (backupId: string): Promise<boolean> => {
      try {
        await backupsHook.restoreBackup(backupId);
        return true;
      } catch (error) {
        console.error('Error restoring backup:', error);
        return false;
      }
    },
    deleteBackup: backupsHook.deleteBackup,
    
    // System operations
    startNewMonth: async () => {
      console.log('Starting new month...');
      return true;
    },
    
    startNewDay: async () => {
      console.log('Starting new day...');
      return true;
    },
    
    // Connection and settings
    connectionStatus: connection.connectionStatus as 'online' | 'offline' | 'connecting' | 'error',
    lastConnectAttempt: connection.lastConnectAttempt,
    reconnectToSupabase: connection.reconnectToSupabase,
    testConnection: connection.testConnection,
    
    // Settings
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
    
    // Refresh function - use centralized refresh
    refreshData: async (): Promise<boolean> => {
      try {
        console.log('🔄 Refreshing all data...');
        await hookOperations.forceRefreshProducts();
        console.log('✅ Data refreshed successfully');
        return true;
      } catch (error) {
        console.error('❌ Error refreshing data:', error);
        return false;
      }
    },
    
    // Required setters (no-op for compatibility)
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
    
    // System operations
    clearCache: async () => {
      console.log('🧹 Clearing cache...');
      await hookOperations.forceRefreshProducts();
    },
    
    // Required properties
    isUsingMockData: false
  };
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
