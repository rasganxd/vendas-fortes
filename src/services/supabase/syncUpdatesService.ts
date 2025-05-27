
import { supabase } from '@/integrations/supabase/client';

export interface SyncUpdate {
  id: string;
  created_at: string;
  updated_at: string;
  is_active: boolean;
  data_types: string[];
  description?: string;
  metadata?: any;
  created_by_user?: string;
  completed_at?: string;
}

class SyncUpdatesService {
  // Create a new sync update (Desktop action)
  async createSyncUpdate(
    description: string = 'Dados força de vendas atualizados',
    dataTypes: string[] = ['customers', 'products', 'payment_tables'],
    createdByUser?: string
  ): Promise<SyncUpdate> {
    try {
      console.log('🔄 Creating new sync update...');
      
      // Deactivate any existing active updates
      await this.deactivateAllUpdates();
      
      const { data, error } = await supabase
        .from('sync_updates')
        .insert({
          is_active: true,
          data_types: dataTypes,
          description,
          created_by_user: createdByUser,
          metadata: {
            timestamp: new Date().toISOString(),
            data_count: {
              customers: 0,
              products: 0,
              payment_tables: 0
            }
          }
        })
        .select()
        .single();

      if (error) {
        console.error('❌ Error creating sync update:', error);
        throw error;
      }

      console.log('✅ Sync update created successfully:', data.id);
      return data;
    } catch (error) {
      console.error('❌ Failed to create sync update:', error);
      throw error;
    }
  }

  // Check for active updates (Mobile action)
  async checkForActiveUpdates(): Promise<SyncUpdate | null> {
    try {
      console.log('🔍 Checking for active sync updates...');
      
      const { data, error } = await supabase
        .from('sync_updates')
        .select('*')
        .eq('is_active', true)
        .order('created_at', { ascending: false })
        .limit(1)
        .maybeSingle();

      if (error) {
        console.error('❌ Error checking for active updates:', error);
        throw error;
      }

      if (data) {
        console.log('✅ Active sync update found:', data.id);
      } else {
        console.log('ℹ️ No active sync updates found');
      }

      return data;
    } catch (error) {
      console.error('❌ Failed to check for active updates:', error);
      throw error;
    }
  }

  // Mark sync update as completed (Mobile action after successful sync)
  async completeSyncUpdate(updateId: string): Promise<void> {
    try {
      console.log('✅ Marking sync update as completed:', updateId);
      
      const { error } = await supabase
        .from('sync_updates')
        .update({
          is_active: false,
          completed_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', updateId);

      if (error) {
        console.error('❌ Error completing sync update:', error);
        throw error;
      }

      console.log('✅ Sync update marked as completed');
    } catch (error) {
      console.error('❌ Failed to complete sync update:', error);
      throw error;
    }
  }

  // Deactivate all active updates
  async deactivateAllUpdates(): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_updates')
        .update({
          is_active: false,
          updated_at: new Date().toISOString()
        })
        .eq('is_active', true);

      if (error) {
        console.error('❌ Error deactivating updates:', error);
        throw error;
      }

      console.log('✅ All active updates deactivated');
    } catch (error) {
      console.error('❌ Failed to deactivate updates:', error);
      throw error;
    }
  }

  // Get sync updates history
  async getSyncUpdatesHistory(limit: number = 10): Promise<SyncUpdate[]> {
    try {
      console.log('📋 Fetching sync updates history...');
      
      const { data, error } = await supabase
        .from('sync_updates')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching sync updates history:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} sync updates`);
      return data || [];
    } catch (error) {
      console.error('❌ Failed to fetch sync updates history:', error);
      throw error;
    }
  }
}

export const syncUpdatesService = new SyncUpdatesService();
