
import React from 'react';
import { AppContext } from '../AppContext';
import { useAppData } from './AppDataProvider';
import { useAppOperations } from '../operations/appOperations';
import { useAppContextHooks } from '@/hooks/useAppContextHooks';
import { useThemeInitializer } from '@/hooks/useThemeInitializer';
import { buildContextValue } from '../utils/buildContextValue';

/**
 * Inner provider for the AppContext
 * Combines data and operations from various sources into a unified context
 */
export const AppContextInnerProvider = ({ children }: { children: React.ReactNode }) => {
  // Get app data from provider
  const appData = useAppData();
  
  // Get operations
  const { productOperations, customerOperations, systemOperations } = useAppOperations();
  
  // Get hooks for various data operations
  const hookOperations = useAppContextHooks();
  
  // Initialize theme
  useThemeInitializer(appData.settings?.primaryColor);
  
  // Build the full context value
  const contextValue = buildContextValue(
    appData,
    productOperations,
    customerOperations,
    systemOperations,
    hookOperations,
    appData.refreshData
  );
  
  return (
    <AppContext.Provider value={contextValue}>
      {children}
    </AppContext.Provider>
  );
};
