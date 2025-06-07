import { SupabaseService } from './supabaseService';
import { Order, OrderItem } from '@/types';
import { OrderTransformations } from './orderService/orderTransformations';
import { OrderItemsHandler } from './orderService/orderItemsHandler';

class OrderSupabaseService extends SupabaseService<Order> {
  constructor() {
    super('orders');
  }

  protected transformFromDB(dbRecord: any): Order {
    return OrderTransformations.transformFromDB(dbRecord);
  }

  protected transformToDB(record: Partial<Order>): any {
    return OrderTransformations.transformToDB(record);
  }

  async delete(id: string): Promise<void> {
    try {
      console.log(`🗑️ Starting order deletion process for order: ${id}`);
      
      // First, delete all order items
      console.log('📦 Deleting order items first...');
      const { error: itemsError } = await this.supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
      
      if (itemsError) {
        console.error('❌ Error deleting order items:', itemsError);
        throw itemsError;
      }
      
      console.log('✅ Order items deleted successfully');
      
      // Then delete the order
      console.log('📋 Deleting order...');
      const { error: orderError } = await this.supabase
        .from('orders')
        .delete()
        .eq('id', id);
      
      if (orderError) {
        console.error('❌ Error deleting order:', orderError);
        throw orderError;
      }
      
      console.log('✅ Order deleted successfully');
      console.log(`🎉 Order deletion completed for order: ${id}`);
    } catch (error) {
      console.error(`❌ Critical error deleting order ${id}:`, error);
      throw error;
    }
  }

  async getById(id: string): Promise<Order | null> {
    try {
      console.log(`🔍 Getting order by ID: ${id}`);
      
      const { data: orderData, error: orderError } = await this.supabase
        .from('orders')
        .select('*')
        .eq('id', id)
        .single();
      
      if (orderError) {
        console.error('❌ Error getting order:', orderError);
        if (orderError.code === 'PGRST116') return null;
        throw orderError;
      }
      
      if (!orderData) {
        console.log('❌ Order not found');
        return null;
      }
      
      const items = await OrderItemsHandler.getOrderItems(id);
      console.log(`✅ Found ${items.length} items for order ${id}`);
      
      const orderWithItems = {
        ...orderData,
        items: items
      };
      
      const transformedOrder = this.transformFromDB(orderWithItems);
      console.log('✅ Order with items loaded successfully:', transformedOrder.id);
      
      return transformedOrder;
    } catch (error) {
      console.error('❌ Error in getById:', error);
      throw error;
    }
  }

  async getAll(): Promise<Order[]> {
    try {
      console.log('🔍 Getting all orders with items');
      
      const { data: ordersData, error: ordersError } = await this.supabase
        .from('orders')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('❌ Error getting orders:', ordersError);
        throw ordersError;
      }
      
      if (!ordersData || ordersData.length === 0) {
        console.log('📝 No orders found');
        return [];
      }
      
      const itemsByOrderId = await OrderItemsHandler.getAllOrderItems();
      
      const orders = ordersData.map(orderData => {
        const orderWithItems = {
          ...orderData,
          items: itemsByOrderId[orderData.id] || []
        };
        return this.transformFromDB(orderWithItems);
      });
      
      console.log(`✅ Loaded ${orders.length} orders with items`);
      return orders;
    } catch (error) {
      console.error('❌ Error in getAll:', error);
      throw error;
    }
  }

  async generateNextCode(): Promise<number> {
    try {
      console.log('🔢 Generating next order code...');
      const { data, error } = await this.supabase.rpc('get_next_order_code');
      
      if (error) {
        console.error('❌ Error generating order code via RPC:', error);
        console.log('🔄 Falling back to manual calculation...');
        const allOrders = await this.getAll();
        const maxCode = allOrders.reduce((max, order) => Math.max(max, order.code || 0), 0);
        const nextCode = maxCode + 1;
        console.log('✅ Fallback order code generated:', nextCode);
        return nextCode;
      }
      
      console.log('✅ Order code generated via RPC:', data);
      return data || 1;
    } catch (error) {
      console.error('❌ Error generating order code:', error);
      return 1;
    }
  }

  async addWithItems(orderData: Omit<Order, 'id'>): Promise<string> {
    try {
      console.log('📝 Adding order with items:', {
        code: orderData.code,
        customerName: orderData.customerName,
        salesRepName: orderData.salesRepName,
        total: orderData.total,
        itemsCount: orderData.items?.length || 0
      });
      
      const items = orderData.items || [];
      const transformedOrderData = this.transformToDB(orderData);
      
      const orderWithTimestamps = {
        ...transformedOrderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 Inserting order into database...');
      console.log('📋 Transformed order data for DB:', orderWithTimestamps);
      
      const { data: orderResult, error: orderError } = await this.supabase
        .from('orders')
        .insert(orderWithTimestamps)
        .select('id')
        .single();
      
      if (orderError) {
        console.error('❌ Error adding order to database:', orderError);
        throw orderError;
      }
      
      const orderId = orderResult.id;
      console.log('✅ Order created with ID:', orderId);
      
      if (items && items.length > 0) {
        try {
          console.log(`📦 Adding ${items.length} items to order...`);
          await OrderItemsHandler.insertOrderItems(orderId, items);
          console.log('✅ Order items added successfully');
        } catch (itemsError) {
          console.error('❌ Error adding order items, rolling back order:', itemsError);
          await this.supabase.from('orders').delete().eq('id', orderId);
          throw itemsError;
        }
      }
      
      console.log('🎉 Order creation completed successfully!');
      return orderId;
    } catch (error) {
      console.error('❌ Critical error in addWithItems:', error);
      throw error;
    }
  }

  async update(id: string, order: Partial<Order>): Promise<void> {
    try {
      console.log(`📝 Updating order ${id}`, {
        customerName: order.customerName,
        salesRepName: order.salesRepName,
        total: order.total,
        itemsCount: order.items?.length
      });
      
      const items = order.items;
      const transformedOrderData = this.transformToDB(order as Order);
      
      const dataWithTimestamp = {
        ...transformedOrderData,
        updated_at: new Date().toISOString()
      };
      
      console.log('🔄 Updating order in database...');
      console.log('📋 Data prepared for Supabase update:', dataWithTimestamp);
      
      const { error: orderError } = await this.supabase
        .from('orders')
        .update(dataWithTimestamp)
        .eq('id', id);
      
      if (orderError) {
        console.error(`❌ Supabase error updating order ${id}:`, orderError);
        throw orderError;
      }
      
      console.log('✅ Order updated in database');
      
      if (items && Array.isArray(items)) {
        console.log(`📦 Updating ${items.length} items for order ${id}`);
        await OrderItemsHandler.updateOrderItems(id, items);
        console.log('✅ Order items updated successfully');
      }
      
      console.log(`🎉 Order ${id} update completed successfully!`);
    } catch (error) {
      console.error(`❌ Critical error updating order ${id}:`, error);
      throw error;
    }
  }
}

export const orderService = new OrderSupabaseService();
