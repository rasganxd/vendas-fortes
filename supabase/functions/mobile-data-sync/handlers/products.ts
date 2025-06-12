
import { createCorsResponse } from '../utils/cors.ts';

export async function handleGetProducts(supabase: any) {
  // Products are global, not filtered by sales rep
  const { data: products, error: productsError } = await supabase
    .from('products')
    .select(`
      *,
      product_groups!products_group_id_fkey(id, name, description),
      product_categories!products_category_id_fkey(id, name, description),
      product_brands!products_brand_id_fkey(id, name, description),
      main_unit:units!products_main_unit_id_fkey(code, description, package_quantity),
      sub_unit:units!products_sub_unit_id_fkey(code, description, package_quantity)
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

  // Organize products by categories and groups for better mobile navigation
  const organizedData = {
    products: products || [],
    categories: [...new Set(products?.map(p => p.product_categories).filter(Boolean))] || [],
    groups: [...new Set(products?.map(p => p.product_groups).filter(Boolean))] || [],
    brands: [...new Set(products?.map(p => p.product_brands).filter(Boolean))] || []
  };

  return createCorsResponse({ 
    success: true, 
    ...organizedData
  });
}
