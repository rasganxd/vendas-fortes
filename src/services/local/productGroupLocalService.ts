
import { ProductGroup } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for product groups
 */
class ProductGroupLocalService extends LocalStorageService<ProductGroup> {
  constructor() {
    super('product_groups');
  }
}

// Create a singleton instance
export const productGroupLocalService = new ProductGroupLocalService();
