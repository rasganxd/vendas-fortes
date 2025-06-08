
import { supabase } from '@/integrations/supabase/client';
import { Order } from '@/types';
import { OrderTransformations } from './orderService/orderTransformations';

class MobileOrderImportService {
  /**
   * Get all pending mobile orders grouped by sales rep
   */
  async getPendingMobileOrders(): Promise<Order[]> {
    try {
      console.log('📱 Getting pending mobile orders...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('source_project', 'mobile')
        .eq('import_status', 'pending')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('❌ Error getting pending mobile orders:', ordersError);
        throw ordersError;
      }
      
      const orders = (ordersData || []).map(orderData => 
        OrderTransformations.transformFromDB(orderData)
      );
      
      console.log(`✅ Found ${orders.length} pending mobile orders`);
      return orders;
    } catch (error) {
      console.error('❌ Error in getPendingMobileOrders:', error);
      throw error;
    }
  }
  
  /**
   * Import selected mobile orders
   */
  async importMobileOrders(orderIds: string[], importedBy: string): Promise<void> {
    try {
      console.log(`📥 Importing ${orderIds.length} mobile orders...`);
      
      const { error } = await supabase
        .from('orders')
        .update({
          import_status: 'imported',
          imported_at: new Date().toISOString(),
          imported_by: importedBy,
          source_project: 'admin', // Move to admin after import
          updated_at: new Date().toISOString()
        })
        .in('id', orderIds)
        .eq('import_status', 'pending'); // Safety check
      
      if (error) {
        console.error('❌ Error importing mobile orders:', error);
        throw error;
      }
      
      console.log(`✅ Successfully imported ${orderIds.length} mobile orders`);
    } catch (error) {
      console.error('❌ Error in importMobileOrders:', error);
      throw error;
    }
  }
  
  /**
   * Reject selected mobile orders
   */
  async rejectMobileOrders(orderIds: string[], rejectedBy: string): Promise<void> {
    try {
      console.log(`❌ Rejecting ${orderIds.length} mobile orders...`);
      
      const { error } = await supabase
        .from('orders')
        .update({
          import_status: 'rejected',
          imported_at: new Date().toISOString(),
          imported_by: rejectedBy,
          updated_at: new Date().toISOString()
        })
        .in('id', orderIds)
        .eq('import_status', 'pending'); // Safety check
      
      if (error) {
        console.error('❌ Error rejecting mobile orders:', error);
        throw error;
      }
      
      console.log(`✅ Successfully rejected ${orderIds.length} mobile orders`);
    } catch (error) {
      console.error('❌ Error in rejectMobileOrders:', error);
      throw error;
    }
  }
  
  /**
   * Get import history
   */
  async getImportHistory(): Promise<Order[]> {
    try {
      console.log('📊 Getting mobile orders import history...');
      
      const { data: ordersData, error: ordersError } = await supabase
        .from('orders')
        .select(`
          *,
          order_items(*)
        `)
        .eq('source_project', 'admin')
        .not('mobile_order_id', 'is', null)
        .in('import_status', ['imported', 'rejected'])
        .order('imported_at', { ascending: false })
        .limit(100);
      
      if (ordersError) {
        console.error('❌ Error getting import history:', ordersError);
        throw ordersError;
      }
      
      const orders = (ordersData || []).map(orderData => 
        OrderTransformations.transformFromDB(orderData)
      );
      
      console.log(`✅ Found ${orders.length} orders in import history`);
      return orders;
    } catch (error) {
      console.error('❌ Error in getImportHistory:', error);
      throw error;
    }
  }
}

export const mobileOrderImportService = new MobileOrderImportService();
