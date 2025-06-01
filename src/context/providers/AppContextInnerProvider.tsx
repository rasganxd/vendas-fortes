
import React from 'react';
import { AppContext } from '../AppContext';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { useConnection } from './ConnectionProvider';
import { useOptimizedAppData } from '@/hooks/useOptimizedAppData';
import { useOptimizedEventListeners } from '@/hooks/useOptimizedEventListeners';
import { useAppSettings } from '@/hooks/useAppSettings';

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

  // Build the context value with optimized data
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
    
    // Hook operations
    ...hookOperations,
    
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
