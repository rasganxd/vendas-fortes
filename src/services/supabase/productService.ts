
import { createStandardService } from './core';

/**
 * Services for product-related operations
 */
export const productService = createStandardService('products');
export const productGroupService = createStandardService('product_groups');
export const productCategoryService = createStandardService('product_categories');
export const productBrandService = createStandardService('product_brands');
