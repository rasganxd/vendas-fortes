
import { ProductCategory } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * ProductCategory-specific Firestore service implementation
 */
class ProductCategoryFirestoreServiceClass extends FirestoreService<ProductCategory> {
  constructor() {
    super('product_categories');
  }

  /**
   * Get product category by name
   * @param name Category name
   * @returns ProductCategory or null if not found
   */
  async getByName(name: string): Promise<ProductCategory | null> {
    try {
      console.log(`ProductCategoryFirestoreService: Getting product category by name ${name}`);
      const categories = await this.query([where('name', '==', name)]);
      
      if (categories.length > 0) {
        console.log(`ProductCategoryFirestoreService: Found category with name ${name}`);
        return categories[0];
      } else {
        console.log(`ProductCategoryFirestoreService: No category found with name ${name}`);
        return null;
      }
    } catch (error) {
      console.error(`ProductCategoryFirestoreService: Error getting category by name ${name}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const productCategoryFirestoreService = new ProductCategoryFirestoreServiceClass();
