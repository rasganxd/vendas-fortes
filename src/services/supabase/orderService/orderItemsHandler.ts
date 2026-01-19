
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types';

export class OrderItemsHandler {
  static async getOrderItems(orderId: string): Promise<OrderItem[]> {
    console.log(`🔍 Getting items for order: ${orderId}`);
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*')
      .eq('order_id', orderId);
    
    if (itemsError) {
      console.error('❌ Error getting order items:', itemsError);
      return [];
    }
    
    return (itemsData || []).map(item => {
      console.log(`📦 Processing item: ${item.product_name}, unit: ${item.unit}`);
      return {
        id: item.id,
        orderId: item.order_id,
        productId: item.product_code?.toString() || '', // Use product_code as productId
        productName: item.product_name,
        productCode: item.product_code || 0,
        quantity: item.quantity,
        unitPrice: item.unit_price || item.price,
        price: item.price,
        discount: item.discount || 0,
        total: item.total,
        unit: item.unit || 'UN' // Only use fallback if unit is null/undefined
      };
    });
  }

  static async getAllOrderItems(): Promise<{ [orderId: string]: OrderItem[] }> {
    const { data: itemsData, error: itemsError } = await supabase
      .from('order_items')
      .select('*');
    
    if (itemsError) {
      console.error('❌ Error getting order items:', itemsError);
      return {};
    }
    
    return (itemsData || []).reduce((acc, item) => {
      if (!acc[item.order_id]) {
        acc[item.order_id] = [];
      }
      
      console.log(`📦 Processing bulk item: ${item.product_name}, unit: ${item.unit}`);
      acc[item.order_id].push({
        id: item.id,
        orderId: item.order_id,
        productId: item.product_code?.toString() || '', // Use product_code as productId
        productName: item.product_name,
        productCode: item.product_code || 0,
        quantity: item.quantity,
        unitPrice: item.unit_price || item.price,
        price: item.price,
        discount: item.discount || 0,
        total: item.total,
        unit: item.unit || 'UN' // Only use fallback if unit is null/undefined
      });
      return acc;
    }, {});
  }

  static async insertOrderItems(orderId: string, items: OrderItem[]): Promise<void> {
    if (!items || items.length === 0) return;

    const orderItems = items.map(item => {
      console.log(`💾 Saving item: ${item.productName}, unit: ${item.unit}`);
      return {
        order_id: orderId,
        product_name: item.productName,
        product_code: item.productCode,
        quantity: item.quantity,
        price: item.unitPrice || item.price,
        unit_price: item.unitPrice || item.price,
        total: item.total,
        discount: item.discount || 0,
        unit: item.unit || 'UN', // Preserve original unit or use fallback
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
    });
    
    console.log('Inserting order items:', orderItems);
    
    const { error: itemsError } = await supabase
      .from('order_items')
      .insert(orderItems);
    
    if (itemsError) {
      console.error('Error adding order items:', itemsError);
      throw itemsError;
    }
    
    console.log('Order items added successfully');
  }

  static async updateOrderItems(orderId: string, items: OrderItem[]): Promise<void> {
    // Delete existing items
    const { error: deleteError } = await supabase
      .from('order_items')
      .delete()
      .eq('order_id', orderId);
    
    if (deleteError) {
      console.error('Error deleting existing items:', deleteError);
      throw deleteError;
    }
    
    // Insert new items
    await this.insertOrderItems(orderId, items);
  }
}
