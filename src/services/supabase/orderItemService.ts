
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { prepareForSupabase } from '@/utils/dataTransformers';
import { OrderItem } from '@/types';

/**
 * Service for order item operations
 */
export const orderItemService = createStandardService('order_items');

/**
 * Add multiple order items at once
 * @param items - Array of order items to add
 * @returns Array of inserted order items
 */
export const addOrderItems = async (items: Partial<OrderItem>[]): Promise<OrderItem[]> => {
  if (!items || items.length === 0) return [];
  
  try {
    // Convert camelCase to snake_case and ensure all required fields are present
    const preparedItems = items.map(item => {
      const prepared = prepareForSupabase(item);
      
      // Ensure required fields for Supabase schema are present
      if (!prepared.product_name || prepared.product_code === undefined || 
          prepared.quantity === undefined || prepared.unit_price === undefined || 
          prepared.price === undefined || prepared.total === undefined) {
        throw new Error("Missing required fields for order item");
      }
      
      return prepared;
    });
    
    const { data, error } = await supabase
      .from('order_items')
      .insert(preparedItems as any[])
      .select();
      
    if (error) {
      console.error("Error adding order items:", error);
      throw error;
    }
    
    return data as unknown as OrderItem[];
  } catch (error) {
    console.error("Error in addOrderItems:", error);
    throw error;
  }
};

/**
 * Update multiple order items at once
 * @param items - Array of order items to update
 * @returns Boolean indicating success
 */
export const updateOrderItems = async (items: Partial<OrderItem>[]): Promise<boolean> => {
  if (!items || items.length === 0) return true;
  
  try {
    // Process each item separately
    await Promise.all(items.map(async (item) => {
      if (!item.id) {
        throw new Error("Cannot update order item without ID");
      }
      
      const preparedItem = prepareForSupabase(item);
      
      const { error } = await supabase
        .from('order_items')
        .update(preparedItem)
        .eq('id', item.id);
        
      if (error) {
        console.error(`Error updating order item ${item.id}:`, error);
        throw error;
      }
    }));
    
    return true;
  } catch (error) {
    console.error("Error in updateOrderItems:", error);
    return false;
  }
};

/**
 * Get all order items for a specific order
 * @param orderId - ID of the order
 * @returns Array of order items
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  try {
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
      
    if (error) {
      console.error("Error fetching order items:", error);
      throw error;
    }
    
    return data.map(item => ({
      id: item.id,
      productId: item.product_id || '',
      productName: item.product_name,
      productCode: item.product_code,
      quantity: item.quantity,
      price: item.price,
      unitPrice: item.unit_price,
      discount: item.discount || 0,
      total: item.total || (item.unit_price * item.quantity),
      orderId: item.order_id,
    })) as OrderItem[];
  } catch (error) {
    console.error("Error in getOrderItems:", error);
    return [];
  }
};

// Re-export existing functions for backward compatibility
export const updateOrderItem = orderItemService.update;
