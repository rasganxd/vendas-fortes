import { supabase } from '@/integrations/supabase/client';
import { Order, MobileOrderGroup } from '@/types';
import { OrderTransformations } from './orderService/orderTransformations';
import { importReportPersistenceService } from './importReportPersistenceService';
import { mobileImportReportService, ImportReportData } from '../mobileImportReportService';

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

  async fixOrderMissingData(orderCode: number): Promise<void> {
    try {
      console.log(`🔧 Fixing missing data for order #${orderCode}...`);
      
      // First, find the order in the orders table
      const { data: order, error: orderError } = await supabase
        .from('orders')
        .select('*')
        .eq('code', orderCode)
        .eq('source_project', 'mobile')
        .single();
      
      if (orderError || !order) {
        console.error('❌ Order not found:', orderError);
        throw new Error(`Order #${orderCode} not found`);
      }
      
      console.log(`📋 Found order: ${order.id} (mobile_order_id: ${order.mobile_order_id})`);
      
      // Find the corresponding mobile order
      const { data: mobileOrder, error: mobileOrderError } = await supabase
        .from('mobile_orders')
        .select('*')
        .eq('id', order.mobile_order_id)
        .single();
      
      if (mobileOrderError || !mobileOrder) {
        console.error('❌ Mobile order not found:', mobileOrderError);
        throw new Error(`Mobile order ${order.mobile_order_id} not found`);
      }
      
      // Get mobile order items
      const { data: mobileOrderItems, error: itemsError } = await supabase
        .from('mobile_order_items')
        .select('*')
        .eq('mobile_order_id', order.mobile_order_id);
      
      if (itemsError) {
        console.error('❌ Error getting mobile order items:', itemsError);
        throw itemsError;
      }
      
      console.log(`📦 Found ${mobileOrderItems?.length || 0} items in mobile order`);
      
      // Check if order already has items
      const { data: existingItems, error: existingItemsError } = await supabase
        .from('order_items')
        .select('*')
        .eq('order_id', order.id);
      
      if (existingItemsError) {
        console.error('❌ Error checking existing items:', existingItemsError);
        throw existingItemsError;
      }
      
      console.log(`📋 Order currently has ${existingItems?.length || 0} items`);
      
      // Add missing items if any
      if (mobileOrderItems && mobileOrderItems.length > 0 && (!existingItems || existingItems.length === 0)) {
        console.log('➕ Adding missing items to order...');
        
        const itemsToInsert = mobileOrderItems.map(item => ({
          order_id: order.id,
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
        
        const { error: insertItemsError } = await supabase
          .from('order_items')
          .insert(itemsToInsert);
        
        if (insertItemsError) {
          console.error('❌ Error inserting items:', insertItemsError);
          throw insertItemsError;
        }
        
        console.log(`✅ Added ${itemsToInsert.length} items to order`);
      }
      
      // Fix payment method if it's null or empty
      const needsPaymentFix = !order.payment_method || order.payment_method === '';
      
      if (needsPaymentFix && mobileOrder.payment_method) {
        console.log('🔄 Fixing payment method...');
        
        const { error: updateError } = await supabase
          .from('orders')
          .update({
            payment_method: mobileOrder.payment_method,
            payment_method_id: mobileOrder.payment_method_id,
            payment_table: mobileOrder.payment_table,
            payment_table_id: mobileOrder.payment_table_id,
            updated_at: new Date().toISOString()
          })
          .eq('id', order.id);
        
        if (updateError) {
          console.error('❌ Error updating payment method:', updateError);
          throw updateError;
        }
        
        console.log('✅ Payment method updated');
      }
      
      console.log(`🎉 Order #${orderCode} data fixed successfully!`);
    } catch (error) {
      console.error('❌ Error in fixOrderMissingData:', error);
      throw error;
    }
  }

  async importOrders(orderIds: string[], importedBy: string = 'admin'): Promise<ImportReportData> {
    try {
      console.log(`📦 Importing ${orderIds.length} mobile orders to orders table...`);
      
      // First, check if any of these orders were already imported
      const { data: existingOrders, error: checkError } = await supabase
        .from('orders')
        .select('mobile_order_id')
        .in('mobile_order_id', orderIds)
        .eq('source_project', 'mobile');
      
      if (checkError) {
        console.error('❌ Error checking for existing orders:', checkError);
        throw checkError;
      }
      
      const alreadyImportedIds = new Set(existingOrders?.map(o => o.mobile_order_id) || []);
      const ordersToImport = orderIds.filter(id => !alreadyImportedIds.has(id));
      
      if (alreadyImportedIds.size > 0) {
        console.log(`⚠️ ${alreadyImportedIds.size} orders were already imported, skipping them`);
        console.log(`📦 Proceeding with ${ordersToImport.length} new orders`);
        
        // Mark the already imported mobile orders as imported if they weren't marked
        await supabase
          .from('mobile_orders')
          .update({
            imported_to_orders: true,
            imported_at: new Date().toISOString(),
            imported_by: importedBy
          })
          .in('id', Array.from(alreadyImportedIds));
      }
      
      if (ordersToImport.length === 0) {
        console.log('✅ All orders were already imported');
        // Still generate a report for tracking
        const { data: mobileOrders } = await supabase
          .from('mobile_orders')
          .select('*')
          .in('id', orderIds);
        
        const ordersData = (mobileOrders || []).map(orderData => OrderTransformations.transformFromMobileOrder(orderData));
        const report = mobileImportReportService.generateImportReport(ordersData, 'import', importedBy);
        await importReportPersistenceService.saveImportReport(report);
        return report;
      }
      
      // Get mobile orders data
      const { data: mobileOrders, error: mobileOrdersError } = await supabase
        .from('mobile_orders')
        .select('*')
        .in('id', ordersToImport);
      
      if (mobileOrdersError) {
        console.error('❌ Error getting mobile orders for import:', mobileOrdersError);
        throw mobileOrdersError;
      }
      
      if (!mobileOrders || mobileOrders.length === 0) {
        throw new Error('No mobile orders found for import');
      }
      
      // Get payment table names for orders that have payment_table_id
      const orderIdsWithPaymentTable = mobileOrders
        .filter(order => order.payment_table_id)
        .map(order => order.payment_table_id);
      
      let paymentTableNames: Record<string, string> = {};
      
      if (orderIdsWithPaymentTable.length > 0) {
        const { data: paymentTables, error: paymentTablesError } = await supabase
          .from('payment_tables')
          .select('id, name')
          .in('id', orderIdsWithPaymentTable);
        
        if (paymentTablesError) {
          console.error('❌ Error getting payment tables:', paymentTablesError);
        } else if (paymentTables) {
          paymentTableNames = paymentTables.reduce((acc, table) => {
            acc[table.id] = table.name;
            return acc;
          }, {} as Record<string, string>);
        }
      }
      
      // Get items for these orders
      const { data: mobileOrderItems, error: itemsError } = await supabase
        .from('mobile_order_items')
        .select('*')
        .in('mobile_order_id', ordersToImport);
      
      if (itemsError) {
        console.error('❌ Error getting mobile order items:', itemsError);
        throw itemsError;
      }
      
      console.log(`📦 Found ${mobileOrderItems?.length || 0} items to import for ${mobileOrders.length} orders`);
      
      // Import each order with enhanced validation
      for (const mobileOrder of mobileOrders) {
        console.log(`📋 Importing mobile order ${mobileOrder.id} (code: ${mobileOrder.code})`);
        
        // Get payment table name
        const paymentTableName = mobileOrder.payment_table_id 
          ? paymentTableNames[mobileOrder.payment_table_id] 
          : mobileOrder.payment_table;
        
        // Validate payment method - use a default if empty
        const paymentMethod = mobileOrder.payment_method || 'A Definir';
        const paymentMethodId = mobileOrder.payment_method_id || '';
        
        console.log(`💳 Payment info: method="${paymentMethod}", table="${paymentTableName || 'none'}"`);
        
        // Insert into orders table with proper mobile_order_id mapping
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
            payment_method: paymentMethod,
            payment_method_id: paymentMethodId,
            payment_table_id: mobileOrder.payment_table_id,
            payment_table: paymentTableName,
            payments: mobileOrder.payments,
            notes: mobileOrder.notes,
            delivery_address: mobileOrder.delivery_address,
            delivery_city: mobileOrder.delivery_city,
            delivery_state: mobileOrder.delivery_state,
            delivery_zip: mobileOrder.delivery_zip,
            rejection_reason: mobileOrder.rejection_reason,
            visit_notes: mobileOrder.visit_notes,
            mobile_order_id: mobileOrder.id,
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
        
        console.log(`✅ Order imported as ${insertedOrder.id} with mobile_order_id: ${mobileOrder.id}`);
        console.log(`💳 Payment: method="${paymentMethod}", table="${paymentTableName || 'none'}"`);
        
        // Insert order items if they exist with enhanced validation
        const orderItems = (mobileOrderItems || []).filter(item => item.mobile_order_id === mobileOrder.id);
        
        if (orderItems.length > 0) {
          console.log(`📦 Importing ${orderItems.length} items for order ${insertedOrder.id}`);
          
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
            console.error('❌ Rolling back order due to items error...');
            
            // Rollback: delete the order if items failed to import
            await supabase
              .from('orders')
              .delete()
              .eq('id', insertedOrder.id);
            
            throw itemsInsertError;
          }
          
          console.log(`✅ Successfully imported ${orderItems.length} items for order ${insertedOrder.id}`);
          
          // Verify items were inserted correctly
          const { data: verifyItems, error: verifyError } = await supabase
            .from('order_items')
            .select('*')
            .eq('order_id', insertedOrder.id);
          
          if (verifyError) {
            console.error('❌ Error verifying items:', verifyError);
          } else {
            console.log(`🔍 Verification: ${verifyItems?.length || 0} items found in database`);
            if ((verifyItems?.length || 0) !== orderItems.length) {
              console.error(`⚠️ Items count mismatch! Expected: ${orderItems.length}, Found: ${verifyItems?.length || 0}`);
            }
          }
        } else {
          console.log(`⚠️ No items found for mobile order ${mobileOrder.id}`);
          if (mobileOrder.total > 0) {
            console.warn(`⚠️ WARNING: Order has value (${mobileOrder.total}) but no items!`);
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
        
        console.log(`🔄 Mobile order ${mobileOrder.id} marked as imported`);
        console.log('---');
      }
      
      // Get the selected orders for the report (including already imported ones)
      const { data: allMobileOrders } = await supabase
        .from('mobile_orders')
        .select('*')
        .in('id', orderIds);
      
      const selectedOrdersData = (allMobileOrders || []).map(orderData => OrderTransformations.transformFromMobileOrder(orderData));
      
      // Generate and save import report
      const report = mobileImportReportService.generateImportReport(
        selectedOrdersData,
        'import',
        importedBy
      );
      
      await importReportPersistenceService.saveImportReport(report);
      
      console.log('✅ Orders imported successfully with enhanced validation and report saved');
      return report;
    } catch (error) {
      console.error('❌ Error in importOrders:', error);
      throw error;
    }
  }

  async rejectOrders(orderIds: string[], rejectedBy: string = 'admin'): Promise<ImportReportData> {
    try {
      console.log(`🚫 Rejecting ${orderIds.length} mobile orders...`);
      
      // Get the orders for the report before rejecting
      const { data: mobileOrders } = await supabase
        .from('mobile_orders')
        .select('*')
        .in('id', orderIds);
      
      const selectedOrdersData = (mobileOrders || []).map(orderData => OrderTransformations.transformFromMobileOrder(orderData));
      
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
      
      // Generate and save rejection report
      const report = mobileImportReportService.generateImportReport(
        selectedOrdersData,
        'reject',
        rejectedBy
      );
      
      await importReportPersistenceService.saveImportReport(report);
      
      console.log('✅ Mobile orders rejected successfully and report saved');
      return report;
    } catch (error) {
      console.error('❌ Error in rejectOrders:', error);
      throw error;
    }
  }

  async getImportHistory(): Promise<any[]> {
    try {
      console.log('📊 Getting import history...');
      
      // This method is now deprecated in favor of the new grouped history
      // Return empty array to maintain compatibility
      console.log('⚠️ This method is deprecated, use importReportPersistenceService.getImportHistory() instead');
      return [];
    } catch (error) {
      console.error('❌ Error in getImportHistory:', error);
      throw error;
    }
  }

  async fixExistingDataInconsistencies(): Promise<void> {
    try {
      console.log('🔧 Fixing existing data inconsistencies...');
      
      // Find orders in the orders table that came from mobile but their corresponding mobile_orders are not marked as imported
      const { data: importedOrders, error: ordersError } = await supabase
        .from('orders')
        .select('id, mobile_order_id')
        .eq('source_project', 'mobile')
        .not('mobile_order_id', 'is', null);
      
      if (ordersError) {
        console.error('❌ Error getting imported orders:', ordersError);
        throw ordersError;
      }
      
      if (!importedOrders || importedOrders.length === 0) {
        console.log('📝 No imported mobile orders found in orders table');
        return;
      }
      
      const mobileOrderIds = importedOrders.map(o => o.mobile_order_id).filter(Boolean);
      
      if (mobileOrderIds.length === 0) {
        console.log('📝 No mobile order IDs found');
        return;
      }
      
      // Find mobile orders that should be marked as imported but aren't
      const { data: unmarkedMobileOrders, error: unmarkedError } = await supabase
        .from('mobile_orders')
        .select('id')
        .in('id', mobileOrderIds)
        .eq('imported_to_orders', false);
      
      if (unmarkedError) {
        console.error('❌ Error getting unmarked mobile orders:', unmarkedError);
        throw unmarkedError;
      }
      
      if (!unmarkedMobileOrders || unmarkedMobileOrders.length === 0) {
        console.log('✅ All mobile orders are correctly marked as imported');
        return;
      }
      
      console.log(`🔄 Found ${unmarkedMobileOrders.length} mobile orders that need to be marked as imported`);
      
      // Mark them as imported
      const { error: updateError } = await supabase
        .from('mobile_orders')
        .update({
          imported_to_orders: true,
          imported_at: new Date().toISOString(),
          imported_by: 'system_fix'
        })
        .in('id', unmarkedMobileOrders.map(o => o.id));
      
      if (updateError) {
        console.error('❌ Error fixing mobile orders status:', updateError);
        throw updateError;
      }
      
      console.log(`✅ Fixed ${unmarkedMobileOrders.length} mobile orders status`);
    } catch (error) {
      console.error('❌ Error in fixExistingDataInconsistencies:', error);
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
