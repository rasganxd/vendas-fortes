
import { useNotification } from '@/hooks/useNotification';
import { mobileSyncService } from '@/services/supabase/mobileSyncService';

export const useSystemOperations = () => {
  const { notification } = useNotification();

  const clearCache = () => {
    // Clear any local cache
    localStorage.removeItem('app-cache');
    notification.success('Cache limpo com sucesso');
  };

  const syncMobileData = async (salesRepId: string) => {
    try {
      await mobileSyncService.logSyncEvent(salesRepId, 'download', 'web-admin');
      notification.success('Dados sincronizados com sucesso');
    } catch (error) {
      console.error('Error syncing mobile data:', error);
      notification.error('Erro ao sincronizar dados');
    }
  };

  return {
    clearCache,
    syncMobileData
  };
};
