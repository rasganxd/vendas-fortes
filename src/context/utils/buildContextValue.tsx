
import { AppContextType } from '../AppContextTypes';

/**
 * Builds the complete AppContext value by combining various data sources
 */
export const buildContextValue = (
  appData: any,
  productOperations: any,
  customerOperations: any,
  systemOperations: any,
  hookOperations: any,
  refreshData: () => Promise<boolean>
): AppContextType => {
  return {
    // App data
    ...appData,
    
    // Setters that aren't in AppData
    setProductGroups: () => {},
    setProductCategories: () => {},
    setProductBrands: () => {},
    setDeliveryRoutes: () => {},
    
    // Operations by category
    ...customerOperations,
    ...productOperations,
    ...systemOperations,
    
    // Hook operations
    ...hookOperations,
    
    // System operations
    clearCache: async () => {
      await appData.refreshData();
    },
    
    // Use the boolean-returning refreshData directly
    refreshData: async () => {
      const result = await refreshData();
      return result;
    }
  };
};
