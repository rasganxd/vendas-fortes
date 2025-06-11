
import { supabase } from '@/integrations/supabase/client';
import { Order, MobileOrderGroup } from '@/types';
import { OrderTransformations } from './orderService/orderTransformations';

class MobileOrderImportService {
  async getPendingMobileOrders(): Promise<Order[]> {
    try {
      console.log('🔍 Getting pending mobile orders...');
      
      const { data: mobileOrdersData, error: ordersError } = await supabase
        .from('mobile_orders')
        .select('*')
        .eq('imported_to_orders', false)
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('❌ Error getting pending mobile orders:', ordersError);
        throw ordersError;
      }
      
      if (!mobileOrdersData || mobileOrdersData.length === 0) {
        console.log('📝 No pending mobile orders found');
        return [];
      }
      
      // Get order items for all mobile orders
      const orderIds = mobileOrdersData.map(order => order.id);
      const { data: itemsData, error: itemsError } = await supabase
        .from('mobile_order_items')
        .select('*')
        .in('mobile_order_id', orderIds);
      
      if (itemsError) {
        console.error('❌ Error getting mobile order items:', itemsError);
        throw itemsError;
      }
      
      // Group items by order id
      const itemsByOrderId: Record<string, any[]> = {};
      (itemsData || []).forEach(item => {
        if (!itemsByOrderId[item.mobile_order_id]) {
          itemsByOrderId[item.mobile_order_id] = [];
        }
        itemsByOrderId[item.mobile_order_id].push({
          id: item.id,
          orderId: item.mobile_order_id,
          productId: item.product_id,
          productName: item.product_name,
          productCode: item.product_code,
          quantity: item.quantity,
          unitPrice: item.unit_price,
          price: item.price,
          discount: item.discount || 0,
          total: item.total,
          unit: item.unit || 'UN'
        });
      });
      
      const orders = mobileOrdersData.map(orderData => {
        return OrderTransformations.transformFromMobileOrder({
          ...orderData,
          items: itemsByOrderId[orderData.id] || []
        });
      });
      
      // Log negative orders
      const negativeOrders = orders.filter(order => order.total === 0 && order.rejectionReason);
      const regularOrders = orders.filter(order => order.total > 0);
      
      console.log(`✅ Found ${orders.length} pending mobile orders:`);
      console.log(`  - ${regularOrders.length} sales orders`);
      console.log(`  - ${negativeOrders.length} negative orders (visits)`);
      
      return orders;
    } catch (error) {
      console.error('❌ Error in getPendingMobileOrders:', error);
      throw error;
    }
  }

  async groupOrdersBySalesRep(orders: Order[]): Promise<MobileOrderGroup[]> {
    const groups = new Map<string, MobileOrderGroup>();
    
    orders.forEach(order => {
      const key = order.salesRepId;
      if (!groups.has(key)) {
        groups.set(key, {
          salesRepId: order.salesRepId,
          salesRepName: order.salesRepName,
          orders: [],
          totalValue: 0,
          count: 0
        });
      }
      
      const group = groups.get(key)!;
      group.orders.push(order);
      // Only count positive orders for total value
      if (order.total > 0) {
        group.totalValue += order.total;
      }
      group.count++;
    });
    
    return Array.from(groups.values()).sort((a, b) => a.salesRepName.localeCompare(b.salesRepName));
  }

  async importOrders(orderIds: string[], importedBy: string = 'admin'): Promise<void> {
    try {
      console.log(`📦 Importing ${orderIds.length} mobile orders to orders table...`);
      
      // Get mobile orders with their items
      const { data: mobileOrders, error: mobileOrdersError } = await supabase
        .from('mobile_orders')
        .select('*')
        .in('id', orderIds);
      
      if (mobileOrdersError) {
        console.error('❌ Error getting mobile orders for import:', mobileOrdersError);
        throw mobileOrdersError;
      }
      
      if (!mobileOrders || mobileOrders.length === 0) {
        throw new Error('No mobile orders found for import');
      }
      
      // Get items for these orders
      const { data: mobileOrderItems, error: itemsError } = await supabase
        .from('mobile_order_items')
        .select('*')
        .in('mobile_order_id', orderIds);
      
      if (itemsError) {
        console.error('❌ Error getting mobile order items:', itemsError);
        throw itemsError;
      }
      
      // Import each order
      for (const mobileOrder of mobileOrders) {
        // Insert into orders table
        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert({
            customer_id: mobileOrder.customer_id,
            customer_name: mobileOrder.customer_name,
            sales_rep_id: mobileOrder.sales_rep_id,
            sales_rep_name: mobileOrder.sales_rep_name,
            date: mobileOrder.date,
            due_date: mobileOrder.due_date,
            delivery_date: mobileOrder.delivery_date,
            total: mobileOrder.total,
            discount: mobileOrder.discount,
            status: mobileOrder.status,
            payment_status: mobileOrder.payment_status,
            payment_method: mobileOrder.payment_method,
            payment_method_id: mobileOrder.payment_method_id,
            payment_table_id: mobileOrder.payment_table_id,
            payment_table: mobileOrder.payment_table,
            payments: mobileOrder.payments,
            notes: mobileOrder.notes,
            delivery_address: mobileOrder.delivery_address,
            delivery_city: mobileOrder.delivery_city,
            delivery_state: mobileOrder.delivery_state,
            delivery_zip: mobileOrder.delivery_zip,
            rejection_reason: mobileOrder.rejection_reason,
            visit_notes: mobileOrder.visit_notes,
            mobile_order_id: mobileOrder.mobile_order_id || mobileOrder.id,
            source_project: 'mobile',
            import_status: 'imported',
            imported_at: new Date().toISOString(),
            imported_by: importedBy
          })
          .select()
          .single();
        
        if (orderError) {
          console.error('❌ Error importing order:', orderError);
          throw orderError;
        }
        
        // Insert order items if they exist
        const orderItems = (mobileOrderItems || []).filter(item => item.mobile_order_id === mobileOrder.id);
        if (orderItems.length > 0) {
          const itemsToInsert = orderItems.map(item => ({
            order_id: insertedOrder.id,
            product_id: item.product_id,
            product_name: item.product_name,
            product_code: item.product_code,
            quantity: item.quantity,
            unit_price: item.unit_price,
            price: item.price,
            discount: item.discount,
            total: item.total,
            unit: item.unit
          }));
          
          const { error: itemsInsertError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);
          
          if (itemsInsertError) {
            console.error('❌ Error importing order items:', itemsInsertError);
            throw itemsInsertError;
          }
        }
        
        // Mark mobile order as imported
        const { error: updateError } = await supabase
          .from('mobile_orders')
          .update({
            imported_to_orders: true,
            imported_at: new Date().toISOString(),
            imported_by: importedBy
          })
          .eq('id', mobileOrder.id);
        
        if (updateError) {
          console.error('❌ Error marking mobile order as imported:', updateError);
          throw updateError;
        }
      }
      
      console.log('✅ Orders imported successfully');
    } catch (error) {
      console.error('❌ Error in importOrders:', error);
      throw error;
    }
  }

  async rejectOrders(orderIds: string[], rejectedBy: string = 'admin'): Promise<void> {
    try {
      console.log(`🚫 Rejecting ${orderIds.length} mobile orders...`);
      
      const { error } = await supabase
        .from('mobile_orders')
        .update({
          imported_to_orders: true, // Mark as processed
          imported_at: new Date().toISOString(),
          imported_by: rejectedBy,
          sync_status: 'rejected'
        })
        .in('id', orderIds);
      
      if (error) {
        console.error('❌ Error rejecting mobile orders:', error);
        throw error;
      }
      
      console.log('✅ Mobile orders rejected successfully');
    } catch (error) {
      console.error('❌ Error in rejectOrders:', error);
      throw error;
    }
  }

  async getImportHistory(): Promise<Order[]> {
    try {
      console.log('📊 Getting import history...');
      
      const { data: mobileOrdersData, error: ordersError } = await supabase
        .from('mobile_orders')
        .select('*')
        .eq('imported_to_orders', true)
        .order('imported_at', { ascending: false })
        .limit(100);
      
      if (ordersError) {
        console.error('❌ Error getting import history:', ordersError);
        throw ordersError;
      }
      
      if (!mobileOrdersData || mobileOrdersData.length === 0) {
        return [];
      }
      
      const orders = mobileOrdersData.map(orderData => OrderTransformations.transformFromMobileOrder(orderData));
      console.log(`✅ Found ${orders.length} import history records`);
      return orders;
    } catch (error) {
      console.error('❌ Error in getImportHistory:', error);
      throw error;
    }
  }

  private validateOrderForImport(order: Order): { isValid: boolean; errors: string[] } {
    const errors: string[] = [];
    
    // Basic validations for all orders
    if (!order.customerId || !order.customerName) {
      errors.push('Customer information is required');
    }
    
    if (!order.salesRepId || !order.salesRepName) {
      errors.push('Sales rep information is required');
    }
    
    // Specific validations based on order type
    if (order.total > 0) {
      // Regular sales order validation
      if (!order.items || order.items.length === 0) {
        errors.push('Sales orders must have at least one item');
      }
    } else if (order.total === 0) {
      // Negative order (visit) validation
      if (!order.rejectionReason) {
        errors.push('Negative orders must have a rejection reason');
      }
      // Negative orders can have empty items array, that's OK
    } else {
      errors.push('Order total cannot be negative');
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  }
}

export const mobileOrderImportService = new MobileOrderImportService();
