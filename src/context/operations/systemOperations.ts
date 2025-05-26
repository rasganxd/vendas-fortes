
import { useNotification } from '@/hooks/useNotification';
import { mobileSyncService } from '@/services/supabase/mobileSyncService';

export const useSystemOperations = () => {
  const { notification } = useNotification();

  const clearCache = () => {
    // Clear any local cache
    localStorage.removeItem('app-cache');
    notification.success('Cache limpo com sucesso');
  };

  const syncMobileData = async (salesRepId: string, deviceIp?: string) => {
    try {
      await mobileSyncService.logSyncEvent(salesRepId, 'download', 'web-admin', deviceIp);
      notification.success('Dados sincronizados com sucesso');
    } catch (error) {
      console.error('Error syncing mobile data:', error);
      notification.error('Erro ao sincronizar dados');
    }
  };

  const generateConnectionData = async (salesRepId: string) => {
    try {
      const connectionData = await mobileSyncService.generateConnectionData(salesRepId);
      console.log('Connection data generated with IP info:', connectionData);
      return connectionData;
    } catch (error) {
      console.error('Error generating connection data:', error);
      notification.error('Erro ao gerar dados de conexão');
      return null;
    }
  };

  return {
    clearCache,
    syncMobileData,
    generateConnectionData
  };
};
