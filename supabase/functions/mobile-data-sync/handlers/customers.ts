
import { createCorsResponse } from '../utils/cors.ts';
import { getSalesRepById } from '../utils/validation.ts';

export async function handleGetCustomers(supabase: any, salesRepCode: number) {
  console.log(`📱 [mobile-data-sync] Getting customers for sales rep code: ${salesRepCode}`);
  
  // First get the sales rep ID
  const rep = await getSalesRepById(supabase, salesRepCode);
  if (!rep) {
    return createCorsResponse({ 
      success: false, 
      error: 'Sales rep not found' 
    }, 404);
  }

  // Get customers filtered by sales rep ID
  const { data: customers, error: customersError } = await supabase
    .from('customers')
    .select('*')
    .eq('sales_rep_id', rep.id)
    .eq('active', true)
    .order('name');

  if (customersError) {
    console.log(`❌ [mobile-data-sync] Error fetching customers:`, customersError);
    return createCorsResponse({ 
      success: false, 
      error: 'Error fetching customers' 
    }, 500);
  }

  console.log(`✅ [mobile-data-sync] Found ${customers?.length || 0} customers for sales rep ${rep.name}`);
  
  // Log customer details for debugging
  if (customers && customers.length > 0) {
    console.log(`📋 [mobile-data-sync] Customer details:`, customers.map(c => ({
      id: c.id,
      code: c.code,
      name: c.name,
      sales_rep_id: c.sales_rep_id
    })));
  }

  return createCorsResponse({ 
    success: true, 
    customers: customers || [],
    salesRepInfo: {
      id: rep.id,
      name: rep.name,
      code: salesRepCode
    }
  });
}
