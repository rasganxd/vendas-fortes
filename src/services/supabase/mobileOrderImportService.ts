import { supabase } from '@/integrations/supabase/client';
import { Order, MobileOrderGroup } from '@/types';
import { OrderTransformations } from './orderService/orderTransformations';
import { importReportPersistenceService } from './importReportPersistenceService';
import { mobileImportReportService, ImportReportData } from '../mobileImportReportService';

/**
 * MobileOrderImportService
 * 
 * Uses the mobile_order_import table which stores order data in a JSONB field.
 * This is the Cloud-compatible version that works with the existing schema.
 */
class MobileOrderImportService {
  async getPendingMobileOrders(): Promise<Order[]> {
    try {
      console.log('🔍 [MobileOrderImportService] Getting pending mobile orders...');
      
      const { data: mobileOrdersData, error: ordersError } = await supabase
        .from('mobile_order_import')
        .select('*')
        .eq('status', 'pending')
        .order('created_at', { ascending: false });
      
      if (ordersError) {
        console.error('❌ [MobileOrderImportService] Error getting pending mobile orders:', ordersError);
        throw ordersError;
      }
      
      console.log(`📊 [MobileOrderImportService] Found ${mobileOrdersData?.length || 0} pending mobile orders`);
      
      if (!mobileOrdersData || mobileOrdersData.length === 0) {
        console.log('📝 [MobileOrderImportService] No pending mobile orders found');
        return [];
      }
      
      // Transform mobile_order_import records to Order objects
      const orders: Order[] = [];
      for (const record of mobileOrdersData) {
        try {
          const orderData = record.order_data as any;
          if (!orderData) {
            console.warn(`⚠️ [MobileOrderImportService] Record ${record.id} has no order_data`);
            continue;
          }
          
          // Build order from order_data JSONB
          const order: Order = {
            id: record.id,
            code: orderData.code || 0,
            customerId: orderData.customer_id || '',
            customerName: orderData.customer_name || record.sales_rep_name || '',
            salesRepId: record.sales_rep_id || '',
            salesRepName: record.sales_rep_name || '',
            date: orderData.date ? new Date(orderData.date) : new Date(record.created_at),
            dueDate: orderData.due_date ? new Date(orderData.due_date) : undefined,
            deliveryDate: orderData.delivery_date ? new Date(orderData.delivery_date) : undefined,
            total: Number(orderData.total || 0),
            discount: Number(orderData.discount || 0),
            status: orderData.status || 'pending',
            paymentStatus: orderData.payment_status || 'pending',
            paymentMethod: orderData.payment_method || '',
            paymentMethodId: orderData.payment_method_id || '',
            paymentTableId: orderData.payment_table_id || '',
            paymentTable: orderData.payment_table || '',
            notes: orderData.notes || '',
            items: orderData.items || [],
            deliveryAddress: orderData.delivery_address || '',
            deliveryCity: orderData.delivery_city || '',
            deliveryState: orderData.delivery_state || '',
            deliveryZip: orderData.delivery_zip || '',
            rejectionReason: orderData.rejection_reason || '',
            sourceProject: 'mobile',
            importStatus: 'pending',
            createdAt: new Date(record.created_at),
            updatedAt: new Date(record.updated_at)
          };
          
          orders.push(order);
        } catch (error) {
          console.error(`❌ [MobileOrderImportService] Failed to transform record ${record.id}:`, error);
        }
      }
      
      console.log(`✅ [MobileOrderImportService] Successfully transformed ${orders.length} orders`);
      return orders;
    } catch (error) {
      console.error('❌ [MobileOrderImportService] Error in getPendingMobileOrders:', error);
      throw error;
    }
  }

  async groupOrdersBySalesRep(orders: Order[]): Promise<MobileOrderGroup[]> {
    console.log(`📊 [MobileOrderImportService] Grouping ${orders.length} orders by sales rep...`);
    
    const groups = new Map<string, MobileOrderGroup>();
    
    orders.forEach((order) => {
      const key = order.salesRepId || 'unknown';
      if (!groups.has(key)) {
        groups.set(key, {
          salesRepId: order.salesRepId || 'unknown',
          salesRepName: order.salesRepName || 'Vendedor sem nome',
          orders: [],
          totalValue: 0,
          count: 0
        });
      }
      
      const group = groups.get(key)!;
      group.orders.push(order);
      
      if (order.total > 0 && order.status !== 'cancelled' && order.status !== 'canceled') {
        group.totalValue += order.total;
      }
      group.count++;
    });
    
    const groupsArray = Array.from(groups.values()).sort((a, b) => a.salesRepName.localeCompare(b.salesRepName));
    
    console.log(`✅ [MobileOrderImportService] Created ${groupsArray.length} groups`);
    return groupsArray;
  }

  private sanitizeUUID(value: any): string | null {
    if (!value || value === '' || value === 'null' || value === 'undefined') {
      return null;
    }
    
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    if (typeof value === 'string' && uuidRegex.test(value)) {
      return value;
    }
    
    console.warn(`⚠️ Invalid UUID format: "${value}", converting to null`);
    return null;
  }

  async importOrders(orderIds: string[], importedBy: string = 'admin'): Promise<ImportReportData> {
    try {
      console.log(`📦 Importing ${orderIds.length} mobile orders to orders table...`);
      
      const { data: mobileOrders, error: mobileOrdersError } = await supabase
        .from('mobile_order_import')
        .select('*')
        .in('id', orderIds);
      
      if (mobileOrdersError) {
        console.error('❌ Error getting mobile orders for import:', mobileOrdersError);
        throw mobileOrdersError;
      }
      
      if (!mobileOrders || mobileOrders.length === 0) {
        throw new Error('No mobile orders found for import');
      }
      
      const importedOrders: Order[] = [];
      
      for (const record of mobileOrders) {
        const orderData = record.order_data as any;
        if (!orderData) continue;
        
        // Insert into orders table
        const orderInsertData = {
          customer_id: this.sanitizeUUID(orderData.customer_id),
          customer_name: orderData.customer_name || '',
          sales_rep_id: this.sanitizeUUID(record.sales_rep_id),
          sales_rep_name: record.sales_rep_name || '',
          date: orderData.date || new Date().toISOString(),
          due_date: orderData.due_date,
          delivery_date: orderData.delivery_date,
          total: orderData.total || 0,
          discount: orderData.discount || 0,
          status: orderData.status || 'pending',
          payment_status: orderData.payment_status || 'pending',
          payment_method: orderData.payment_method || 'A Definir',
          payment_method_id: this.sanitizeUUID(orderData.payment_method_id),
          payment_table_id: this.sanitizeUUID(orderData.payment_table_id),
          payment_table: orderData.payment_table || '',
          notes: orderData.notes || '',
          delivery_address: orderData.delivery_address || '',
          delivery_city: orderData.delivery_city || '',
          delivery_state: orderData.delivery_state || '',
          delivery_zip: orderData.delivery_zip || '',
          rejection_reason: orderData.rejection_reason || '',
          mobile_order_id: record.id,
          source_project: 'mobile',
          import_status: 'imported',
          imported_at: new Date().toISOString(),
          imported_by: importedBy
        };
        
        const { data: insertedOrder, error: orderError } = await supabase
          .from('orders')
          .insert(orderInsertData)
          .select()
          .single();
        
        if (orderError) {
          console.error('❌ Error importing order:', orderError);
          continue;
        }
        
        // Insert order items if they exist
        const items = orderData.items || [];
        if (items.length > 0) {
          const itemsToInsert = items.map((item: any) => ({
            order_id: insertedOrder.id,
            product_name: item.product_name || item.productName,
            product_code: item.product_code || item.productCode,
            quantity: item.quantity,
            unit_price: item.unit_price || item.unitPrice,
            price: item.price,
            discount: item.discount || 0,
            total: item.total,
            unit: item.unit || 'UN'
          }));
          
          const { error: itemsError } = await supabase
            .from('order_items')
            .insert(itemsToInsert);
          
          if (itemsError) {
            console.error('❌ Error importing order items:', itemsError);
          }
        }
        
        // Mark as imported
        await supabase
          .from('mobile_order_import')
          .update({
            status: 'imported',
            imported_at: new Date().toISOString(),
            imported_by: importedBy
          })
          .eq('id', record.id);
        
        importedOrders.push({
          id: insertedOrder.id,
          code: insertedOrder.code,
          customerId: insertedOrder.customer_id || '',
          customerName: insertedOrder.customer_name || '',
          salesRepId: insertedOrder.sales_rep_id || '',
          salesRepName: insertedOrder.sales_rep_name || '',
          date: new Date(insertedOrder.date),
          total: insertedOrder.total || 0,
          discount: insertedOrder.discount || 0,
          status: insertedOrder.status || 'pending',
          paymentStatus: insertedOrder.payment_status || 'pending',
          paymentMethod: insertedOrder.payment_method || '',
          items: [],
          createdAt: new Date(insertedOrder.created_at),
          updatedAt: new Date(insertedOrder.updated_at)
        });
      }
      
      const report = mobileImportReportService.generateImportReport(
        importedOrders,
        'import',
        importedBy
      );
      
      await importReportPersistenceService.saveReport(report);
      
      return report;
    } catch (error) {
      console.error('❌ [MobileOrderImportService] Error in importOrders:', error);
      throw error;
    }
  }

  async rejectOrders(orderIds: string[], rejectedBy: string = 'admin'): Promise<ImportReportData> {
    try {
      console.log(`🚫 Rejecting ${orderIds.length} mobile orders...`);
      
      const { error } = await supabase
        .from('mobile_order_import')
        .update({
          status: 'rejected',
          imported_by: rejectedBy
        })
        .in('id', orderIds);
      
      if (error) {
        console.error('❌ Error rejecting orders:', error);
        throw error;
      }
      
      const report = mobileImportReportService.generateImportReport(
        [],
        'rejection',
        rejectedBy
      );
      
      await importReportPersistenceService.saveReport(report);
      
      return report;
    } catch (error) {
      console.error('❌ [MobileOrderImportService] Error in rejectOrders:', error);
      throw error;
    }
  }

  async fixExistingDataInconsistencies(): Promise<void> {
    console.log('🔧 [MobileOrderImportService] Fixing data inconsistencies...');
    
    // Mark any old pending records as processed
    const { error } = await supabase
      .from('mobile_order_import')
      .update({ status: 'imported' })
      .eq('status', 'pending')
      .lt('created_at', new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString());
    
    if (error) {
      console.error('❌ Error fixing inconsistencies:', error);
      throw error;
    }
    
    console.log('✅ [MobileOrderImportService] Inconsistencies fixed');
  }

  async getImportHistory(): Promise<any[]> {
    const { data, error } = await supabase
      .from('import_reports')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(50);
    
    if (error) {
      console.error('❌ Error getting import history:', error);
      return [];
    }
    
    return data || [];
  }
}

export const mobileOrderImportService = new MobileOrderImportService();
