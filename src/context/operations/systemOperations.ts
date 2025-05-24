
import { useNotification } from '@/hooks/useNotification';
import { mobileSyncService } from '@/services/supabase/mobileSyncService';

export const useSystemOperations = () => {
  const { addNotification } = useNotification();

  const clearCache = () => {
    // Clear any local cache
    localStorage.removeItem('app-cache');
    addNotification('Cache limpo com sucesso', 'success');
  };

  const syncMobileData = async (salesRepId: string) => {
    try {
      await mobileSyncService.logSyncEvent(salesRepId, 'download', 'web-admin');
      addNotification('Dados sincronizados com sucesso', 'success');
    } catch (error) {
      console.error('Error syncing mobile data:', error);
      addNotification('Erro ao sincronizar dados', 'error');
    }
  };

  return {
    clearCache,
    syncMobileData
  };
};
