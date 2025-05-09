
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

/**
 * Create service specifically for load_orders which doesn't have an ID field
 */
export const createLoadOrdersService = () => {
  return {
    // Get all load orders
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('*');
          
        if (error) {
          console.error('Error fetching load_orders:', error);
          throw error;
        }
        
        return (data || []) as Database['public']['Tables']['load_orders']['Row'][];
      } catch (error) {
        console.error("Error in getAll for load_orders:", error);
        throw error;
      }
    },
    
    // Add a new load order relationship
    add: async (loadId: string, orderId: string) => {
      try {
        const record = {
          load_id: loadId,
          order_id: orderId
        };
        
        const { error } = await supabase
          .from('load_orders')
          .insert(record);
          
        if (error) {
          console.error('Error adding load_order:', error);
          throw error;
        }
        
        return 'created';
      } catch (error) {
        console.error("Error in add for load_orders:", error);
        throw error;
      }
    },
    
    // Delete a load order relationship
    delete: async (loadId: string, orderId: string) => {
      try {
        const { error } = await supabase
          .from('load_orders')
          .delete()
          .eq('load_id', loadId)
          .eq('order_id', orderId);
          
        if (error) {
          console.error('Error deleting load_order:', error);
          throw error;
        }
      } catch (error) {
        console.error("Error in delete for load_orders:", error);
        throw error;
      }
    },
    
    // Get all orders for a load
    getOrdersForLoad: async (loadId: string) => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('order_id')
          .eq('load_id', loadId);
          
        if (error) {
          console.error('Error fetching orders for load:', error);
          throw error;
        }
        
        return (data || []).map(item => item.order_id);
      } catch (error) {
        console.error("Error in getOrdersForLoad:", error);
        throw error;
      }
    },
    
    // Get all loads for an order
    getLoadsForOrder: async (orderId: string) => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('load_id')
          .eq('order_id', orderId);
          
        if (error) {
          console.error('Error fetching loads for order:', error);
          throw error;
        }
        
        return (data || []).map(item => item.load_id);
      } catch (error) {
        console.error("Error in getLoadsForOrder:", error);
        throw error;
      }
    }
  };
};
