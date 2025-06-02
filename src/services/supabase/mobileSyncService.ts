
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

  // Import orders from mobile
  async importOrdersFromMobile(
    orders: Partial<Order>[], 
    syncToken: string,
    deviceId?: string,
    deviceIp?: string
  ): Promise<OrderImportResponse> {
    try {
      console.log(`📱 Importing ${orders.length} orders from mobile...`);

      // Call the edge function for order import
      const { data, error } = await supabase.functions.invoke('mobile-orders-import', {
        body: { orders },
        headers: {
          'Authorization': `Bearer ${syncToken}`,
          'Content-Type': 'application/json'
        }
      });

      if (error) {
        console.error('❌ Error calling import function:', error);
        throw error;
      }

      console.log('✅ Orders import response:', data);
      return data as OrderImportResponse;

    } catch (error) {
      console.error('❌ Failed to import orders from mobile:', error);
      
      // Log the error
      await this.logSyncEvent('error', 'orders', 0, undefined, deviceId, deviceIp, 
        error instanceof Error ? error.message : 'Unknown error');
      
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
      
      // Transform data to match Customer interface
      const transformedCustomers = (data || []).map(transformCustomerData).filter(Boolean) as Customer[];
      return transformedCustomers;
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
      
      // Transform data to match Product interface
      const transformedProducts = (data || []).map(transformProductData).filter(Boolean) as Product[];
      return transformedProducts;
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

      // Transform orders to match database schema
      const dbOrders = orders.map(order => ({
        code: order.code || 0,
        customer_id: order.customerId,
        customer_name: order.customerName,
        sales_rep_id: salesRepId || order.salesRepId,
        sales_rep_name: order.salesRepName,
        date: order.date ? order.date.toISOString() : new Date().toISOString(),
        due_date: order.dueDate ? order.dueDate.toISOString() : null,
        total: order.total || 0,
        discount: order.discount || 0,
        status: order.status || 'pending',
        payment_status: order.paymentStatus || 'pending',
        payment_method: order.paymentMethod,
        payment_method_id: order.paymentMethodId,
        payment_table_id: order.paymentTableId,
        notes: order.notes,
        source_project: 'mobile',
        sync_status: 'synced'
      }));

      const { error } = await supabase
        .from('orders')
        .insert(dbOrders);

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

      // Transform customers to match database schema
      const dbCustomers = customers.map(customer => ({
        code: customer.code,
        name: customer.name,
        company_name: customer.companyName,
        phone: customer.phone,
        email: customer.email,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zipCode || customer.zip,
        document: customer.document,
        notes: customer.notes,
        visit_frequency: customer.visitFrequency,
        visit_days: customer.visitDays,
        visit_sequence: customer.visitSequence,
        sales_rep_id: salesRepId || customer.salesRepId,
        delivery_route_id: customer.deliveryRouteId
      }));

      const { error } = await supabase
        .from('customers')
        .insert(dbCustomers);

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
