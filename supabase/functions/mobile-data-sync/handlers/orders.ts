
import { createCorsResponse } from '../utils/cors.ts';
import { validateMobileOrder, createValidationErrorResponse } from '../utils/orderValidation.ts';

export async function syncOrders(
  supabase: any,
  salesRepId: string
) {
  try {
    console.log(`📱 Syncing orders for sales rep: ${salesRepId}`);
    
    // Get pending mobile orders for this sales rep
    const { data: mobileOrders, error: mobileOrdersError } = await supabase
      .from('mobile_orders')
      .select(`
        *,
        mobile_order_items(*)
      `)
      .eq('sales_rep_id', salesRepId)
      .eq('sync_status', 'pending')
      .order('created_at', { ascending: false });
    
    if (mobileOrdersError) {
      console.error('❌ Error fetching mobile orders:', mobileOrdersError);
      throw mobileOrdersError;
    }
    
    console.log(`✅ Found ${mobileOrders?.length || 0} pending mobile orders`);
    
    return {
      orders: mobileOrders || [],
      lastSync: new Date().toISOString()
    };
    
  } catch (error) {
    console.error('❌ Error in syncOrders:', error);
    throw error;
  }
}

export async function receiveOrders(
  supabase: any,
  orders: any[],
  salesRepId: string
) {
  try {
    console.log(`📱 Receiving ${orders.length} orders from mobile for sales rep: ${salesRepId}`);
    
    const processedOrders = [];
    
    for (const orderData of orders) {
      try {
        console.log(`🔍 Processing order ${orderData.id} from mobile app`);
        
        // VALIDAÇÃO RIGOROSA: Rejeitar pedidos com dados inconsistentes
        const validation = validateMobileOrder(orderData);
        
        if (!validation.isValid) {
          console.error(`❌ Order ${orderData.id} failed validation:`, validation.errors);
          
          processedOrders.push({
            localId: orderData.id,
            serverId: null,
            status: 'validation_error',
            errorCode: validation.errorCode,
            validationErrors: validation.errors,
            error: `Order validation failed: ${validation.errors.join(', ')}`
          });
          
          // Continue para o próximo pedido, não salvar este
          continue;
        }
        
        console.log(`✅ Order ${orderData.id} passed validation, proceeding with save`);
        
        // Insert order into mobile_orders table
        const { data: insertedOrder, error: orderError } = await supabase
          .from('mobile_orders')
          .insert({
            customer_id: orderData.customerId,
            customer_name: orderData.customerName,
            customer_code: orderData.customerCode,
            sales_rep_id: salesRepId,
            sales_rep_name: orderData.salesRepName,
            date: orderData.date,
            due_date: orderData.dueDate,
            delivery_date: orderData.deliveryDate,
            total: orderData.total || 0,
            discount: orderData.discount || 0,
            status: orderData.status || 'pending',
            payment_status: orderData.paymentStatus || 'pending',
            payment_method: orderData.paymentMethod,
            payment_method_id: orderData.paymentMethodId,
            payment_table_id: orderData.paymentTableId,
            payment_table: orderData.paymentTable,
            payments: orderData.payments || [],
            notes: orderData.notes,
            delivery_address: orderData.deliveryAddress,
            delivery_city: orderData.deliveryCity,
            delivery_state: orderData.deliveryState,
            delivery_zip: orderData.deliveryZip,
            rejection_reason: orderData.rejectionReason,
            visit_notes: orderData.visitNotes,
            mobile_order_id: orderData.id,
            sync_status: 'synced',
            imported_to_orders: false
          })
          .select()
          .single();
        
        if (orderError) {
          console.error('❌ Error inserting mobile order:', orderError);
          
          processedOrders.push({
            localId: orderData.id,
            serverId: null,
            status: 'database_error',
            errorCode: 'DB_INSERT_FAILED',
            error: `Database error: ${orderError.message}`
          });
          
          continue;
        }
        
        // Insert order items if they exist
        if (orderData.items && orderData.items.length > 0) {
          const itemsToInsert = orderData.items.map((item: any) => ({
            mobile_order_id: insertedOrder.id,
            product_id: item.productId,
            product_name: item.productName,
            product_code: item.productCode,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            price: item.price,
            discount: item.discount || 0,
            total: item.total,
            unit: item.unit || 'UN'
          }));
          
          const { error: itemsError } = await supabase
            .from('mobile_order_items')
            .insert(itemsToInsert);
          
          if (itemsError) {
            console.error('❌ Error inserting mobile order items:', itemsError);
            
            // Rollback: remover o pedido se os itens falharam
            await supabase
              .from('mobile_orders')
              .delete()
              .eq('id', insertedOrder.id);
            
            processedOrders.push({
              localId: orderData.id,
              serverId: null,
              status: 'items_error',
              errorCode: 'ITEMS_INSERT_FAILED',
              error: `Items insertion failed: ${itemsError.message}`
            });
            
            continue;
          }
        }
        
        processedOrders.push({
          localId: orderData.id,
          serverId: insertedOrder.id,
          code: insertedOrder.code,
          status: 'synced'
        });
        
        console.log(`✅ Order ${orderData.id} synced successfully as mobile order ${insertedOrder.id}`);
        
      } catch (orderError) {
        console.error(`❌ Error processing order ${orderData.id}:`, orderError);
        processedOrders.push({
          localId: orderData.id,
          serverId: null,
          status: 'error',
          errorCode: 'PROCESSING_ERROR',
          error: orderError.message
        });
      }
    }
    
    console.log(`✅ Processed ${processedOrders.length} orders for sales rep ${salesRepId}`);
    
    // Contar resultados para log
    const successCount = processedOrders.filter(o => o.status === 'synced').length;
    const validationErrorCount = processedOrders.filter(o => o.status === 'validation_error').length;
    const errorCount = processedOrders.length - successCount;
    
    console.log(`📊 Results: ${successCount} synced, ${validationErrorCount} validation errors, ${errorCount - validationErrorCount} other errors`);
    
    return {
      processedOrders,
      syncedAt: new Date().toISOString(),
      summary: {
        total: processedOrders.length,
        synced: successCount,
        validationErrors: validationErrorCount,
        otherErrors: errorCount - validationErrorCount
      }
    };
    
  } catch (error) {
    console.error('❌ Error in receiveOrders:', error);
    throw error;
  }
}

export async function handleSyncOrders(supabase: any, salesRepCode: string, lastSync?: string, ordersToSync?: any[]) {
  // Se há pedidos para sincronizar (enviados do mobile), processa eles
  if (ordersToSync && ordersToSync.length > 0) {
    console.log(`📱 Processing ${ordersToSync.length} orders from mobile`);
    return createCorsResponse(await receiveOrders(supabase, ordersToSync, salesRepCode));
  }
  
  // Caso contrário, retorna pedidos pendentes para o mobile
  const result = await syncOrders(supabase, salesRepCode);
  return createCorsResponse(result);
}
