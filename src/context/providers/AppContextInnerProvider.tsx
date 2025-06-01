
import React from 'react';
import { AppContext } from '../AppContext';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { useConnection } from './ConnectionProvider';
import { useOptimizedAppData } from '@/hooks/useOptimizedAppData';
import { useOptimizedEventListeners } from '@/hooks/useOptimizedEventListeners';
import { useAppSettings } from '@/hooks/useAppSettings';
import { useProductGroups } from '@/hooks/useProductGroups';
import { useProductCategories } from '@/hooks/useProductCategories';
import { useProductBrands } from '@/hooks/useProductBrands';
import { useDeliveryRoutes } from '@/hooks/useDeliveryRoutes';
import { useBackups } from '@/hooks/useBackups';

/**
 * Optimized inner provider for the AppContext
 * Eliminates duplications and improves performance
 */
export const AppContextInnerProvider = ({ children }: { children: React.ReactNode }) => {
  // Get connection status
  const connection = useConnection();
  
  // Get optimized app data (products, orders, customers, salesReps)
  const {
    products,
    orders,
    customers,
    salesReps,
    isLoading: isLoadingOptimized,
    refreshData: optimizedRefreshData,
    isCacheValid
  } = useOptimizedAppData();
  
  // Get hooks for other operations
  const hookOperations = useAppContextHooks();

  // Get settings
  const { settings, updateSettings: updateSettingsHook } = useAppSettings();

  // Get additional data that was missing
  const productGroupsHook = useProductGroups();
  const productCategoriesHook = useProductCategories();
  const productBrandsHook = useProductBrands();
  const deliveryRoutesHook = useDeliveryRoutes();
  const backupsHook = useBackups();

  // Wrap updateSettings to match expected return type
  const updateSettings = async (newSettings: Partial<typeof settings>) => {
    await updateSettingsHook(newSettings);
  };

  // Setup optimized event listeners
  useOptimizedEventListeners([
    {
      event: 'productsUpdated',
      handler: () => {
        if (!isCacheValid) {
          optimizedRefreshData();
        }
      }
    },
    {
      event: 'ordersUpdated', 
      handler: () => {
        if (!isCacheValid) {
          optimizedRefreshData();
        }
      }
    },
    {
      event: 'mobileOrdersUpdated',
      handler: () => {
        optimizedRefreshData();
      }
    }
  ]);

  // Initialize theme
  useThemeInitializer(settings?.theme?.primaryColor || '#3b82f6');

  // Build the context value with all required properties
  const contextValue = {
    // Optimized core data
    products,
    orders,
    customers,
    salesReps,
    isLoadingProducts: isLoadingOptimized,
    isLoadingOrders: isLoadingOptimized,
    isLoadingCustomers: isLoadingOptimized,
    isLoadingSalesReps: isLoadingOptimized,
    
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
    
    // Hook operations
    ...hookOperations,
    
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
    
    createBackup: backupsHook.createBackup,
    restoreBackup: backupsHook.restoreBackup,
    deleteBackup: backupsHook.deleteBackup,
    
    // Product operations that might be missing
    validateProductDiscount: (productId: string, discountedPrice: number) => {
      const product = products.find(p => p.id === productId);
      if (!product) return "Produto não encontrado";
      
      const maxDiscount = product.maxDiscountPercentage || 0;
      const minPrice = product.price * (1 - maxDiscount / 100);
      
      if (discountedPrice < minPrice) {
        return `Preço mínimo permitido: R$ ${minPrice.toFixed(2)}`;
      }
      
      return true;
    },
    
    getMinimumPrice: (productId: string) => {
      const product = products.find(p => p.id === productId);
      if (!product) return 0;
      
      const maxDiscount = product.maxDiscountPercentage || 0;
      return product.price * (1 - maxDiscount / 100);
    },
    
    addBulkProducts: async (products: any[]) => {
      // Placeholder implementation
      console.log('addBulkProducts called with:', products.length, 'products');
      return [];
    },
    
    // System operations that might be missing
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
    
    // Optimized refresh
    refreshData: optimizedRefreshData,
    
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
      await optimizedRefreshData();
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
