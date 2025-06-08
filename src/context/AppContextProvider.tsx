
import React from 'react';
import { ConnectionProvider } from './providers/ConnectionProvider';
import { DataLoadingProvider } from './providers/DataLoadingProvider';
import { AppDataProvider } from './providers/AppDataProvider';
import { AppContextInnerProvider } from './providers/AppContextInnerProvider';

// App provider component that combines all providers
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

// Export the context from AppContext.tsx
export { AppContext } from './AppContext';
