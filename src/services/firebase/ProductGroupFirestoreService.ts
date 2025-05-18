
import { ProductGroup } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * ProductGroup-specific Firestore service implementation
 */
class ProductGroupFirestoreServiceClass extends FirestoreService<ProductGroup> {
  constructor() {
    super('product_groups');
  }

  /**
   * Get product group by name
   * @param name Group name
   * @returns ProductGroup or null if not found
   */
  async getByName(name: string): Promise<ProductGroup | null> {
    try {
      console.log(`ProductGroupFirestoreService: Getting product group by name ${name}`);
      const groups = await this.query([where('name', '==', name)]);
      
      if (groups.length > 0) {
        console.log(`ProductGroupFirestoreService: Found group with name ${name}`);
        return groups[0];
      } else {
        console.log(`ProductGroupFirestoreService: No group found with name ${name}`);
        return null;
      }
    } catch (error) {
      console.error(`ProductGroupFirestoreService: Error getting group by name ${name}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const productGroupFirestoreService = new ProductGroupFirestoreServiceClass();
