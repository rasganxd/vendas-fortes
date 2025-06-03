
import { supabase } from '@/integrations/supabase/client';
import { Customer, Product, Order } from '@/types';
import { transformCustomerData, transformProductData, transformOrderData } from '@/utils/dataTransformers';

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

export interface OrderImportResponse {
  success: boolean;
  message: string;
  results: {
    imported: number;
    failed: number;
    errors: string[];
  };
}

export interface SyncDataResponse {
  success: boolean;
  data: {
    products: Product[];
    customers: Customer[];
    sync_timestamp: string;
    summary: {
      products_updated: number;
      customers_updated: number;
    };
  };
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

  // Get sync data using new edge function
  async getSyncData(salesRepId: string, lastSync?: string): Promise<SyncDataResponse> {
    try {
      console.log('📥 Getting sync data for sales rep:', salesRepId);

      const { data, error } = await supabase.functions.invoke('mobile-sync', {
        body: {
          action: 'get_sync_data',
          sales_rep_id: salesRepId,
          last_sync: lastSync
        }
      });

      if (error) {
        console.error('❌ Error calling sync function:', error);
        throw error;
      }

      console.log('✅ Sync data retrieved successfully');
      return data as SyncDataResponse;

    } catch (error) {
      console.error('❌ Failed to get sync data:', error);
      throw error;
    }
  }

  // Upload orders using new edge function
  async uploadOrders(orders: Partial<Order>[], salesRepId: string): Promise<OrderImportResponse> {
    try {
      console.log('📤 Uploading orders via mobile sync function:', orders.length);

      const { data, error } = await supabase.functions.invoke('mobile-sync', {
        body: {
          action: 'upload_orders',
          orders: orders,
          sales_rep_id: salesRepId
        }
      });

      if (error) {
        console.error('❌ Error calling upload function:', error);
        throw error;
      }

      console.log('✅ Orders uploaded successfully');
      return {
        success: data.success,
        message: data.message,
        results: {
          imported: data.uploaded,
          failed: data.failed,
          errors: data.errors || []
        }
      };

    } catch (error) {
      console.error('❌ Failed to upload orders:', error);
      throw error;
    }
  }

  // Get sync statistics using new edge function
  async getSyncStatistics(): Promise<any[]> {
    try {
      console.log('📊 Getting sync statistics');

      const { data, error } = await supabase.functions.invoke('mobile-sync', {
        body: {
          action: 'get_statistics'
        }
      });

      if (error) {
        console.error('❌ Error calling statistics function:', error);
        throw error;
      }

      console.log('✅ Statistics retrieved successfully');
      return data.statistics || [];

    } catch (error) {
      console.error('❌ Failed to get sync statistics:', error);
      throw error;
    }
  }

  // Import orders from mobile using enhanced function
  async importOrdersFromMobile(
    salesRepId?: string,
    importedBy: string = 'desktop'
  ): Promise<OrderImportResponse> {
    try {
      console.log(`📱 Importing orders from mobile (enhanced)...`);

      const { data, error } = await supabase.rpc('import_mobile_orders_enhanced', {
        p_sales_rep_id: salesRepId || null,
        p_imported_by: importedBy
      });

      if (error) {
        console.error('❌ Error calling enhanced import function:', error);
        throw error;
      }

      const result = data[0] || { imported_count: 0, failed_count: 0, error_messages: [] };
      
      console.log('✅ Enhanced import completed:', result);
      
      // Disparar evento para atualizar listas
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('mobileOrdersUpdated'));

      return {
        success: true,
        message: `${result.imported_count} pedidos importados com sucesso`,
        results: {
          imported: result.imported_count,
          failed: result.failed_count,
          errors: result.error_messages || []
        }
      };

    } catch (error) {
      console.error('❌ Failed to import orders from mobile:', error);
      throw error;
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
      
      // Transform and validate data
      const transformedLogs: SyncLogEntry[] = (data || []).map(log => ({
        id: log.id,
        sales_rep_id: log.sales_rep_id,
        event_type: log.event_type as 'upload' | 'download' | 'error',
        device_id: log.device_id,
        device_ip: log.device_ip,
        data_type: log.data_type,
        records_count: log.records_count,
        status: log.status,
        error_message: log.error_message,
        metadata: log.metadata,
        created_at: log.created_at
      }));
      
      return transformedLogs;
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

  // Get customers for mobile sync (legacy method for compatibility)
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
      
      // Transform data to match Customer interface
      const transformedCustomers = (data || []).map(transformCustomerData).filter(Boolean) as Customer[];
      return transformedCustomers;
    } catch (error) {
      console.error('❌ Failed to get customers for sync:', error);
      throw error;
    }
  }

  // Get products for mobile sync (legacy method for compatibility)
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
      
      // Transform data to match Product interface
      const transformedProducts = (data || []).map(transformProductData).filter(Boolean) as Product[];
      return transformedProducts;
    } catch (error) {
      console.error('❌ Failed to get products for sync:', error);
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

  // Mark orders as synced
  async markOrdersAsSynced(salesRepId: string, orderIds: string[]): Promise<number> {
    try {
      console.log('✅ Marking orders as synced:', orderIds.length);

      const { data, error } = await supabase.rpc('mark_orders_as_synced', {
        p_sales_rep_id: salesRepId,
        p_order_ids: orderIds
      });

      if (error) {
        console.error('❌ Error marking orders as synced:', error);
        throw error;
      }

      console.log(`✅ Marked ${data} orders as synced`);
      return data || 0;
    } catch (error) {
      console.error('❌ Failed to mark orders as synced:', error);
      throw error;
    }
  }
}

export const mobileSyncService = new MobileSyncService();
