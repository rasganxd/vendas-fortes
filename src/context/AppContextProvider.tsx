
import React from 'react';
import { ConnectionProvider } from './providers/ConnectionProvider';
import { DataLoadingProvider } from './providers/DataLoadingProvider';
import { AppContextInnerProvider } from './providers/AppContextInnerProvider';

// App provider component that combines all providers
export const AppProvider = ({ children }: { children: React.ReactNode }) => {
  return (
    <ConnectionProvider>
      <DataLoadingProvider>
        <AppContextInnerProvider>
          {children}
        </AppContextInnerProvider>
      </DataLoadingProvider>
    </ConnectionProvider>
  );
};

// Export the context from AppContext.tsx
export { AppContext } from './AppContext';
