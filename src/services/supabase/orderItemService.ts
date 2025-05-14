
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types';
import { toSnakeCase } from '@/utils/dataTransformers';

/**
 * Create a new order item in the database
 */
export const createOrderItem = async (orderItem: OrderItem) => {
  // Use toSnakeCase instead of the missing convertToSnakeCase
  const item = toSnakeCase(orderItem);
  
  const { data, error } = await supabase
    .from('order_items')
    .insert([item])
    .select()
    .single();
    
  if (error) {
    console.error('Error creating order item:', error);
    return null;
  }
  
  return data;
};

/**
 * Update an existing order item in the database
 */
export const updateOrderItem = async (orderItem: OrderItem) => {
  if (!orderItem.id) {
    console.error('Cannot update order item without ID');
    return null;
  }
  
  // Use toSnakeCase instead of the missing convertToSnakeCase
  const item = toSnakeCase(orderItem);
  
  const { data, error } = await supabase
    .from('order_items')
    .update(item)
    .eq('id', orderItem.id)
    .select()
    .single();
    
  if (error) {
    console.error('Error updating order item:', error);
    return null;
  }
  
  return data;
};

/**
 * Delete an order item from the database
 */
export const deleteOrderItem = async (id: string) => {
  const { error } = await supabase
    .from('order_items')
    .delete()
    .eq('id', id);
    
  if (error) {
    console.error('Error deleting order item:', error);
    return false;
  }
  
  return true;
};

// Export all functions as a service object
export const orderItemService = {
  createOrderItem,
  updateOrderItem,
  deleteOrderItem
};
