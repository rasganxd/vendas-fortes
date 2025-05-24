
import { useConnection } from '@/context/providers/ConnectionProvider';

export const useOnlineStatus = (): 'online' | 'offline' => {
  const { connectionStatus } = useConnection();
  
  // Map the connection status to online/offline
  return connectionStatus === 'connected' ? 'online' : 'offline';
};
