
import React, { createContext, useContext } from 'react';
import { useSupabaseConnection } from '@/hooks/useSupabaseConnection';

interface ConnectionContextType {
  connectionStatus: 'connecting' | 'connected' | 'disconnected' | 'error';
  lastConnectAttempt: Date | null;
  reconnectToSupabase: () => Promise<void>;
  testConnection: () => Promise<boolean>;
  reconnect: () => Promise<void>;
  isOnline: boolean;
}

const ConnectionContext = createContext<ConnectionContextType | undefined>(undefined);

export const useConnection = () => {
  const context = useContext(ConnectionContext);
  if (context === undefined) {
    throw new Error('useConnection must be used within a ConnectionProvider');
  }
  return context;
};

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const connection = useSupabaseConnection();

  // isOnline should be true if browser is online AND connection is not in error/disconnected state
  // This allows operations during 'connecting' state to proceed
  const isOnline = navigator.onLine && connection.connectionStatus !== 'disconnected' && connection.connectionStatus !== 'error';

  console.log('🌐 [ConnectionProvider] Connection state:', {
    navigatorOnline: navigator.onLine,
    connectionStatus: connection.connectionStatus,
    isOnline
  });

  const connectionValue: ConnectionContextType = {
    ...connection,
    reconnect: connection.reconnectToSupabase,
    isOnline
  };

  return (
    <ConnectionContext.Provider value={connectionValue}>
      {children}
    </ConnectionContext.Provider>
  );
};
