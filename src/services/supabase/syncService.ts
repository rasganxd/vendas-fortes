
import { supabase } from '@/integrations/supabase/client';
import { transformSalesRepData, prepareForSupabase } from '@/utils/dataTransformers';
import { SalesRep, Customer, Product, Order } from '@/types';

// Interface para as entradas de log de sincronização
export interface SyncLogEntry {
  id: string;
  event_type: 'upload' | 'download' | 'error';
  device_id: string;
  sales_rep_id: string;
  created_at: string;
  details?: any;
}

/**
 * Service for handling data synchronization with mobile devices
 */
export const syncService = {
  /**
   * Get all sales reps with their latest update timestamp
   * @returns Array of sales reps with timestamps
   */
  getSalesRepsForSync: async (): Promise<{data: SalesRep[], timestamp: number}> => {
    try {
      const { data, error } = await supabase
        .from('sales_reps')
        .select('*')
        .eq('active', true);
        
      if (error) {
        console.error("Error fetching sales reps for sync:", error);
        throw error;
      }
      
      const transformedData = data.map(rep => transformSalesRepData(rep));
      const timestamp = Date.now();
      
      return {
        data: transformedData,
        timestamp
      };
    } catch (error) {
      console.error("Error in getSalesRepsForSync:", error);
      throw error;
    }
  },

  /**
   * Get all customers with their latest update timestamp
   * @returns Array of customers with timestamps
   */
  getCustomersForSync: async (): Promise<{data: any[], timestamp: number}> => {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*');
        
      if (error) {
        console.error("Error fetching customers for sync:", error);
        throw error;
      }
      
      const timestamp = Date.now();
      
      return {
        data,
        timestamp
      };
    } catch (error) {
      console.error("Error in getCustomersForSync:", error);
      throw error;
    }
  },

  /**
   * Get all products with their latest update timestamp
   * @returns Array of products with timestamps
   */
  getProductsForSync: async (): Promise<{data: any[], timestamp: number}> => {
    try {
      const { data, error } = await supabase
        .from('products')
        .select('*');
        
      if (error) {
        console.error("Error fetching products for sync:", error);
        throw error;
      }
      
      const timestamp = Date.now();
      
      return {
        data,
        timestamp
      };
    } catch (error) {
      console.error("Error in getProductsForSync:", error);
      throw error;
    }
  },

  /**
   * Get all orders with their latest update timestamp
   * @returns Array of orders with timestamps
   */
  getOrdersForSync: async (salesRepId?: string): Promise<{data: any[], timestamp: number}> => {
    try {
      let query = supabase
        .from('orders')
        .select('*, order_items(*)');
      
      // If sales rep ID is provided, filter orders for that rep
      if (salesRepId) {
        query = query.eq('sales_rep_id', salesRepId);
      }
        
      const { data, error } = await query;
        
      if (error) {
        console.error("Error fetching orders for sync:", error);
        throw error;
      }
      
      const timestamp = Date.now();
      
      return {
        data,
        timestamp
      };
    } catch (error) {
      console.error("Error in getOrdersForSync:", error);
      throw error;
    }
  },

  /**
   * Receive and process orders from mobile devices
   * @param orders - Orders from mobile device
   * @param deviceId - Unique identifier of the device
   * @param salesRepId - ID of the sales rep
   * @returns Success status and processed order IDs
   */
  receiveOrdersFromMobile: async (
    orders: any[], 
    deviceId: string, 
    salesRepId: string
  ): Promise<{success: boolean, orderIds: string[]}> => {
    try {
      // Validate input
      if (!Array.isArray(orders) || orders.length === 0) {
        console.error("Invalid orders data received");
        return { success: false, orderIds: [] };
      }

      if (!deviceId || !salesRepId) {
        console.error("Missing device ID or sales rep ID");
        return { success: false, orderIds: [] };
      }

      const processedOrderIds: string[] = [];

      // Process each order
      for (const order of orders) {
        // Prepare order data with mobile sync fields
        const orderData = {
          ...prepareForSupabase(order),
          synced_from_mobile: true,
          device_id: deviceId,
          sales_rep_id: salesRepId,
          sync_timestamp: new Date().toISOString()
        };
        
        // Check if order already exists (by client-generated UUID)
        const { data: existingOrder } = await supabase
          .from('orders')
          .select('id')
          .eq('id', order.id)
          .maybeSingle();

        if (existingOrder) {
          // Order exists, update it
          const { error: updateError } = await supabase
            .from('orders')
            .update({
              ...orderData,
              updated_at: new Date().toISOString()
            })
            .eq('id', order.id);

          if (updateError) {
            console.error("Error updating order from mobile:", updateError);
          } else {
            processedOrderIds.push(order.id);
          }
        } else {
          // New order, insert it
          const { data: newOrder, error: insertError } = await supabase
            .from('orders')
            .insert(orderData)
            .select('id')
            .single();

          if (insertError) {
            console.error("Error inserting order from mobile:", insertError);
          } else if (newOrder) {
            processedOrderIds.push(newOrder.id);

            // Process order items
            if (order.items && Array.isArray(order.items)) {
              for (const item of order.items) {
                const itemData = prepareForSupabase(item);
                await supabase
                  .from('order_items')
                  .insert({
                    ...itemData,
                    order_id: newOrder.id,
                    product_code: itemData.product_code || 0,
                    product_name: itemData.product_name || '',
                    quantity: itemData.quantity || 0,
                    price: itemData.price || 0,
                    unit_price: itemData.unit_price || 0,
                    total: itemData.total || 0
                  });
              }
            }
          }
        }
      }

      // Log successful sync
      await syncService.logSyncEvent('upload', deviceId, salesRepId, {
        count: processedOrderIds.length,
        order_ids: processedOrderIds
      });

      return {
        success: true,
        orderIds: processedOrderIds
      };
    } catch (error) {
      console.error("Error in receiveOrdersFromMobile:", error);
      
      // Log sync error
      await syncService.logSyncEvent('error', deviceId, salesRepId, {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : null
      });
      
      return { success: false, orderIds: [] };
    }
  },

  /**
   * Log synchronization event
   * @param eventType - Type of sync event
   * @param deviceId - ID of the device
   * @param salesRepId - ID of the sales rep
   * @param details - Additional event details
   */
  logSyncEvent: async (
    eventType: 'upload' | 'download' | 'error',
    deviceId: string,
    salesRepId: string,
    details?: Record<string, any>
  ): Promise<void> => {
    try {
      // Usando rpc porque sync_logs ainda não está nos tipos do Supabase
      await supabase.rpc('insert_sync_log', {
        p_event_type: eventType,
        p_device_id: deviceId,
        p_sales_rep_id: salesRepId,
        p_details: details || {}
      }).throwOnError();
    } catch (error) {
      console.error("Error logging sync event:", error);
      
      // Método alternativo caso o rpc falhe
      try {
        await supabase.from('sync_logs').insert({
          event_type: eventType,
          device_id: deviceId,
          sales_rep_id: salesRepId,
          details: details || {},
          created_at: new Date().toISOString()
        });
      } catch (innerError) {
        console.error("Failed to log sync event using alternative method:", innerError);
      }
    }
  },
  
  /**
   * Get sync logs for a specific sales rep
   * @param salesRepId - ID of the sales rep
   * @returns Array of sync log entries
   */
  getSyncLogs: async (salesRepId: string): Promise<SyncLogEntry[]> => {
    try {
      const { data, error } = await supabase.rpc('get_sync_logs', {
        p_sales_rep_id: salesRepId
      });
      
      if (error) {
        console.error("Error fetching sync logs:", error);
        throw error;
      }
      
      return data || [];
    } catch (error) {
      console.error("Error in getSyncLogs:", error);
      return [];
    }
  }
};
