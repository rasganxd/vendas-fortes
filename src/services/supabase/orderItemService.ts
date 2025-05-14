
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types';
import { convertToSnakeCase } from '@/utils/dataTransformers';

/**
 * Add multiple order items to an order
 * @param orderId The ID of the order to add items to
 * @param items The items to add to the order
 */
export const addOrderItems = async (orderId: string, items: OrderItem[]): Promise<void> => {
  if (!items || items.length === 0) {
    console.log('No items to add to order');
    return;
  }

  try {
    // Map the items to the format Supabase expects
    const formattedItems = items.map(item => ({
      order_id: orderId,
      product_id: item.productId,
      product_name: item.productName,
      product_code: item.productCode || 0,
      quantity: item.quantity,
      price: item.price || item.unitPrice || 0,
      unit_price: item.unitPrice || item.price || 0,
      discount: item.discount || 0,
      total: (item.unitPrice || item.price || 0) * item.quantity
    }));

    // Insert all items in a single request
    const { error } = await supabase
      .from('order_items')
      .insert(formattedItems);

    if (error) {
      throw error;
    }

    console.log(`Successfully added ${items.length} items to order ${orderId}`);
  } catch (error) {
    console.error('Error adding order items:', error);
    throw error;
  }
};

/**
 * Update all order items for an order
 * This will delete all existing items and add the new ones
 * @param orderId The ID of the order to update items for
 * @param items The new items for the order
 */
export const updateOrderItems = async (orderId: string, items: OrderItem[]): Promise<void> => {
  try {
    // First, delete all existing items for this order
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteError) {
      throw deleteError;
    }

    // Then add the new items
    if (items && items.length > 0) {
      await addOrderItems(orderId, items);
    }

    console.log(`Successfully updated items for order ${orderId}`);
  } catch (error) {
    console.error('Error updating order items:', error);
    throw error;
  }
};
