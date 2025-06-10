import { supabase } from '@/integrations/supabase/client';
import { Order, MobileOrderGroup } from '@/types';
import { OrderTransformations } from './orderService/orderTransformations';
import { OrderItemsHandler } from './orderService/orderItemsHandler';

class MobileOrderImportService {
  async getPendingMobileOrders(): Promise<Order[]> {
    try {
      console.log('🔍 Getting pending mobile orders...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('source_project', 'mobile')
        .eq('import_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('❌ Error getting pending mobile orders:', ordersError);
        throw ordersError;
      }
      
      if (!ordersData || ordersData.length === 0) {
        console.log('📝 No pending mobile orders found');
        return [];
      }
      
      // Get order items for all orders
      const itemsByOrderId = await OrderItemsHandler.getAllOrderItems();
      
      const orders = ordersData.map(orderData => {
        const orderWithItems = {
          ...orderData,
          items: itemsByOrderId[orderData.id] || []
        };
        return OrderTransformations.transformFromDB(orderWithItems);
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
      console.log(`📦 Importing ${orderIds.length} mobile orders...`);
      
      const { error } = await supabase
        .from('orders')
        .update({
          import_status: 'imported',
          imported_at: new Date().toISOString(),
          imported_by: importedBy
        })
        .in('id', orderIds);
      
      if (error) {
        console.error('❌ Error importing orders:', error);
        throw error;
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
        .from('orders')
        .update({
          import_status: 'rejected',
          imported_at: new Date().toISOString(),
          imported_by: rejectedBy
        })
        .in('id', orderIds);
      
      if (error) {
        console.error('❌ Error rejecting orders:', error);
        throw error;
      }
      
      console.log('✅ Orders rejected successfully');
    } catch (error) {
      console.error('❌ Error in rejectOrders:', error);
      throw error;
    }
  }

  async getImportHistory(): Promise<Order[]> {
    try {
      console.log('📊 Getting import history...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select('*')
        .eq('source_project', 'mobile')
        .in('import_status', ['imported', 'rejected'])
        .order('imported_at', { ascending: false })
        .limit(100);
      
      if (ordersError) {
        console.error('❌ Error getting import history:', ordersError);
        throw ordersError;
      }
      
      if (!ordersData || ordersData.length === 0) {
        return [];
      }
      
      const orders = ordersData.map(orderData => OrderTransformations.transformFromDB(orderData));
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
