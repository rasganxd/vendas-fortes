
import { createCorsResponse } from '../utils/cors.ts';
import { getSalesRepById } from '../utils/validation.ts';

export async function handleSyncOrders(supabase: any, salesRepCode: number, lastSync?: string) {
  // Get orders for the specific sales rep
  const repForOrders = await getSalesRepById(supabase, salesRepCode);
  if (!repForOrders) {
    return createCorsResponse({ 
      success: false, 
      error: 'Sales rep not found' 
    }, 404);
  }

  console.log(`📋 [mobile-data-sync] Getting orders for sales rep: ${repForOrders.name} (ID: ${repForOrders.id})`);

  let ordersQuery = supabase
    .from('orders')
    .select(`
      *,
      order_items(*)
    `)
    .eq('sales_rep_id', repForOrders.id);

  // Add lastSync filter if provided
  if (lastSync) {
    ordersQuery = ordersQuery.gte('updated_at', lastSync);
    console.log(`📅 [mobile-data-sync] Filtering orders since: ${lastSync}`);
  }

  const { data: orders, error: ordersError } = await ordersQuery.order('created_at', { ascending: false });

  if (ordersError) {
    console.log(`❌ [mobile-data-sync] Error fetching orders:`, ordersError);
    return createCorsResponse({ 
      success: false, 
      error: 'Error fetching orders' 
    }, 500);
  }

  console.log(`✅ [mobile-data-sync] Found ${orders?.length || 0} orders for sales rep ${repForOrders.name}`);

  return createCorsResponse({ 
    success: true, 
    orders: orders || [],
    syncTime: new Date().toISOString(),
    salesRepInfo: {
      id: repForOrders.id,
      name: repForOrders.name,
      code: salesRepCode
    }
  });
}
