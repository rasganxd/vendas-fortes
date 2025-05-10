
import { createStandardService } from './core';

/**
 * Services for product-related operations
 */
export const productService = createStandardService('products');
export const productGroupService = createStandardService('product_groups');
export const productCategoryService = createStandardService('product_categories');
export const productBrandService = createStandardService('product_brands');

/**
 * Create multiple products at once
 * @param products - Array of products to create
 * @returns Array of created product IDs
 */
export const createBulkProducts = async (products: any[]): Promise<string[]> => {
  const { data, error } = await productService.client
    .from('products')
    .insert(products)
    .select('id');
    
  if (error) {
    console.error("Error creating bulk products:", error);
    throw error;
  }
  
  return data?.map(item => item.id) || [];
};
