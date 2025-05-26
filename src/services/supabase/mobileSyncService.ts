
import { supabase } from '@/integrations/supabase/client';
import { Customer, Product, Order, OrderStatus, PaymentStatus } from '@/types';

/**
 * Interfaces for mobile sync functionality
 */
export interface SyncLogEntry {
  id: string;
  sales_rep_id: string;
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

export interface ConnectionData {
  serverUrl: string;
  localIp?: string;
  serverIp?: string;
  token: string;
  salesRepId: string;
  apiEndpoints?: {
    download: string;
    upload: string;
    status: string;
  };
}

export interface SimplifiedMobileData {
  serverUrl: string;
  localIp?: string;
  serverIp?: string;
  token: string;
  salesRepId: string;
  endpoints: {
    download: string;
    upload: string;
    status: string;
  };
}

/**
 * Mobile sync service for authenticated sales reps
 * Uses RLS policies to automatically filter data by sales_rep_id = auth.uid()
 */
class MobileSyncService {
  
  /**
   * Sync customers for the authenticated sales rep
   * RLS will automatically filter by sales_rep_id = auth.uid()
   */
  async syncCustomers(): Promise<Customer[]> {
    try {
      console.log('📱 Syncing customers for authenticated sales rep...');
      
      const { data: customersData, error } = await supabase
        .from('customers')
        .select('*')
        .eq('active', true)
        .order('name');
      
      if (error) {
        console.error('❌ Error syncing customers:', error);
        throw error;
      }
      
      if (!customersData) {
        console.log('📱 No customers found');
        return [];
      }
      
      // Transform to Customer interface
      const customers: Customer[] = customersData.map(customer => ({
        id: customer.id,
        code: customer.code || 0,
        name: customer.name,
        companyName: customer.company_name || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip_code || '',
        zipCode: customer.zip_code || '',
        phone: customer.phone || '',
        email: customer.email || '',
        notes: customer.notes || '',
        salesRepId: customer.sales_rep_id,
        salesRepName: undefined, // Not available in database schema
        deliveryRouteId: customer.delivery_route_id || undefined,
        visitDays: customer.visit_days || [],
        visitFrequency: customer.visit_frequency || '',
        visitSequence: customer.visit_sequence || 0,
        createdAt: new Date(customer.created_at),
        updatedAt: new Date(customer.updated_at)
      }));
      
      console.log(`✅ Synced ${customers.length} customers`);
      return customers;
      
    } catch (error) {
      console.error('❌ Error in syncCustomers:', error);
      throw error;
    }
  }
  
  /**
   * Sync all products (visible to all authenticated users)
   */
  async syncProducts(): Promise<Product[]> {
    try {
      console.log('📱 Syncing products...');
      
      const { data: productsData, error } = await supabase
        .from('products')
        .select('*')
        .order('name');
      
      if (error) {
        console.error('❌ Error syncing products:', error);
        throw error;
      }
      
      if (!productsData) {
        console.log('📱 No products found');
        return [];
      }
      
      // Transform to Product interface
      const products: Product[] = productsData.map(product => ({
        id: product.id,
        code: product.code || 0,
        name: product.name,
        description: product.description || '',
        price: product.price,
        cost: product.cost || 0,
        stock: product.stock || 0,
        minStock: product.min_stock || 0,
        unit: product.unit || '',
        brandId: product.brand_id || undefined,
        categoryId: product.category_id || undefined,
        groupId: product.group_id || undefined,
        createdAt: new Date(product.created_at),
        updatedAt: new Date(product.updated_at)
      }));
      
      console.log(`✅ Synced ${products.length} products`);
      return products;
      
    } catch (error) {
      console.error('❌ Error in syncProducts:', error);
      throw error;
    }
  }
  
  /**
   * Sync orders for the authenticated sales rep
   * RLS will automatically filter by sales_rep_id = auth.uid()
   */
  async syncOrders(): Promise<Order[]> {
    try {
      console.log('📱 Syncing orders for authenticated sales rep...');
      
      const { data: ordersData, error } = await supabase
        .from('orders')
        .select(`
          *,
          order_items (*)
        `)
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error('❌ Error syncing orders:', error);
        throw error;
      }
      
      if (!ordersData) {
        console.log('📱 No orders found');
        return [];
      }
      
      // Transform to Order interface
      const orders: Order[] = ordersData.map(order => ({
        id: order.id,
        code: order.code,
        customerId: order.customer_id || '',
        customerName: order.customer_name || '',
        salesRepId: order.sales_rep_id || '',
        salesRepName: order.sales_rep_name || '',
        date: new Date(order.date),
        dueDate: order.due_date ? new Date(order.due_date) : new Date(),
        deliveryDate: order.delivery_date ? new Date(order.delivery_date) : undefined,
        status: order.status as OrderStatus,
        paymentStatus: (order.payment_status || 'pending') as PaymentStatus,
        paymentMethod: order.payment_method || '',
        paymentMethodId: order.payment_method_id || '',
        paymentTableId: order.payment_table_id || '',
        paymentTable: order.payment_table || undefined,
        payments: Array.isArray(order.payments) ? order.payments : [],
        total: order.total,
        discount: order.discount || 0,
        notes: order.notes || '',
        deliveryAddress: order.delivery_address || '',
        deliveryCity: order.delivery_city || '',
        deliveryState: order.delivery_state || '',
        deliveryZip: order.delivery_zip || '',
        archived: order.archived || false,
        createdAt: new Date(order.created_at),
        updatedAt: new Date(order.updated_at),
        items: (order.order_items || []).map((item: any) => ({
          id: item.id,
          orderId: item.order_id,
          productId: item.product_id || '',
          productName: item.product_name || '',
          productCode: item.product_code || 0,
          quantity: item.quantity,
          unitPrice: item.unit_price || item.price,
          price: item.price,
          discount: item.discount || 0,
          total: item.total
        }))
      }));
      
      console.log(`✅ Synced ${orders.length} orders`);
      return orders;
      
    } catch (error) {
      console.error('❌ Error in syncOrders:', error);
      throw error;
    }
  }
  
  /**
   * Sync all data for mobile app
   */
  async syncAllData(): Promise<{
    customers: Customer[];
    products: Product[];
    orders: Order[];
  }> {
    try {
      console.log('📱 Starting full data sync...');
      
      const [customers, products, orders] = await Promise.all([
        this.syncCustomers(),
        this.syncProducts(),
        this.syncOrders()
      ]);
      
      console.log('✅ Full data sync completed:', {
        customers: customers.length,
        products: products.length,
        orders: orders.length
      });
      
      return { customers, products, orders };
      
    } catch (error) {
      console.error('❌ Error in syncAllData:', error);
      throw error;
    }
  }

  /**
   * Get sync logs for a specific sales rep
   */
  async getSyncLogs(salesRepId: string): Promise<SyncLogEntry[]> {
    try {
      const { data, error } = await supabase
        .from('sync_logs')
        .select('*')
        .eq('sales_rep_id', salesRepId)
        .order('created_at', { ascending: false })
        .limit(50);

      if (error) {
        console.error('Error fetching sync logs:', error);
        throw error;
      }

      // Cast event_type to the correct union type
      return (data || []).map(log => ({
        ...log,
        event_type: log.event_type as 'upload' | 'download' | 'error'
      }));
    } catch (error) {
      console.error('Error in getSyncLogs:', error);
      throw error;
    }
  }

  /**
   * Clear sync logs for a specific sales rep
   */
  async clearSyncLogs(salesRepId: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_logs')
        .delete()
        .eq('sales_rep_id', salesRepId);

      if (error) {
        console.error('Error clearing sync logs:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in clearSyncLogs:', error);
      throw error;
    }
  }

  /**
   * Log a sync event
   */
  async logSyncEvent(
    salesRepId: string,
    eventType: 'upload' | 'download' | 'error',
    deviceId?: string,
    deviceIp?: string,
    dataType?: string,
    recordsCount?: number,
    status: string = 'completed',
    errorMessage?: string,
    metadata?: any
  ): Promise<void> {
    try {
      const { error } = await supabase
        .from('sync_logs')
        .insert({
          sales_rep_id: salesRepId,
          event_type: eventType,
          device_id: deviceId,
          device_ip: deviceIp,
          data_type: dataType,
          records_count: recordsCount,
          status,
          error_message: errorMessage,
          metadata
        });

      if (error) {
        console.error('Error logging sync event:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in logSyncEvent:', error);
      throw error;
    }
  }

  /**
   * Generate connection data for mobile sync
   */
  async generateConnectionData(salesRepId: string): Promise<ConnectionData> {
    try {
      // Generate a sync token
      const { data: tokenData, error } = await supabase
        .rpc('generate_sync_token', {
          p_sales_rep_id: salesRepId,
          p_project_type: 'mobile',
          p_expires_minutes: 10
        });

      if (error) {
        console.error('Error generating sync token:', error);
        throw error;
      }

      // Use the public URL directly instead of accessing protected property
      const baseUrl = 'https://ufvnubabpcyimahbubkd.supabase.co';
      
      return {
        serverUrl: baseUrl,
        token: tokenData[0]?.token || '',
        salesRepId,
        apiEndpoints: {
          download: `${baseUrl}/rest/v1/`,
          upload: `${baseUrl}/rest/v1/`,
          status: `${baseUrl}/rest/v1/sync_logs`
        }
      };
    } catch (error) {
      console.error('Error in generateConnectionData:', error);
      throw error;
    }
  }

  /**
   * Create mobile API discovery data (simplified for QR codes)
   */
  async createMobileApiDiscovery(connectionData: ConnectionData): Promise<string> {
    try {
      const simplifiedData: SimplifiedMobileData = {
        serverUrl: connectionData.serverUrl,
        localIp: connectionData.localIp,
        serverIp: connectionData.serverIp,
        token: connectionData.token,
        salesRepId: connectionData.salesRepId,
        endpoints: {
          download: connectionData.apiEndpoints?.download || '',
          upload: connectionData.apiEndpoints?.upload || '',
          status: connectionData.apiEndpoints?.status || ''
        }
      };

      return JSON.stringify(simplifiedData);
    } catch (error) {
      console.error('Error in createMobileApiDiscovery:', error);
      throw error;
    }
  }
}

export const mobileSyncService = new MobileSyncService();
