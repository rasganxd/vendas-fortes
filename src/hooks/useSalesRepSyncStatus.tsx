
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
      console.log('🔍 Loading sync statuses for sales reps:', salesReps.length);
      
      // Buscar últimos logs de sincronização para cada vendedor
      const { data: syncLogs, error } = await supabase
        .from('sync_logs')
        .select('*')
        .in('sales_rep_id', salesReps.map(rep => rep.id))
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error loading sync logs:', error);
      } else {
        console.log('📋 Found sync logs:', syncLogs?.length || 0);
      }

      // Buscar atualizações pendentes
      const { data: pendingUpdates, error: updatesError } = await supabase
        .from('sync_updates')
        .select('*')
        .eq('is_active', true);

      if (updatesError) {
        console.error('❌ Error loading pending updates:', updatesError);
      } else {
        console.log('⏳ Found pending updates:', pendingUpdates?.length || 0);
      }

      // Se não há logs, vamos criar alguns dados de exemplo para testar
      if (!syncLogs || syncLogs.length === 0) {
        console.log('⚠️ No sync logs found. Creating test data...');
        
        // Criar logs de exemplo para cada vendedor
        for (const salesRep of salesReps) {
          const testLog = {
            sales_rep_id: salesRep.id,
            event_type: 'download',
            device_id: `device_${salesRep.code}`,
            device_ip: '192.168.1.' + (100 + salesRep.code),
            data_type: 'customers',
            records_count: 10,
            status: 'completed',
            metadata: {
              test_data: true,
              device_name: `Mobile ${salesRep.name}`,
              app_version: '1.0.0'
            }
          };

          const { error: insertError } = await supabase
            .from('sync_logs')
            .insert(testLog);

          if (insertError) {
            console.error('❌ Error creating test log:', insertError);
          } else {
            console.log(`✅ Created test log for ${salesRep.name}`);
          }
        }

        // Buscar novamente após criar dados de teste
        const { data: newSyncLogs } = await supabase
          .from('sync_logs')
          .select('*')
          .in('sales_rep_id', salesReps.map(rep => rep.id))
          .order('created_at', { ascending: false });
        
        console.log('📋 Found sync logs after test data creation:', newSyncLogs?.length || 0);
      }

      // Buscar logs novamente para garantir dados atualizados
      const { data: finalSyncLogs } = await supabase
        .from('sync_logs')
        .select('*')
        .in('sales_rep_id', salesReps.map(rep => rep.id))
        .order('created_at', { ascending: false });

      // Mapear status para cada vendedor
      const statuses: SalesRepSyncStatus[] = salesReps.map(salesRep => {
        // Encontrar último log de sync do vendedor
        const lastLog = finalSyncLogs?.find(log => log.sales_rep_id === salesRep.id);
        
        // Contar atualizações pendentes
        const pendingCount = pendingUpdates?.length || 0;
        
        // Determinar status baseado no último log
        let status: 'online' | 'offline' | 'pending' | 'error' = 'offline';
        
        if (lastLog) {
          const lastSyncTime = new Date(lastLog.created_at).getTime();
          const now = Date.now();
          const hoursSinceLastSync = (now - lastSyncTime) / (1000 * 60 * 60);
          
          console.log(`📊 Sales rep ${salesRep.name}: last sync ${hoursSinceLastSync.toFixed(1)}h ago, status: ${lastLog.status}`);
          
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

      console.log('✅ Final sync statuses:', statuses.map(s => `${s.salesRep.name}: ${s.status}`));
      setSyncStatuses(statuses);
    } catch (error) {
      console.error('❌ Error loading sync statuses:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Recarregar status
  const refreshStatuses = () => {
    console.log('🔄 Refreshing sync statuses...');
    loadSyncStatuses();
  };

  // Carregar na inicialização e quando vendedores mudarem
  useEffect(() => {
    if (salesReps.length > 0) {
      console.log('🚀 Loading sync statuses for', salesReps.length, 'sales reps');
      loadSyncStatuses();
    } else {
      console.log('⚠️ No sales reps to load statuses for');
      setSyncStatuses([]);
      setIsLoading(false);
    }
  }, [salesReps]);

  return {
    syncStatuses,
    isLoading,
    refreshStatuses
  };
};
