
import React, { createContext, useContext, useState, useEffect } from 'react';

export type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'error';

interface ConnectionContextType {
  connectionStatus: ConnectionStatus;
  lastConnectAttempt?: Date;
  reconnect?: () => Promise<void>;
  reconnectToSupabase?: () => Promise<void>;
  testConnection?: () => Promise<boolean>;
}

const ConnectionContext = createContext<ConnectionContextType>({
  connectionStatus: 'online'
});

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>('online');
  const [lastConnectAttempt, setLastConnectAttempt] = useState<Date>();

  const testConnection = async (): Promise<boolean> => {
    try {
      setConnectionStatus('connecting');
      setLastConnectAttempt(new Date());
      
      // Simple connectivity test
      const response = await fetch('/api/health', { 
        method: 'HEAD',
        signal: AbortSignal.timeout(5000)
      });
      
      if (response.ok) {
        setConnectionStatus('online');
        return true;
      } else {
        setConnectionStatus('error');
        return false;
      }
    } catch (error) {
      console.error('Connection test failed:', error);
      setConnectionStatus('offline');
      return false;
    }
  };

  const reconnect = async () => {
    await testConnection();
  };

  const reconnectToSupabase = async () => {
    await testConnection();
  };

  useEffect(() => {
    // Initial connection test
    testConnection();

    // Set up periodic connection checks
    const interval = setInterval(testConnection, 30000); // Check every 30 seconds

    // Listen for online/offline events
    const handleOnline = () => setConnectionStatus('online');
    const handleOffline = () => setConnectionStatus('offline');

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      clearInterval(interval);
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  const value = {
    connectionStatus,
    lastConnectAttempt,
    reconnect,
    reconnectToSupabase,
    testConnection
  };

  return (
    <ConnectionContext.Provider value={value}>
      {children}
    </ConnectionContext.Provider>
  );
};
