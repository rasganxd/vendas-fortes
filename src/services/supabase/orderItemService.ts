
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types';
import { toast } from '@/components/ui/use-toast';
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

  if (!orderId) {
    console.error('Cannot add items: Order ID is missing');
    toast({
      title: "Erro ao adicionar itens",
      description: "ID do pedido inválido.",
      variant: "destructive"
    });
    return;
  }

  try {
    console.log(`Adding ${items.length} items to order ${orderId}`);
    console.log('Items to add:', items);
    
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

    console.log('Formatted items for database:', formattedItems);

    // Insert all items in a single request
    const { data, error } = await supabase
      .from('order_items')
      .insert(formattedItems)
      .select();

    if (error) {
      console.error('Error adding order items:', error);
      toast({
        title: "Erro ao adicionar itens",
        description: `Erro: ${error.message}`,
        variant: "destructive"
      });
      throw error;
    }

    console.log(`Successfully added ${items.length} items to order ${orderId}`);
    console.log('Database response:', data);
  } catch (error) {
    console.error('Error in addOrderItems:', error);
    toast({
      title: "Erro ao adicionar itens ao pedido",
      description: "Ocorreu um erro ao salvar os itens.",
      variant: "destructive"
    });
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
  if (!orderId) {
    console.error('Cannot update items: Order ID is missing');
    toast({
      title: "Erro ao atualizar itens",
      description: "ID do pedido inválido.",
      variant: "destructive"
    });
    return;
  }

  try {
    console.log(`Updating items for order ${orderId}`);
    console.log('New items:', items);
    
    // First, delete all existing items for this order
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);

    if (deleteError) {
      console.error('Error deleting existing order items:', deleteError);
      toast({
        title: "Erro ao atualizar itens",
        description: `Erro ao excluir itens existentes: ${deleteError.message}`,
        variant: "destructive"
      });
      throw deleteError;
    }

    console.log('Successfully deleted existing items');

    // Then add the new items
    if (items && items.length > 0) {
      await addOrderItems(orderId, items);
    } else {
      console.log('No new items to add');
    }

    console.log(`Successfully updated items for order ${orderId}`);
  } catch (error) {
    console.error('Error in updateOrderItems:', error);
    toast({
      title: "Erro ao atualizar itens do pedido",
      description: "Ocorreu um erro ao atualizar os itens.",
      variant: "destructive"
    });
    throw error;
  }
};

/**
 * Get all items for an order
 * @param orderId The ID of the order to get items for
 */
export const getOrderItems = async (orderId: string): Promise<OrderItem[]> => {
  if (!orderId) {
    console.error('Cannot get items: Order ID is missing');
    return [];
  }

  try {
    console.log(`Getting items for order ${orderId}`);
    
    const { data, error } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);

    if (error) {
      console.error('Error getting order items:', error);
      throw error;
    }

    if (!data || data.length === 0) {
      console.log(`No items found for order ${orderId}`);
      return [];
    }

    console.log(`Found ${data.length} items for order ${orderId}`);
    
    // Transform data to match OrderItem type
    const items: OrderItem[] = data.map(item => ({
      id: item.id,
      productId: item.product_id,
      productName: item.product_name,
      productCode: item.product_code,
      quantity: item.quantity,
      price: item.price,
      unitPrice: item.unit_price,
      discount: item.discount || 0,
      total: item.total
    }));

    return items;
  } catch (error) {
    console.error('Error in getOrderItems:', error);
    return [];
  }
};
