
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';

export interface MobileOrderImportResult {
  success: boolean;
  imported: number;
  failed: number;
  errors: string[];
  message: string;
}

export interface ImportLog {
  id: string;
  sales_rep_id?: string;
  event_type: 'upload' | 'download' | 'error';
  device_id?: string;
  device_ip?: string;
  data_type?: string;
  records_count: number;
  status: string;
  error_message?: string;
  metadata?: any;
  created_at: string;
}

class MobileOrderImportService {
  
  /**
   * Get import logs for order imports
   */
  async getImportLogs(limit: number = 50): Promise<ImportLog[]> {
    try {
      console.log('📋 Fetching order import logs...');
      
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('data_type', 'orders')
        .order('created_at', { ascending: false })
        .limit(limit);

      if (error) {
        console.error('❌ Error fetching import logs:', error);
        throw error;
      }

      // Transform data to match ImportLog interface
      const transformedLogs: ImportLog[] = (data || []).map(log => ({
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

      console.log(`✅ Retrieved ${transformedLogs.length} import logs`);
      return transformedLogs;
    } catch (error) {
      console.error('❌ Failed to fetch import logs:', error);
      throw error;
    }
  }

  /**
   * Get orders imported from mobile
   */
  async getMobileOrders(salesRepId?: string): Promise<Order[]> {
    try {
      console.log('📱 Fetching mobile orders...');
      
      let query = supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .eq('source_project', 'mobile')
        .order('created_at', { ascending: false });

      if (salesRepId) {
        query = query.eq('sales_rep_id', salesRepId);
      }

      const { data, error } = await query;

      if (error) {
        console.error('❌ Error fetching mobile orders:', error);
        throw error;
      }

      // Transform data to match Order interface
      const transformedOrders: Order[] = (data || []).map(orderData => ({
        id: orderData.id,
        code: orderData.code,
        customerId: orderData.customer_id,
        customerName: orderData.customer_name,
        salesRepId: orderData.sales_rep_id,
        salesRepName: orderData.sales_rep_name,
        date: new Date(orderData.date),
        dueDate: orderData.due_date ? new Date(orderData.due_date) : new Date(),
        deliveryDate: orderData.delivery_date ? new Date(orderData.delivery_date) : undefined,
        items: (orderData.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id,
          productName: item.product_name,
          productCode: item.product_code,
          quantity: Number(item.quantity),
          unitPrice: Number(item.unit_price || item.price),
          price: Number(item.price),
          discount: Number(item.discount || 0),
          total: Number(item.total)
        })),
        total: Number(orderData.total),
        discount: Number(orderData.discount || 0),
        status: orderData.status as any,
        paymentStatus: orderData.payment_status as any,
        paymentMethod: orderData.payment_method || '',
        paymentMethodId: orderData.payment_method_id || '',
        paymentTableId: orderData.payment_table_id || '',
        payments: Array.isArray(orderData.payments) ? orderData.payments : [],
        notes: orderData.notes || '',
        createdAt: new Date(orderData.created_at),
        updatedAt: new Date(orderData.updated_at),
        archived: orderData.archived || false,
        deliveryAddress: orderData.delivery_address || '',
        deliveryCity: orderData.delivery_city || '',
        deliveryState: orderData.delivery_state || '',
        deliveryZip: orderData.delivery_zip || ''
      }));

      console.log(`✅ Retrieved ${transformedOrders.length} mobile orders`);
      return transformedOrders;
    } catch (error) {
      console.error('❌ Failed to fetch mobile orders:', error);
      throw error;
    }
  }

  /**
   * Get import statistics
   */
  async getImportStats(salesRepId?: string): Promise<{
    totalImported: number;
    todayImported: number;
    failedImports: number;
    lastImport: Date | undefined;
  }> {
    try {
      console.log('📊 Fetching import statistics...');
      
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      
      let baseQuery = supabase
        .from('sync_logs')
        .select('*')
        .eq('data_type', 'orders');

      if (salesRepId) {
        baseQuery = baseQuery.eq('sales_rep_id', salesRepId);
      }

      const [totalResult, todayResult, failedResult] = await Promise.all([
        // Total imported
        baseQuery.eq('event_type', 'upload').eq('status', 'completed'),
        
        // Today imported
        baseQuery
          .eq('event_type', 'upload')
          .eq('status', 'completed')
          .gte('created_at', today.toISOString()),
        
        // Failed imports
        baseQuery.eq('status', 'failed')
      ]);

      const totalImported = totalResult.data?.reduce((sum, log) => sum + (log.records_count || 0), 0) || 0;
      const todayImported = todayResult.data?.reduce((sum, log) => sum + (log.records_count || 0), 0) || 0;
      const failedImports = failedResult.data?.length || 0;
      
      // Get last import date
      const { data: lastImportData } = await baseQuery
        .eq('event_type', 'upload')
        .eq('status', 'completed')
        .order('created_at', { ascending: false })
        .limit(1);

      const lastImport = lastImportData?.[0]?.created_at ? new Date(lastImportData[0].created_at) : undefined;

      const stats = {
        totalImported,
        todayImported,
        failedImports,
        lastImport
      };

      console.log('✅ Import statistics:', stats);
      return stats;
    } catch (error) {
      console.error('❌ Failed to fetch import statistics:', error);
      throw error;
    }
  }

  /**
   * Clear import logs
   */
  async clearImportLogs(): Promise<void> {
    try {
      console.log('🗑️ Clearing order import logs...');
      
      const { error } = await supabase
        .from('sync_logs')
        .delete()
        .eq('data_type', 'orders');

      if (error) {
        console.error('❌ Error clearing import logs:', error);
        throw error;
      }

      console.log('✅ Import logs cleared successfully');
    } catch (error) {
      console.error('❌ Failed to clear import logs:', error);
      throw error;
    }
  }

  /**
   * Mark order as processed/approved
   */
  async approveOrder(orderId: string): Promise<void> {
    try {
      console.log(`✅ Approving order: ${orderId}`);
      
      const { error } = await supabase
        .from('orders')
        .update({ 
          status: 'confirmed',
          sync_status: 'approved',
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);

      if (error) {
        console.error('❌ Error approving order:', error);
        throw error;
      }

      console.log(`✅ Order ${orderId} approved successfully`);
    } catch (error) {
      console.error('❌ Failed to approve order:', error);
      throw error;
    }
  }

  /**
   * Reject/delete imported order
   */
  async rejectOrder(orderId: string): Promise<void> {
    try {
      console.log(`❌ Rejecting order: ${orderId}`);
      
      // First delete order items
      await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId);

      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', orderId);

      if (error) {
        console.error('❌ Error rejecting order:', error);
        throw error;
      }

      console.log(`✅ Order ${orderId} rejected and deleted successfully`);
    } catch (error) {
      console.error('❌ Failed to reject order:', error);
      throw error;
    }
  }
}

export const mobileOrderImportService = new MobileOrderImportService();
