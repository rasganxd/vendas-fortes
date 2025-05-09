
import { supabase } from '@/integrations/supabase/client';

/**
 * Creates a specialized service for the load_orders table which doesn't have an ID field
 */
export function createLoadOrdersService() {
  return {
    // Add a new load-order relationship
    add: async (loadId: string, orderId: string): Promise<void> => {
      try {
        const { error } = await supabase
          .from('load_orders')
          .insert({
            load_id: loadId,
            order_id: orderId
          });
          
        if (error) {
          console.error('Error adding load order:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error in load orders add:', error);
        throw error;
      }
    },
    
    // Delete a load-order relationship
    delete: async (loadId: string, orderId: string): Promise<void> => {
      try {
        const { error } = await supabase
          .from('load_orders')
          .delete()
          .eq('load_id', loadId)
          .eq('order_id', orderId);
          
        if (error) {
          console.error('Error deleting load order:', error);
          throw error;
        }
      } catch (error) {
        console.error('Error in load orders delete:', error);
        throw error;
      }
    },
    
    // Get all orders for a given load
    getOrdersForLoad: async (loadId: string): Promise<string[]> => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('order_id')
          .eq('load_id', loadId);
          
        if (error) {
          console.error('Error getting orders for load:', error);
          throw error;
        }
        
        return data.map(item => item.order_id);
      } catch (error) {
        console.error('Error in getOrdersForLoad:', error);
        throw error;
      }
    },
    
    // Get all loads for a given order
    getLoadsForOrder: async (orderId: string): Promise<string[]> => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('load_id')
          .eq('order_id', orderId);
          
        if (error) {
          console.error('Error getting loads for order:', error);
          throw error;
        }
        
        return data.map(item => item.load_id);
      } catch (error) {
        console.error('Error in getLoadsForOrder:', error);
        throw error;
      }
    }
  };
}
