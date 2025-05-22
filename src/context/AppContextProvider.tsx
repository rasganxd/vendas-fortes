
import React from 'react';
import { ConnectionProvider } from './providers/ConnectionProvider';
import { DataLoadingProvider } from './providers/DataLoadingProvider';
import { AppDataProvider } from './providers/AppDataProvider';
import { AppContextInnerProvider } from './providers/AppContextInnerProvider';

// Export the context from the dedicated file
export { AppContext } from './AppContext';

// Provider principal que combina todos os providers
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectionProvider>
      <DataLoadingProvider>
        <AppDataProvider>
          <AppContextInnerProvider>
            {children}
          </AppContextInnerProvider>
        </AppDataProvider>
      </DataLoadingProvider>
    </ConnectionProvider>
  );
};
