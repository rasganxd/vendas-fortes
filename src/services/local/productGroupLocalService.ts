
import { ProductGroup } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for product groups
 */
class ProductGroupLocalService extends LocalStorageService<ProductGroup> {
  constructor() {
    super('product_groups');
  }
  
  // Get all product groups and handle parsing errors
  async getAll(): Promise<ProductGroup[]> {
    try {
      return await super.getAll();
    } catch (error) {
      console.error("Error getting all product groups from local storage:", error);
      return [];
    }
  }
  
  // Set all product groups with error handling
  async setAll(items: ProductGroup[]): Promise<void> {
    try {
      return await super.setAll(items);
    } catch (error) {
      console.error("Error setting all product groups in local storage:", error);
    }
  }
}

// Create a singleton instance
export const productGroupLocalService = new ProductGroupLocalService();
