
import React, { createContext, useState, useEffect, useContext } from 'react';
import { useFirebaseConnection } from '@/hooks/useFirebaseConnection';

type ConnectionStatus = 'online' | 'offline' | 'connecting' | 'error';

interface ConnectionContextType {
  isOnline: boolean;
  connectionStatus: ConnectionStatus;
  reconnect: () => Promise<void>;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isOnline: true,
  connectionStatus: 'online',
  reconnect: async () => {}
});

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider = ({ children }: { children: React.ReactNode }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [connectionStatus, setConnectionStatus] = useState<ConnectionStatus>(navigator.onLine ? 'online' : 'offline');
  
  const {
    connectionStatus: firebaseStatus,
    reconnectToFirebase
  } = useFirebaseConnection();
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      console.log("Connection status changed:", online ? "ONLINE" : "OFFLINE");
      setIsOnline(online);
      
      if (online) {
        setConnectionStatus('connecting');
      } else {
        setConnectionStatus('offline');
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // Update connection status based on Firebase connection
  useEffect(() => {
    if (firebaseStatus === 'connected') {
      setConnectionStatus('online');
    } else if (firebaseStatus === 'disconnected') {
      setConnectionStatus(navigator.onLine ? 'connecting' : 'offline');
    } else if (firebaseStatus === 'error') {
      setConnectionStatus('error');
    } else if (firebaseStatus === 'connecting') {
      setConnectionStatus('connecting');
    }
  }, [firebaseStatus]);
  
  // Function to attempt reconnection
  const reconnect = async () => {
    setConnectionStatus('connecting');
    try {
      await reconnectToFirebase();
    } catch (error) {
      console.error("Error reconnecting:", error);
      setConnectionStatus('error');
    }
  };
  
  return (
    <ConnectionContext.Provider value={{
      isOnline,
      connectionStatus,
      reconnect
    }}>
      {children}
    </ConnectionContext.Provider>
  );
};
