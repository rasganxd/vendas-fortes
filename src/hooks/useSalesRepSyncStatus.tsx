
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { supabase } from '@/integrations/supabase/client';

export interface SalesRepSyncStatus {
  salesRep: SalesRep;
  lastSyncAt?: string;
  deviceInfo?: any;
  status: 'online' | 'offline' | 'pending' | 'error';
  pendingUpdatesCount: number;
}

export const useSalesRepSyncStatus = (salesReps: SalesRep[]) => {
  const [syncStatuses, setSyncStatuses] = useState<SalesRepSyncStatus[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadSyncStatuses = async () => {
    try {
      setIsLoading(true);
      
      // Buscar últimos logs de sincronização para cada vendedor
      const { data: syncLogs, error } = await supabase
        .from('sync_logs')
        .select('*')
        .in('sales_rep_id', salesReps.map(rep => rep.id))
        .eq('event_type', 'download')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error loading sync logs:', error);
        return;
      }

      // Buscar atualizações pendentes
      const { data: pendingUpdates, error: updatesError } = await supabase
        .from('sync_updates')
        .select('*')
        .eq('is_active', true);

      if (updatesError) {
        console.error('Error loading pending updates:', updatesError);
        return;
      }

      // Mapear status para cada vendedor
      const statuses: SalesRepSyncStatus[] = salesReps.map(salesRep => {
        // Encontrar último log de sync do vendedor
        const lastLog = syncLogs?.find(log => log.sales_rep_id === salesRep.id);
        
        // Contar atualizações pendentes (para todos se não especificado vendedor específico)
        const pendingCount = pendingUpdates?.length || 0;
        
        // Determinar status baseado no último log
        let status: 'online' | 'offline' | 'pending' | 'error' = 'offline';
        
        if (lastLog) {
          const lastSyncTime = new Date(lastLog.created_at).getTime();
          const now = Date.now();
          const hoursSinceLastSync = (now - lastSyncTime) / (1000 * 60 * 60);
          
          if (lastLog.status === 'failed') {
            status = 'error';
          } else if (pendingCount > 0) {
            status = 'pending';
          } else if (hoursSinceLastSync < 24) {
            status = 'online';
          } else {
            status = 'offline';
          }
        } else if (pendingCount > 0) {
          status = 'pending';
        }

        return {
          salesRep,
          lastSyncAt: lastLog?.created_at,
          deviceInfo: lastLog?.metadata,
          status,
          pendingUpdatesCount: pendingCount
        };
      });

      setSyncStatuses(statuses);
    } catch (error) {
      console.error('Error loading sync statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recarregar status
  const refreshStatuses = () => {
    loadSyncStatuses();
  };

  // Carregar na inicialização e quando vendedores mudarem
  useEffect(() => {
    if (salesReps.length > 0) {
      loadSyncStatuses();
    }
  }, [salesReps]);

  return {
    syncStatuses,
    isLoading,
    refreshStatuses
  };
};
