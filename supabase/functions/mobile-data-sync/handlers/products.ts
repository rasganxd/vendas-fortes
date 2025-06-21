
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
    .eq('active', true);

  if (productsError) {
    console.log(`❌ [mobile-data-sync] Error fetching products:`, productsError);
    return createCorsResponse({ 
      success: false, 
      error: 'Error fetching products' 
    }, 500);
  }

  console.log(`✅ [mobile-data-sync] Found ${products?.length || 0} products`);

  // Sort products hierarchically: Group → Brand → Category → Name
  const sortedProducts = (products || []).sort((a, b) => {
    // First by group name (null groups go to end)
    const groupA = a.product_groups?.name || 'zzz';
    const groupB = b.product_groups?.name || 'zzz';
    if (groupA !== groupB) {
      return groupA.localeCompare(groupB, 'pt-BR', { numeric: true });
    }

    // Then by brand name (null brands go to end)
    const brandA = a.product_brands?.name || 'zzz';
    const brandB = b.product_brands?.name || 'zzz';
    if (brandA !== brandB) {
      return brandA.localeCompare(brandB, 'pt-BR', { numeric: true });
    }

    // Then by category name (null categories go to end)
    const categoryA = a.product_categories?.name || 'zzz';
    const categoryB = b.product_categories?.name || 'zzz';
    if (categoryA !== categoryB) {
      return categoryA.localeCompare(categoryB, 'pt-BR', { numeric: true });
    }

    // Finally by product name
    return a.name.localeCompare(b.name, 'pt-BR', { numeric: true });
  });

  // Organize products by categories and groups for better mobile navigation
  const organizedData = {
    products: sortedProducts,
    categories: [...new Set(sortedProducts.map(p => p.product_categories).filter(Boolean))] || [],
    groups: [...new Set(sortedProducts.map(p => p.product_groups).filter(Boolean))] || [],
    brands: [...new Set(sortedProducts.map(p => p.product_brands).filter(Boolean))] || []
  };

  return createCorsResponse({ 
    success: true, 
    ...organizedData
  });
}
