
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
      const { data, error } = await this.supabase.rpc('get_next_order_code');
      
      if (error) {
        console.error('Error generating order code:', error);
        const allOrders = await this.getAll();
        const maxCode = allOrders.reduce((max, order) => Math.max(max, order.code || 0), 0);
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating order code:', error);
      return 1;
    }
  }

  async addWithItems(orderData: Omit<Order, 'id'>): Promise<string> {
    try {
      console.log('Adding order with items:', orderData);
      
      const items = orderData.items || [];
      const transformedOrderData = this.transformToDB(orderData);
      
      const orderWithTimestamps = {
        ...transformedOrderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Transformed order data for DB:', orderWithTimestamps);
      
      const { data: orderResult, error: orderError } = await this.supabase
        .from('orders')
        .insert(orderWithTimestamps)
        .select('id')
        .single();
      
      if (orderError) {
        console.error('Error adding order:', orderError);
        throw orderError;
      }
      
      const orderId = orderResult.id;
      console.log('Order created with ID:', orderId);
      
      if (items && items.length > 0) {
        try {
          await OrderItemsHandler.insertOrderItems(orderId, items);
        } catch (itemsError) {
          await this.supabase.from('orders').delete().eq('id', orderId);
          throw itemsError;
        }
      }
      
      return orderId;
    } catch (error) {
      console.error('Error in addWithItems:', error);
      throw error;
    }
  }

  async update(id: string, order: Partial<Order>): Promise<void> {
    try {
      console.log(`📝 Updating order ${id}`);
      
      const items = order.items;
      const transformedOrderData = this.transformToDB(order as Order);
      
      const dataWithTimestamp = {
        ...transformedOrderData,
        updated_at: new Date().toISOString()
      };
      
      console.log('Data prepared for Supabase update:', dataWithTimestamp);
      
      const { error: orderError } = await this.supabase
        .from('orders')
        .update(dataWithTimestamp)
        .eq('id', id);
      
      if (orderError) {
        console.error(`❌ Supabase error updating order ${id}:`, orderError);
        throw orderError;
      }
      
      if (items && Array.isArray(items)) {
        console.log(`📝 Updating ${items.length} items for order ${id}`);
        await OrderItemsHandler.updateOrderItems(id, items);
        console.log('Order items updated successfully');
      }
      
      console.log(`✅ Updated order ${id}`);
    } catch (error) {
      console.error(`❌ Critical error updating order ${id}:`, error);
      throw error;
    }
  }
}

export const orderService = new OrderSupabaseService();
