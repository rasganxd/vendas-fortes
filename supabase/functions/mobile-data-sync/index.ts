
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.49.8'
import { corsHeaders, createCorsResponse, handleCorsOptions } from './utils/cors.ts';
import { validateSalesRepCode } from './utils/validation.ts';
import { handleGetSalesRep } from './handlers/salesRep.ts';
import { handleGetCustomers } from './handlers/customers.ts';
import { handleGetProducts } from './handlers/products.ts';
import { handleSyncOrders } from './handlers/orders.ts';
import { SyncRequest } from './types.ts';

Deno.serve(async (req) => {
  console.log(`📱 [mobile-data-sync] ${req.method} request received`);

  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return handleCorsOptions();
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { salesRepCode, action, lastSync }: SyncRequest = await req.json();
    console.log(`📱 [mobile-data-sync] Action: ${action}, Sales Rep Code: ${salesRepCode}`);

    // Validate sales rep code for all actions except get_sales_rep
    const validationError = validateSalesRepCode(salesRepCode, action || '');
    if (validationError) {
      return createCorsResponse({ 
        success: false, 
        error: validationError 
      }, 400);
    }

    switch (action) {
      case 'get_sales_rep':
        return await handleGetSalesRep(supabase, salesRepCode!);

      case 'get_customers':
        return await handleGetCustomers(supabase, salesRepCode!);

      case 'get_products':
        return await handleGetProducts(supabase);

      case 'sync_orders':
        return await handleSyncOrders(supabase, salesRepCode!, lastSync);

      default:
        return createCorsResponse({ 
          success: false, 
          error: 'Invalid action' 
        }, 400);
    }

  } catch (error) {
    console.error('❌ [mobile-data-sync] Critical error:', error);
    return createCorsResponse({ 
      success: false, 
      error: 'Internal server error',
      details: error.message 
    }, 500);
  }
});
