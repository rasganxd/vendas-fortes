
import { supabase } from '@/integrations/supabase/client';

export interface SyncUpdate {
  id: string;
  data_types: string[];
  description?: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
  completed_at?: string;
  created_by_user?: string;
  metadata?: any;
}

export interface SyncUpdateResult {
  success: boolean;
  updateId?: string;
  error?: string;
}

class SyncUpdateService {
  // Criar uma nova atualização para mobile
  async createSyncUpdate(
    dataTypes: string[], 
    description?: string,
    createdByUser?: string
  ): Promise<SyncUpdateResult> {
    try {
      console.log('🔄 Creating sync update for mobile:', { dataTypes, description });

      const { data, error } = await supabase
        .from('sync_updates')
        .insert({
          data_types: dataTypes,
          description: description || `Atualização de ${dataTypes.join(', ')}`,
          is_active: true, // Manter ativo até consumo real
          created_by_user: createdByUser || 'desktop',
          metadata: {
            created_from: 'desktop',
            target: 'mobile',
            timestamp: new Date().toISOString()
          }
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating sync update:', error);
        return { success: false, error: error.message };
      }

      console.log('✅ Sync update created successfully:', data.id);
      
      // Log da criação
      await this.logSyncEvent('create', dataTypes, data.id, createdByUser);
      
      return { success: true, updateId: data.id };
    } catch (error) {
      console.error('❌ Failed to create sync update:', error);
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error' 
      };
    }
  }

  // Buscar atualizações ativas para mobile
  async getActiveSyncUpdates(): Promise<SyncUpdate[]> {
    try {
      console.log('📱 Fetching active sync updates for mobile...');

      const { data, error } = await supabase
        .from('sync_updates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching sync updates:', error);
        throw error;
      }

      console.log(`✅ Found ${data?.length || 0} active sync updates`);
      return data || [];
    } catch (error) {
      console.error('❌ Failed to fetch sync updates:', error);
      throw error;
    }
  }

  // Marcar atualização como consumida (apenas após confirmação real)
  async markSyncUpdateAsConsumed(
    updateId: string, 
    consumedBy?: string,
    deviceId?: string
  ): Promise<boolean> {
    try {
      console.log('✅ Marking sync update as consumed:', updateId);

      const { error } = await supabase
        .from('sync_updates')
        .update({
          is_active: false,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
          metadata: {
            consumed_by: consumedBy || 'mobile',
            consumed_at: new Date().toISOString(),
            device_id: deviceId
          }
        })
        .eq('id', updateId);

      if (error) {
        console.error('❌ Error marking sync update as consumed:', error);
        return false;
      }

      // Log do consumo
      await this.logSyncEvent('consume', [], updateId, consumedBy, deviceId);
      
      console.log('✅ Sync update marked as consumed successfully');
      return true;
    } catch (error) {
      console.error('❌ Failed to mark sync update as consumed:', error);
      return false;
    }
  }

  // Reativar atualizações órfãs (não consumidas há muito tempo)
  async reactivateOrphanedUpdates(olderThanHours: number = 24): Promise<number> {
    try {
      console.log(`🔄 Reactivating orphaned sync updates older than ${olderThanHours} hours...`);

      const cutoffTime = new Date(Date.now() - olderThanHours * 60 * 60 * 1000).toISOString();

      const { data, error } = await supabase
        .from('sync_updates')
        .update({
          is_active: true,
          updated_at: new Date().toISOString(),
          metadata: {
            reactivated_at: new Date().toISOString(),
            reactivated_reason: 'orphaned_update'
          }
        })
        .eq('is_active', false)
        .is('completed_at', null)
        .lt('created_at', cutoffTime)
        .select();

      if (error) {
        console.error('❌ Error reactivating orphaned updates:', error);
        return 0;
      }

      const reactivatedCount = data?.length || 0;
      console.log(`✅ Reactivated ${reactivatedCount} orphaned sync updates`);
      
      return reactivatedCount;
    } catch (error) {
      console.error('❌ Failed to reactivate orphaned updates:', error);
      return 0;
    }
  }

  // Log de eventos de sync
  private async logSyncEvent(
    eventType: 'create' | 'consume' | 'reactivate',
    dataTypes: string[],
    updateId: string,
    userId?: string,
    deviceId?: string
  ): Promise<void> {
    try {
      await supabase
        .from('sync_logs')
        .insert({
          event_type: eventType === 'create' ? 'upload' : 'download',
          data_type: dataTypes.join(',') || 'sync_update',
          status: 'completed',
          metadata: {
            sync_update_id: updateId,
            event_type: eventType,
            user_id: userId,
            device_id: deviceId,
            timestamp: new Date().toISOString()
          }
        });
    } catch (error) {
      console.error('❌ Failed to log sync event:', error);
    }
  }

  // Obter estatísticas de sync
  async getSyncStats(): Promise<{
    activeUpdates: number;
    consumedUpdates: number;
    orphanedUpdates: number;
  }> {
    try {
      const [activeResult, consumedResult, orphanedResult] = await Promise.all([
        supabase
          .from('sync_updates')
          .select('id', { count: 'exact' })
          .eq('is_active', true),
        
        supabase
          .from('sync_updates')
          .select('id', { count: 'exact' })
          .eq('is_active', false)
          .not('completed_at', 'is', null),
        
        supabase
          .from('sync_updates')
          .select('id', { count: 'exact' })
          .eq('is_active', false)
          .is('completed_at', null)
      ]);

      return {
        activeUpdates: activeResult.count || 0,
        consumedUpdates: consumedResult.count || 0,
        orphanedUpdates: orphanedResult.count || 0
      };
    } catch (error) {
      console.error('❌ Failed to get sync stats:', error);
      return { activeUpdates: 0, consumedUpdates: 0, orphanedUpdates: 0 };
    }
  }
}

export const syncUpdateService = new SyncUpdateService();
