
import React from 'react';
import { ConnectionProvider } from './providers/ConnectionProvider';
import { DataLoadingProvider } from './providers/DataLoadingProvider';
import { AppDataProvider } from './providers/AppDataProvider';
import { AppContextInnerProvider } from './providers/AppContextInnerProvider';

// Contexto central da aplicação
export { AppContext } from './AppContextTypes';

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
