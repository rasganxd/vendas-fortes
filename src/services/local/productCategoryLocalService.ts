
import { ProductCategory } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for product categories
 * Uses the centralized notification system via its parent methods
 */
class ProductCategoryLocalService extends LocalStorageService<ProductCategory> {
  constructor() {
    super('product_categories');
  }
  
  // No additional methods needed here - base class handles CRUD operations
}

// Create a singleton instance
export const productCategoryLocalService = new ProductCategoryLocalService();
