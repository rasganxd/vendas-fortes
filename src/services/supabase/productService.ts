
import { createStandardService } from './core';
import { supabase } from '@/integrations/supabase/client';
import { prepareForSupabase } from '@/utils/dataTransformers';
import { Tables } from '@/integrations/supabase/types';

/**
 * Services for product-related operations
 */
export const productService = createStandardService('products');
export const productGroupService = createStandardService('product_groups');
export const productCategoryService = createStandardService('product_categories');
export const productBrandService = createStandardService('product_brands');

// Define the proper type for products from Supabase
type ProductInsert = Tables<'products'>;

/**
 * Create multiple products at once
 * @param products - Array of products to create
 * @returns Array of created product IDs
 */
export const createBulkProducts = async (products: any[]): Promise<string[]> => {
  // Ensure all products have required fields before inserting
  const validProducts = products.filter(product => {
    if (!product.name || product.name.trim() === '') {
      console.error("Product missing required name field:", product);
      return false;
    }
    if (product.code === undefined || product.code === null) {
      console.error("Product missing required code field:", product);
      return false;
    }
    if (product.price === undefined || product.price === null) {
      // Ensure price is set to at least 0
      product.price = 0;
    }
    return true;
  }).map(product => prepareForSupabase(product) as ProductInsert);

  if (validProducts.length === 0) {
    throw new Error("No valid products to insert");
  }

  // Use upsert with onConflict for bulk insertion
  const { data, error } = await supabase
    .from('products')
    .upsert(validProducts)
    .select('id');
    
  if (error) {
    console.error("Error creating bulk products:", error);
    throw error;
  }
  
  return data?.map(item => item.id) || [];
};
