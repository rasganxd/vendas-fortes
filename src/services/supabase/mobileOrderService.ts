
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
  // Buscar pedidos mobile não importados
  async getPendingOrders(salesRepId?: string): Promise<MobileOrder[]> {
    try {
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
        console.error('❌ Error fetching pending orders:', error);
        throw error;
      }

      return (data || []).map(order => ({
        ...order,
        items: (order.order_items_mobile || []).map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id || '', // Ensure product_id exists
          product_name: item.product_name,
          product_code: item.product_code || 0,
          quantity: item.quantity,
          unit_price: item.unit_price || item.price,
          price: item.price,
          total: item.total,
          unit: item.unit || 'UN'
        }))
      }));
    } catch (error) {
      console.error('❌ Error in getPendingOrders:', error);
      throw error;
    }
  }

  // Buscar pedidos mobile importados
  async getImportedOrders(salesRepId?: string): Promise<MobileOrder[]> {
    try {
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
        console.error('❌ Error fetching imported orders:', error);
        throw error;
      }

      return (data || []).map(order => ({
        ...order,
        items: (order.order_items_mobile || []).map((item: any) => ({
          id: item.id,
          order_id: item.order_id,
          product_id: item.product_id || '', // Ensure product_id exists
          product_name: item.product_name,
          product_code: item.product_code || 0,
          quantity: item.quantity,
          unit_price: item.unit_price || item.price,
          price: item.price,
          total: item.total,
          unit: item.unit || 'UN'
        }))
      }));
    } catch (error) {
      console.error('❌ Error in getImportedOrders:', error);
      throw error;
    }
  }

  // Status de sincronização por vendedor
  async getSalesRepSyncStatus(): Promise<SalesRepSyncStatus[]> {
    try {
      // Buscar última sincronização por vendedor
      const { data: syncData, error: syncError } = await supabase
        .from('sync_logs')
        .select('sales_rep_id, created_at')
        .eq('event_type', 'upload')
        .eq('data_type', 'orders')
        .order('created_at', { ascending: false });

      if (syncError) {
        console.error('❌ Error fetching sync data:', syncError);
        throw syncError;
      }

      // Buscar contagem de pedidos pendentes por vendedor
      const { data: pendingData, error: pendingError } = await supabase
        .from('orders_mobile')
        .select('sales_rep_id, sales_rep_name')
        .eq('imported', false);

      if (pendingError) {
        console.error('❌ Error fetching pending data:', pendingError);
        throw pendingError;
      }

      // Agrupar dados por vendedor
      const salesRepMap = new Map<string, SalesRepSyncStatus>();

      // Adicionar dados de pedidos pendentes
      pendingData?.forEach(order => {
        if (!salesRepMap.has(order.sales_rep_id)) {
          salesRepMap.set(order.sales_rep_id, {
            sales_rep_id: order.sales_rep_id,
            sales_rep_name: order.sales_rep_name,
            last_sync: null,
            pending_orders: 0
          });
        }
        const status = salesRepMap.get(order.sales_rep_id)!;
        status.pending_orders++;
      });

      // Adicionar dados de última sincronização
      const lastSyncMap = new Map<string, string>();
      syncData?.forEach(sync => {
        if (sync.sales_rep_id && !lastSyncMap.has(sync.sales_rep_id)) {
          lastSyncMap.set(sync.sales_rep_id, sync.created_at);
        }
      });

      // Atualizar com dados de sincronização
      salesRepMap.forEach((status, salesRepId) => {
        status.last_sync = lastSyncMap.get(salesRepId) || null;
      });

      return Array.from(salesRepMap.values());
    } catch (error) {
      console.error('❌ Error in getSalesRepSyncStatus:', error);
      throw error;
    }
  }

  // Importar pedidos usando a função do banco
  async importOrders(salesRepId?: string, importedBy: string = 'desktop'): Promise<ImportResult> {
    try {
      console.log('🚀 Starting manual import of mobile orders', { salesRepId, importedBy });

      const { data, error } = await supabase.rpc('import_mobile_orders', {
        p_sales_rep_id: salesRepId || null,
        p_imported_by: importedBy
      });

      if (error) {
        console.error('❌ Error importing orders:', error);
        throw error;
      }

      const result = data[0] || { imported_count: 0, failed_count: 0, error_messages: [] };
      
      console.log('✅ Import completed:', result);
      
      // Disparar evento para atualizar listas
      window.dispatchEvent(new CustomEvent('ordersUpdated'));
      window.dispatchEvent(new CustomEvent('mobileOrdersUpdated'));

      return result;
    } catch (error) {
      console.error('❌ Error in importOrders:', error);
      throw error;
    }
  }

  // Reimportar um pedido específico
  async reimportOrder(mobileOrderId: string): Promise<void> {
    try {
      console.log('🔄 Reimporting order:', mobileOrderId);

      // Marcar como não importado temporariamente
      const { error: updateError } = await supabase
        .from('orders_mobile')
        .update({ 
          imported: false,
          updated_at: new Date().toISOString()
        })
        .eq('id', mobileOrderId);

      if (updateError) {
        console.error('❌ Error marking order for reimport:', updateError);
        throw updateError;
      }

      // Importar novamente
      await this.importOrders();

      console.log('✅ Order reimported successfully');
    } catch (error) {
      console.error('❌ Error in reimportOrder:', error);
      throw error;
    }
  }
}

export const mobileOrderService = new MobileOrderService();
