
import { ProductCategory } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for product categories
 */
class ProductCategoryLocalService extends LocalStorageService<ProductCategory> {
  constructor() {
    super('product_categories');
  }
}

// Create a singleton instance
export const productCategoryLocalService = new ProductCategoryLocalService();
