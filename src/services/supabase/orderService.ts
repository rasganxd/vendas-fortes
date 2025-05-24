

import { SupabaseService } from './supabaseService';
import { Order } from '@/types';

class OrderSupabaseService extends SupabaseService<Order> {
  constructor() {
    super('orders');
  }

  // Override the transformFromDB method to map database fields to TypeScript interface
  protected transformFromDB(dbRecord: any): Order {
    if (!dbRecord) return dbRecord;
    
    const baseTransformed = super.transformFromDB(dbRecord);
    
    // Map database snake_case fields to TypeScript camelCase
    return {
      ...baseTransformed,
      customerId: dbRecord.customer_id || '',
      customerName: dbRecord.customer_name || '',
      salesRepId: dbRecord.sales_rep_id || '',
      salesRepName: dbRecord.sales_rep_name || '',
      paymentStatus: dbRecord.payment_status || 'pending',
      paymentMethod: dbRecord.payment_method || '',
      paymentMethodId: dbRecord.payment_method_id || '',
      paymentTableId: dbRecord.payment_table_id || '',
      dueDate: dbRecord.due_date ? new Date(dbRecord.due_date) : new Date(),
      deliveryAddress: dbRecord.delivery_address || '',
      deliveryCity: dbRecord.delivery_city || '',
      deliveryState: dbRecord.delivery_state || '',
      deliveryZip: dbRecord.delivery_zip || ''
    };
  }

  // Override the transformToDB method to map TypeScript interface to database fields
  protected transformToDB(record: Partial<Order>): any {
    if (!record) return record;
    
    const baseTransformed = super.transformToDB(record);
    
    // Map TypeScript camelCase fields to database snake_case
    const dbRecord = {
      ...baseTransformed,
      customer_id: record.customerId,
      customer_name: record.customerName,
      sales_rep_id: record.salesRepId,
      sales_rep_name: record.salesRepName,
      payment_status: record.paymentStatus || 'pending',
      payment_method: record.paymentMethod,
      payment_method_id: record.paymentMethodId || null, // Convert empty string to null
      payment_table_id: record.paymentTableId || null, // Convert empty string to null
      due_date: record.dueDate ? record.dueDate.toISOString() : null,
      delivery_address: record.deliveryAddress,
      delivery_city: record.deliveryCity,
      delivery_state: record.deliveryState,
      delivery_zip: record.deliveryZip
    };

    // Remove the camelCase fields that don't exist in the database
    delete dbRecord.customerId;
    delete dbRecord.customerName;
    delete dbRecord.salesRepId;
    delete dbRecord.salesRepName;
    delete dbRecord.paymentStatus;
    delete dbRecord.paymentMethod;
    delete dbRecord.paymentMethodId;
    delete dbRecord.paymentTableId;
    delete dbRecord.dueDate;
    delete dbRecord.deliveryAddress;
    delete dbRecord.deliveryCity;
    delete dbRecord.deliveryState;
    delete dbRecord.deliveryZip;
    
    // IMPORTANT: Remove items field as it doesn't exist in orders table
    delete dbRecord.items;
    
    console.log("📝 Transform to DB result:", dbRecord);
    return dbRecord;
  }

  async generateNextCode(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_next_order_code');
      
      if (error) {
        console.error('Error generating order code:', error);
        // Fallback: get max code and add 1
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
      
      // Extract items before transforming order data
      const items = orderData.items || [];
      
      // Transform the order data for database (without items)
      const transformedOrderData = this.transformToDB(orderData);
      
      // Add timestamps
      const orderWithTimestamps = {
        ...transformedOrderData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      console.log('Transformed order data for DB:', orderWithTimestamps);
      
      // Insert the order
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
      
      // Insert order items if they exist
      if (items && items.length > 0) {
        const orderItems = items.map(item => ({
          order_id: orderId,
          product_id: item.productId,
          product_name: item.productName,
          product_code: item.productCode,
          quantity: item.quantity,
          price: item.unitPrice || item.price,
          unit_price: item.unitPrice || item.price,
          total: item.total,
          discount: item.discount || 0,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }));
        
        console.log('Inserting order items:', orderItems);
        
        const { error: itemsError } = await this.supabase
          .from('order_items')
          .insert(orderItems);
        
        if (itemsError) {
          console.error('Error adding order items:', itemsError);
          // Try to clean up the order if items failed
          await this.supabase.from('orders').delete().eq('id', orderId);
          throw itemsError;
        }
        
        console.log('Order items added successfully');
      }
      
      return orderId;
    } catch (error) {
      console.error('Error in addWithItems:', error);
      throw error;
    }
  }
}

export const orderService = new OrderSupabaseService();

