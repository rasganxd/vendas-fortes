
import { supabase } from '@/integrations/supabase/client';
import { transformSalesRepData, prepareForSupabase } from '@/utils/dataTransformers';
import { SalesRep, Customer, Product, Order } from '@/types';

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
              ...prepareForSupabase(order),
              updated_at: new Date().toISOString(),
              synced_from_mobile: true,
              device_id: deviceId
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
            .insert({
              ...prepareForSupabase(order),
              synced_from_mobile: true,
              device_id: deviceId,
              sales_rep_id: salesRepId
            })
            .select('id')
            .single();

          if (insertError) {
            console.error("Error inserting order from mobile:", insertError);
          } else if (newOrder) {
            processedOrderIds.push(newOrder.id);

            // Process order items
            if (order.items && Array.isArray(order.items)) {
              for (const item of order.items) {
                await supabase
                  .from('order_items')
                  .insert({
                    ...prepareForSupabase(item),
                    order_id: newOrder.id
                  });
              }
            }
          }
        }
      }

      return {
        success: true,
        orderIds: processedOrderIds
      };
    } catch (error) {
      console.error("Error in receiveOrdersFromMobile:", error);
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
      await supabase
        .from('sync_logs')
        .insert({
          event_type: eventType,
          device_id: deviceId,
          sales_rep_id: salesRepId,
          details,
          created_at: new Date().toISOString()
        });
    } catch (error) {
      console.error("Error logging sync event:", error);
    }
  }
};
