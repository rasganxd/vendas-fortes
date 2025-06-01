
import { supabase } from '@/integrations/supabase/client';

export interface MobileOrder {
  id: string;
  code: number;
  customer_id: string;
  customer_name: string;
  sales_rep_id: string;
  sales_rep_name: string;
  date: string;
  total: number;
  status: string;
  imported: boolean;
  imported_at?: string;
  imported_by?: string;
  created_at: string;
  items?: MobileOrderItem[];
}

export interface MobileOrderItem {
  id: string;
  order_id: string;
  product_id: string;
  product_name: string;
  product_code: number;
  quantity: number;
  unit_price: number;
  price: number;
  total: number;
  unit: string;
}

export interface ImportResult {
  imported_count: number;
  failed_count: number;
  error_messages: string[];
}

export interface SalesRepSyncStatus {
  sales_rep_id: string;
  sales_rep_name: string;
  last_sync: string | null;
  pending_orders: number;
}

class MobileOrderService {
  private logDebug = (message: string, data?: any) => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`📱 [MobileOrders] ${message}`, data || '');
    }
  };

  private logError = (message: string, error?: any) => {
    console.error(`❌ [MobileOrders] ${message}`, error || '');
  };

  async getPendingOrders(salesRepId?: string): Promise<MobileOrder[]> {
    try {
      this.logDebug('Fetching pending mobile orders', salesRepId);
      
      let query = supabase
        .from('orders_mobile')
        .select(`
          *,
          order_items_mobile (*)
        `)
        .eq('imported', false)
        .order('created_at', { ascending: false });

      if (salesRepId) {
        query = query.eq('sales_rep_id', salesRepId);
      }

      const { data, error } = await query;

      if (error) {
        this.logError('Error fetching pending orders', error);
        throw error;
      }

      this.logDebug(`Found ${data?.length || 0} pending orders`);
      
      return (data || []).map(order => ({
        ...order,
        items: order.order_items_mobile || []
      }));
    } catch (error) {
      this.logError('Error in getPendingOrders', error);
      throw error;
    }
  }

  async getImportedOrders(salesRepId?: string): Promise<MobileOrder[]> {
    try {
      this.logDebug('Fetching imported mobile orders', salesRepId);
      
      let query = supabase
        .from('orders_mobile')
        .select(`
          *,
          order_items_mobile (*)
        `)
        .eq('imported', true)
        .order('imported_at', { ascending: false });

      if (salesRepId) {
        query = query.eq('sales_rep_id', salesRepId);
      }

      const { data, error } = await query;

      if (error) {
        this.logError('Error fetching imported orders', error);
        throw error;
      }

      this.logDebug(`Found ${data?.length || 0} imported orders`);

      return (data || []).map(order => ({
        ...order,
        items: order.order_items_mobile || []
      }));
    } catch (error) {
      this.logError('Error in getImportedOrders', error);
      throw error;
    }
  }

  async getSalesRepSyncStatus(): Promise<SalesRepSyncStatus[]> {
    try {
      this.logDebug('Getting sales rep sync status');
      
      // Get last sync per sales rep
      const { data: syncData, error: syncError } = await supabase
        .from('sync_logs')
        .select('sales_rep_id, created_at')
        .eq('event_type', 'upload')
        .eq('data_type', 'orders')
        .order('created_at', { ascending: false });

      if (syncError) {
        this.logError('Error fetching sync data', syncError);
        throw syncError;
      }

      // Get pending orders count per sales rep
      const { data: pendingData, error: pendingError } = await supabase
        .from('orders_mobile')
        .select('sales_rep_id, sales_rep_name')
        .eq('imported', false);

      if (pendingError) {
        this.logError('Error fetching pending data', pendingError);
        throw pendingError;
      }

      // Group data by sales rep
      const salesRepMap = new Map<string, SalesRepSyncStatus>();

      // Add pending orders data
      pendingData?.forEach(order => {
        const salesRepId = order.sales_rep_id || 'orphaned';
        const salesRepName = order.sales_rep_name || 'Pedidos Órfãos';

        if (!salesRepMap.has(salesRepId)) {
          salesRepMap.set(salesRepId, {
            sales_rep_id: salesRepId,
            sales_rep_name: salesRepName,
            last_sync: null,
            pending_orders: 0
          });
        }
        const status = salesRepMap.get(salesRepId)!;
        status.pending_orders++;
      });

      // Add last sync data
      const lastSyncMap = new Map<string, string>();
      syncData?.forEach(sync => {
        if (sync.sales_rep_id && !lastSyncMap.has(sync.sales_rep_id)) {
          lastSyncMap.set(sync.sales_rep_id, sync.created_at);
        }
      });

      // Update with sync data
      salesRepMap.forEach((status, salesRepId) => {
        if (salesRepId !== 'orphaned') {
          status.last_sync = lastSyncMap.get(salesRepId) || null;
        }
      });

      const result = Array.from(salesRepMap.values());
      this.logDebug(`Returning ${result.length} sales rep statuses`);

      return result;
    } catch (error) {
      this.logError('Error in getSalesRepSyncStatus', error);
      throw error;
    }
  }

  async importOrders(salesRepId?: string, importedBy: string = 'desktop'): Promise<ImportResult> {
    try {
      this.logDebug('Starting import of mobile orders', { salesRepId, importedBy });

      const { data, error } = await supabase.rpc('import_mobile_orders', {
        p_sales_rep_id: salesRepId || null,
        p_imported_by: importedBy
      });

      if (error) {
        this.logError('Error importing orders', error);
        throw error;
      }

      const result = data[0] || { imported_count: 0, failed_count: 0, error_messages: [] };
      
      this.logDebug('Import completed', result);
      
      // Dispatch events for UI updates
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('mobileOrdersUpdated'));

      return result;
    } catch (error) {
      this.logError('Error in importOrders', error);
      throw error;
    }
  }

  async reimportOrder(mobileOrderId: string): Promise<void> {
    try {
      this.logDebug('Reimporting order', mobileOrderId);

      // Mark as not imported temporarily
      const { error: updateError } = await supabase
        .from('orders_mobile')
        .update({ 
          imported: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', mobileOrderId);

      if (updateError) {
        this.logError('Error marking order for reimport', updateError);
        throw updateError;
      }

      // Import again
      await this.importOrders();

      this.logDebug('Order reimported successfully');
    } catch (error) {
      this.logError('Error in reimportOrder', error);
      throw error;
    }
  }

  async getPendingOrdersCount(): Promise<number> {
    try {
      const { count, error } = await supabase
        .from('orders_mobile')
        .select('*', { count: 'exact', head: true })
        .eq('imported', false);

      if (error) {
        this.logError('Error getting pending orders count', error);
        throw error;
      }

      return count || 0;
    } catch (error) {
      this.logError('Error in getPendingOrdersCount', error);
      return 0;
    }
  }
}

export const mobileOrderService = new MobileOrderService();
