
import { supabase } from '@/integrations/supabase/client';
import { Customer, Product, Order } from '@/types';

export interface SyncLogEntry {
  id: string;
  sales_rep_id?: string;
  event_type: 'upload' | 'download' | 'error';
  device_id?: string;
  device_ip?: string;
  data_type?: string;
  records_count?: number;
  status: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

export interface SyncToken {
  token: string;
  expires_at: string;
}

class MobileSyncService {
  // Generate sync token for mobile authentication
  async generateSyncToken(
    salesRepId: string, 
    deviceId?: string, 
    deviceIp?: string,
    expiresMinutes: number = 60
  ): Promise<SyncToken> {
    try {
      console.log('🔑 Generating sync token for sales rep:', salesRepId);
      
      const { data, error } = await supabase.rpc('generate_sync_token', {
        p_sales_rep_id: salesRepId,
        p_project_type: 'mobile',
        p_device_id: deviceId,
        p_device_ip: deviceIp,
        p_expires_minutes: expiresMinutes
      });

      if (error) {
        console.error('❌ Error generating sync token:', error);
        throw error;
      }

      console.log('✅ Sync token generated successfully');
      return data[0];
    } catch (error) {
      console.error('❌ Failed to generate sync token:', error);
      throw error;
    }
  }

  // Validate sync token
  async validateSyncToken(token: string): Promise<string | null> {
    try {
      const { data, error } = await supabase
        .from('sync_tokens')
        .select('sales_rep_id')
        .eq('token', token)
        .eq('active', true)
        .gt('expires_at', new Date().toISOString())
        .single();

      if (error || !data) {
        console.log('❌ Invalid or expired sync token');
        return null;
      }

      return data.sales_rep_id;
    } catch (error) {
      console.error('❌ Error validating sync token:', error);
      return null;
    }
  }

  // Get sync logs
  async getSyncLogs(): Promise<SyncLogEntry[]> {
    try {
      console.log('📋 Fetching sync logs...');
      
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('❌ Error fetching sync logs:', error);
        throw error;
      }

      console.log(`✅ Retrieved ${data?.length || 0} sync logs`);
      return data || [];
    } catch (error) {
      console.error('❌ Failed to fetch sync logs:', error);
      throw error;
    }
  }

  // Clear sync logs
  async clearSyncLogs(): Promise<void> {
    try {
      console.log('🗑️ Clearing sync logs...');
      
      const { error } = await supabase
        .from('sync_logs')
        .delete()
        .neq('id', '00000000-0000-0000-0000-000000000000'); // Delete all records

      if (error) {
        console.error('❌ Error clearing sync logs:', error);
        throw error;
      }

      console.log('✅ Sync logs cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear sync logs:', error);
      throw error;
    }
  }

  // Log sync event
  async logSyncEvent(
    eventType: 'upload' | 'download' | 'error',
    dataType: string,
    recordsCount: number = 0,
    salesRepId?: string,
    deviceId?: string,
    deviceIp?: string,
    errorMessage?: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_logs')
        .insert({
          sales_rep_id: salesRepId || null,
          event_type: eventType,
          device_id: deviceId,
          device_ip: deviceIp,
          data_type: dataType,
          records_count: recordsCount,
          status: eventType === 'error' ? 'failed' : 'completed',
          error_message: errorMessage,
          metadata: metadata
        });

      if (error) {
        console.error('❌ Error logging sync event:', error);
        throw error;
      }
    } catch (error) {
      console.error('❌ Failed to log sync event:', error);
    }
  }

  // Sync all data (manual trigger)
  async syncAllData(): Promise<void> {
    try {
      console.log('🔄 Starting manual sync...');
      
      // Get current data counts
      const [customersResult, productsResult, ordersResult] = await Promise.all([
        supabase.from('customers').select('id', { count: 'exact', head: true }),
        supabase.from('products').select('id', { count: 'exact', head: true }),
        supabase.from('orders').select('id', { count: 'exact', head: true })
      ]);

      const customerCount = customersResult.count || 0;
      const productCount = productsResult.count || 0;
      const orderCount = ordersResult.count || 0;

      // Log sync events
      await Promise.all([
        this.logSyncEvent('download', 'customers', customerCount),
        this.logSyncEvent('download', 'products', productCount),
        this.logSyncEvent('download', 'orders', orderCount)
      ]);

      console.log('✅ Manual sync completed');
    } catch (error) {
      console.error('❌ Manual sync failed:', error);
      await this.logSyncEvent('error', 'manual_sync', 0, undefined, undefined, undefined, 
        error instanceof Error ? error.message : 'Unknown error');
      throw error;
    }
  }

  // Get customers for mobile sync
  async getCustomersForSync(salesRepId?: string): Promise<Customer[]> {
    try {
      let query = supabase
        .from('customers')
        .select('*')
        .eq('active', true);

      if (salesRepId) {
        query = query.eq('sales_rep_id', salesRepId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching customers for sync:', error);
        throw error;
      }

      await this.logSyncEvent('download', 'customers', data?.length || 0, salesRepId);
      return data || [];
    } catch (error) {
      console.error('❌ Failed to get customers for sync:', error);
      throw error;
    }
  }

  // Get products for mobile sync
  async getProductsForSync(): Promise<Product[]> {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*')
        .order('name');

      if (error) {
        console.error('❌ Error fetching products for sync:', error);
        throw error;
      }

      await this.logSyncEvent('download', 'products', data?.length || 0);
      return data || [];
    } catch (error) {
      console.error('❌ Failed to get products for sync:', error);
      throw error;
    }
  }

  // Upload orders from mobile
  async uploadOrders(orders: Partial<Order>[], salesRepId?: string): Promise<void> {
    try {
      console.log('📤 Uploading orders from mobile:', orders.length);

      if (orders.length === 0) {
        return;
      }

      const { error } = await supabase
        .from('orders')
        .insert(orders.map(order => ({
          ...order,
          source_project: 'mobile',
          sync_status: 'synced',
          sales_rep_id: salesRepId || order.sales_rep_id
        })));

      if (error) {
        console.error('❌ Error uploading orders:', error);
        await this.logSyncEvent('error', 'orders', orders.length, salesRepId, 
          undefined, undefined, error.message);
        throw error;
      }

      await this.logSyncEvent('upload', 'orders', orders.length, salesRepId);
      console.log('✅ Orders uploaded successfully');
    } catch (error) {
      console.error('❌ Failed to upload orders:', error);
      throw error;
    }
  }

  // Upload customers from mobile
  async uploadCustomers(customers: Partial<Customer>[], salesRepId?: string): Promise<void> {
    try {
      console.log('📤 Uploading customers from mobile:', customers.length);

      if (customers.length === 0) {
        return;
      }

      const { error } = await supabase
        .from('customers')
        .insert(customers.map(customer => ({
          ...customer,
          sales_rep_id: salesRepId || customer.sales_rep_id
        })));

      if (error) {
        console.error('❌ Error uploading customers:', error);
        await this.logSyncEvent('error', 'customers', customers.length, salesRepId,
          undefined, undefined, error.message);
        throw error;
      }

      await this.logSyncEvent('upload', 'customers', customers.length, salesRepId);
      console.log('✅ Customers uploaded successfully');
    } catch (error) {
      console.error('❌ Failed to upload customers:', error);
      throw error;
    }
  }

  // Cleanup expired tokens
  async cleanupExpiredTokens(): Promise<number> {
    try {
      const { data, error } = await supabase.rpc('cleanup_expired_tokens');

      if (error) {
        console.error('❌ Error cleaning up expired tokens:', error);
        throw error;
      }

      console.log(`✅ Cleaned up ${data} expired tokens`);
      return data || 0;
    } catch (error) {
      console.error('❌ Failed to cleanup expired tokens:', error);
      throw error;
    }
  }
}

export const mobileSyncService = new MobileSyncService();
