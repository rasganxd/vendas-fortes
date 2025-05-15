
import { ProductBrand } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for product brands
 */
class ProductBrandLocalService extends LocalStorageService<ProductBrand> {
  constructor() {
    super('product_brands');
  }
}

// Create a singleton instance
export const productBrandLocalService = new ProductBrandLocalService();
