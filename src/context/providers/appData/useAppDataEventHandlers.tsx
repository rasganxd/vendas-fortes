
import { useEffect } from 'react';

export const useAppDataEventHandlers = (
  refreshData: () => Promise<boolean>,
  markOrderAsBeingEdited: (orderId: string) => void,
  unmarkOrderAsBeingEdited: (orderId: string) => void
) => {
  useEffect(() => {
    console.log('🔧 Setting up global data synchronization listeners');
    
    const handleDataSync = () => {
      console.log('🔄 Global data sync triggered');
      refreshData();
    };

    const handleOrderEditStarted = (event: CustomEvent) => {
      const { orderId } = event.detail;
      console.log('🔒 Order edit started:', orderId);
      markOrderAsBeingEdited(orderId);
    };

    const handleOrderEditFinished = (event: CustomEvent) => {
      const { orderId } = event.detail;
      console.log('🔓 Order edit finished:', orderId);
      unmarkOrderAsBeingEdited(orderId);
    };

    window.addEventListener('globalDataRefresh', handleDataSync);
    window.addEventListener('orderEditStarted', handleOrderEditStarted as EventListener);
    window.addEventListener('orderEditFinished', handleOrderEditFinished as EventListener);

    return () => {
      window.removeEventListener('globalDataRefresh', handleDataSync);
      window.removeEventListener('orderEditStarted', handleOrderEditStarted as EventListener);
      window.removeEventListener('orderEditFinished', handleOrderEditFinished as EventListener);
    };
  }, [refreshData, markOrderAsBeingEdited, unmarkOrderAsBeingEdited]);
};
