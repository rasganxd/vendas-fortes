
import { useState, useEffect } from 'react';
import { syncUpdatesService, SyncUpdate } from '@/services/supabase/syncUpdatesService';

export const useSyncUpdatesHistory = () => {
  const [syncHistory, setSyncHistory] = useState<SyncUpdate[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchSyncHistory = async () => {
    try {
      setIsLoading(true);
      setError(null);
      const history = await syncUpdatesService.getSyncUpdatesHistory(5);
      setSyncHistory(history);
    } catch (error) {
      console.error('Erro ao buscar histórico de sincronização:', error);
      setError(error instanceof Error ? error.message : 'Erro desconhecido');
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchSyncHistory();
  }, []);

  const refreshHistory = () => {
    fetchSyncHistory();
  };

  const getLastSyncActivation = () => {
    return syncHistory.length > 0 ? syncHistory[0] : null;
  };

  return {
    syncHistory,
    isLoading,
    error,
    refreshHistory,
    getLastSyncActivation
  };
};
