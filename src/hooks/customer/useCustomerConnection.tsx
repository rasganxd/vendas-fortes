
import { useConnection } from '@/context/providers/ConnectionProvider';

/**
 * Hook for monitoring online/offline status for customer data
 */
export const useCustomerConnection = () => {
  const { isOnline, connectionStatus } = useConnection();
  
  return { isOnline, connectionStatus };
};
