
import { useState, useEffect } from 'react';

/**
 * Hook for monitoring online/offline status for customer data
 */
export const useCustomerConnection = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      console.log("Connection status changed:", online ? "ONLINE" : "OFFLINE");
      setIsOnline(online);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  return { isOnline };
};

