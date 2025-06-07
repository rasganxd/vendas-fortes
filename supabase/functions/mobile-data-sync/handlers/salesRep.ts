
import { createCorsResponse } from '../utils/cors.ts';

export async function handleGetSalesRep(supabase: any, salesRepCode: number) {
  if (!salesRepCode) {
    return createCorsResponse({ 
      success: false, 
      error: 'Sales rep code is required' 
    }, 400);
  }

  const { data: salesRep, error: salesRepError } = await supabase
    .from('sales_reps')
    .select('*')
    .eq('code', salesRepCode)
    .eq('active', true)
    .single();

  if (salesRepError || !salesRep) {
    console.log(`❌ [mobile-data-sync] Sales rep not found: ${salesRepCode}`);
    return createCorsResponse({ 
      success: false, 
      error: 'Sales rep not found' 
    }, 404);
  }

  return createCorsResponse({ 
    success: true, 
    salesRep: {
      id: salesRep.id,
      code: salesRep.code,
      name: salesRep.name,
      phone: salesRep.phone,
      email: salesRep.email,
      active: salesRep.active
    }
  });
}
