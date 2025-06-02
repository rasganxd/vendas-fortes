
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

  const connectionValue: ConnectionContextType = {
    ...connection,
    reconnect: connection.reconnectToSupabase,
    isOnline: navigator.onLine && connection.connectionStatus === 'connected'
  };

  return (
    <ConnectionContext.Provider value={connectionValue}>
      {children}
    </ConnectionContext.Provider>
  );
};
