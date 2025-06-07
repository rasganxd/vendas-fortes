
import { createCorsResponse } from '../utils/cors.ts';

export async function handleGetProducts(supabase: any) {
  // Products are global, not filtered by sales rep
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      product_groups(name),
      product_categories(name),
      product_brands(name)
    `)
    .eq('active', true)
    .order('name');

  if (productsError) {
    console.log(`❌ [mobile-data-sync] Error fetching products:`, productsError);
    return createCorsResponse({ 
      success: false, 
      error: 'Error fetching products' 
    }, 500);
  }

  console.log(`✅ [mobile-data-sync] Found ${products?.length || 0} products`);

  return createCorsResponse({ 
    success: true, 
    products: products || []
  });
}
