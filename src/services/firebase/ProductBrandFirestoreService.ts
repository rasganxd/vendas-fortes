
import { ProductBrand } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * ProductBrand-specific Firestore service implementation
 */
class ProductBrandFirestoreServiceClass extends FirestoreService<ProductBrand> {
  constructor() {
    super('product_brands');
  }

  /**
   * Get product brand by name
   * @param name Brand name
   * @returns ProductBrand or null if not found
   */
  async getByName(name: string): Promise<ProductBrand | null> {
    try {
      console.log(`ProductBrandFirestoreService: Getting product brand by name ${name}`);
      const brands = await this.query([where('name', '==', name)]);
      
      if (brands.length > 0) {
        console.log(`ProductBrandFirestoreService: Found brand with name ${name}`);
        return brands[0];
      } else {
        console.log(`ProductBrandFirestoreService: No brand found with name ${name}`);
        return null;
      }
    } catch (error) {
      console.error(`ProductBrandFirestoreService: Error getting brand by name ${name}:`, error);
      return null;
    }
  }
}

// Create a singleton instance
export const productBrandFirestoreService = new ProductBrandFirestoreServiceClass();
