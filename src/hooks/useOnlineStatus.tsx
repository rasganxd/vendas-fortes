
import { useState, useEffect } from 'react';

/**
 * Hook for monitoring online/offline status
 * @returns boolean - true if online, false if offline
 */
export const useOnlineStatus = () => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  
  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      setIsOnline(navigator.onLine);
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  return isOnline;
};
