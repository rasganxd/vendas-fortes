
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { toast } from '@/components/ui/use-toast';

/**
 * Service for order-related operations
 */
export const orderService = createStandardService('orders');

/**
 * Get an order with its items
 * @param id Order ID
 * @returns The order with its items
 */
export const getOrderWithItems = async (id: string): Promise<Order | null> => {
  try {
    console.log(`Fetching order with ID: ${id}`);
    
    // Get the order
    const { data: orderData, error: orderError } = await supabase
      .from('orders')
      .select('*')
      .eq('id', id)
      .single();
      
    if (orderError) {
      console.error("Error fetching order:", orderError);
      return null;
    }
    
    if (!orderData) {
      console.warn(`No order found with ID: ${id}`);
      return null;
    }

    console.log(`Order found:`, orderData);
    
    // Get the order items
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', id);
    
    if (itemsError) {
      console.error("Error fetching order items:", itemsError);
      // Continue with empty items rather than failing completely
    }
    
    const items = itemsData || [];
    console.log(`Found ${items.length} items for order:`, items);
    
    // Transform order data to match Order type
    const order: Order = {
      id: orderData.id,
      code: orderData.code,
      customerId: orderData.customer_id || '',
      customerName: orderData.customer_name,
      salesRepId: orderData.sales_rep_id || '',
      salesRepName: orderData.sales_rep_name,
      date: new Date(orderData.date),
      dueDate: orderData.due_date ? new Date(orderData.due_date) : new Date(),
      items: items.map(item => ({
        id: item.id,
        productId: item.product_id,
        productName: item.product_name,
        productCode: item.product_code,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.unit_price,
        discount: item.discount || 0,
        total: item.total
      })),
      total: orderData.total,
      discount: orderData.discount || 0,
      status: orderData.status as any || 'pending',
      paymentStatus: orderData.payment_status as any || 'pending',
      paymentMethodId: orderData.payment_method_id || '',
      paymentMethod: orderData.payment_method || '',
      paymentTableId: orderData.payment_table_id || '',
      payments: [], // Initialize with empty payments array
      notes: orderData.notes || '',
      createdAt: new Date(orderData.created_at),
      updatedAt: new Date(orderData.updated_at),
      archived: orderData.archived || false,
      deliveryZip: orderData.delivery_zip || '',
      deliveryAddress: orderData.delivery_address || '',
      deliveryCity: orderData.delivery_city || '',
      deliveryState: orderData.delivery_state || ''
    };
    
    return order;
  } catch (error) {
    console.error("Error in getOrderWithItems:", error);
    toast({
      title: "Erro ao carregar pedido",
      description: "Não foi possível carregar os detalhes do pedido.",
      variant: "destructive"
    });
    return null;
  }
};
