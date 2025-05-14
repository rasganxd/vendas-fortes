
import { supabase } from '@/integrations/supabase/client';
import { Order, OrderItem } from '@/types';
import { transformOrderData } from '@/utils/dataTransformers';

/**
 * Load order items for a specific order
 * @param orderId The ID of the order to load items for
 * @returns A promise that resolves to an array of order items
 */
export const loadOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
      
    if (error) {
      console.error("Error loading order items:", error);
      throw error;
    }
    
    // Transform data to match OrderItem type
    return data.map(item => ({
      id: item.id,
      productId: item.product_id || '',
      productName: item.product_name,
      productCode: item.product_code,
      quantity: item.quantity,
      price: item.price,
      unitPrice: item.unit_price,
      discount: item.discount || 0,
      total: item.total || (item.unit_price * item.quantity)
    }));
  } catch (error) {
    console.error("Error in loadOrderItems:", error);
    return [];
  }
};

/**
 * Load a specific order with its items
 * @param orderId The ID of the order to load
 * @returns A promise that resolves to the order with items included
 */
export const loadOrderWithItems = async (orderId: string): Promise<Order | null> => {
  try {
    // Load the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();
      
    if (orderError) {
      console.error("Error loading order:", orderError);
      return null;
    }
    
    // Load the order items
    const items = await loadOrderItems(orderId);
    
    // Transform the order data and add the items
    const order = transformOrderData(orderData);
    if (order) {
      order.items = items;
    }
    
    return order;
  } catch (error) {
    console.error("Error in loadOrderWithItems:", error);
    return null;
  }
};

// Export all functions as a service object
export const loadOrderService = {
  loadOrderItems,
  loadOrderWithItems
};
