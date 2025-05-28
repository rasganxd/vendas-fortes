
import { supabase } from '@/integrations/supabase/client';
import { OrderItem } from '@/types';

class OrderItemService {
  async addItemToOrder(orderId: string, item: Omit<OrderItem, 'id' | 'orderId'>): Promise<OrderItem> {
    try {
      console.log('📦 Adding item to order:', orderId, item);
      
      const orderItemData = {
        order_id: orderId,
        product_id: item.productId,
        product_name: item.productName,
        product_code: item.productCode,
        quantity: item.quantity,
        price: item.unitPrice || item.price,
        unit_price: item.unitPrice || item.price,
        total: item.total,
        discount: item.discount || 0,
        unit: item.unit || 'UN', // Store the unit
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from('order_items')
        .insert(orderItemData)
        .select()
        .single();
      
      if (error) {
        console.error('❌ Error adding item to order:', error);
        throw error;
      }
      
      // Transform back to OrderItem interface
      const newItem: OrderItem = {
        id: data.id,
        orderId: data.order_id,
        productId: data.product_id,
        productName: data.product_name,
        productCode: data.product_code || 0,
        quantity: data.quantity,
        unitPrice: data.unit_price,
        price: data.price,
        discount: data.discount || 0,
        total: data.total,
        unit: data.unit || 'UN'
      };
      
      console.log('✅ Item added to order successfully:', newItem.id);
      return newItem;
    } catch (error) {
      console.error('❌ Error in addItemToOrder:', error);
      throw error;
    }
  }

  async removeItemFromOrder(orderId: string, productId: string): Promise<void> {
    try {
      console.log('🗑️ Removing item from order:', orderId, productId);
      
      const { error } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', orderId)
        .eq('product_id', productId);
      
      if (error) {
        console.error('❌ Error removing item from order:', error);
        throw error;
      }
      
      console.log('✅ Item removed from order successfully');
    } catch (error) {
      console.error('❌ Error in removeItemFromOrder:', error);
      throw error;
    }
  }

  async updateItemInOrder(orderId: string, itemId: string, updates: Partial<OrderItem>): Promise<void> {
    try {
      console.log('🔄 Updating item in order:', orderId, itemId, updates);
      
      const updateData = {
        quantity: updates.quantity,
        price: updates.unitPrice || updates.price,
        unit_price: updates.unitPrice || updates.price,
        total: updates.total,
        discount: updates.discount,
        unit: updates.unit,
        updated_at: new Date().toISOString()
      };
      
      // Remove undefined values
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === undefined) {
          delete updateData[key];
        }
      });
      
      const { error } = await supabase
        .from('order_items')
        .update(updateData)
        .eq('id', itemId);
      
      if (error) {
        console.error('❌ Error updating item in order:', error);
        throw error;
      }
      
      console.log('✅ Item updated in order successfully');
    } catch (error) {
      console.error('❌ Error in updateItemInOrder:', error);
      throw error;
    }
  }

  async updateOrderTotal(orderId: string): Promise<void> {
    try {
      console.log('💰 Updating order total for:', orderId);
      
      // Calculate total from all items
      const { data: items, error: itemsError } = await supabase
        .from('order_items')
        .select('total')
        .eq('order_id', orderId);
      
      if (itemsError) {
        console.error('❌ Error fetching items for total calculation:', itemsError);
        throw itemsError;
      }
      
      const total = (items || []).reduce((sum, item) => sum + (item.total || 0), 0);
      
      const { error: updateError } = await supabase
        .from('orders')
        .update({ 
          total: total,
          updated_at: new Date().toISOString()
        })
        .eq('id', orderId);
      
      if (updateError) {
        console.error('❌ Error updating order total:', updateError);
        throw updateError;
      }
      
      console.log('✅ Order total updated successfully:', total);
    } catch (error) {
      console.error('❌ Error in updateOrderTotal:', error);
      throw error;
    }
  }
}

export const orderItemService = new OrderItemService();
