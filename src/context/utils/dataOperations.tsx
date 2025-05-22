
import { AppContextType } from '../AppContextTypes';
import defaultContextValues from '../defaultContextValues';

/**
 * Creates a wrapper for refreshData that returns void to match AppContextType
 */
export const createRefreshDataWrapper = (refreshData: () => Promise<boolean>): () => Promise<void> => {
  return async (): Promise<void> => {
    // Call the original refreshData but don't return its value
    await refreshData();
  };
};

/**
 * Creates the app context value from various hooks and data sources
 */
export const createAppContextValue = (
  defaultValues: AppContextType,
  appData: any,
  hooks: Record<string, any>,
  operations: Record<string, any>,
  refreshData: () => Promise<boolean>,
  clearCache: () => Promise<void>,
  connectionStatus: 'online' | 'offline' | 'connecting' | 'error',
  isUsingMockData: boolean
): AppContextType => {
  // Start with default values
  const contextValue: AppContextType = {
    ...defaultValues,
    
    // Add data properties
    ...appData,
    
    // Add operations
    ...operations,
    
    // System operations
    clearCache,
    refreshData, // Use the boolean-returning function directly
    
    // Status
    connectionStatus,
    isUsingMockData
  };
  
  return contextValue;
};

/**
 * Helper functions for data loading operations
 */
export const dataOperations = {
  clearItemCache: async (itemType: string): Promise<boolean> => {
    console.log(`Cache cleared for ${itemType}`);
    return true;
  },
  
  clearCache: async (): Promise<void> => {
    console.log('Cache cleared');
  },
  
  startNewMonth: async (): Promise<boolean> => {
    console.log('New month started');
    return true;
  },
  
  startNewDay: async (): Promise<boolean> => {
    console.log('New day started');
    return true;
  },
  
  applyThemeColor: (color: string): void => {
    if (!color) return;
    
    try {
      // Apply primary color
      document.documentElement.style.setProperty('--primary', color);
      document.documentElement.style.setProperty('--ring', color);
      document.documentElement.style.setProperty('--sidebar-primary', color);
    } catch (error) {
      console.error('Error applying theme color:', error);
    }
  }
};
