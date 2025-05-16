
import { Product } from '@/types';
import { where } from 'firebase/firestore';
import { FirestoreService } from './FirestoreService';

/**
 * Product-specific Firestore service implementation
 */
class ProductFirestoreServiceClass extends FirestoreService<Product> {
  constructor() {
    super('products');
  }

  /**
   * Get product by code
   * @param code Product code
   * @returns Product or null if not found
   */
  async getByCode(code: number): Promise<Product | null> {
    try {
      console.log(`ProductFirestoreService: Getting product by code ${code}`);
      const products = await this.query([where('code', '==', code)]);
      
      if (products.length > 0) {
        console.log(`ProductFirestoreService: Found product with code ${code}`);
        return products[0];
      } else {
        console.log(`ProductFirestoreService: No product found with code ${code}`);
        return null;
      }
    } catch (error) {
      console.error(`ProductFirestoreService: Error getting product by code ${code}:`, error);
      return null;
    }
  }

  /**
   * Get products by group ID
   * @param groupId Group ID
   * @returns Array of products
   */
  async getByGroupId(groupId: string): Promise<Product[]> {
    try {
      console.log(`ProductFirestoreService: Getting products by group ID ${groupId}`);
      const products = await this.query([where('groupId', '==', groupId)]);
      console.log(`ProductFirestoreService: Found ${products.length} products for group ${groupId}`);
      return products;
    } catch (error) {
      console.error(`ProductFirestoreService: Error getting products by group ID ${groupId}:`, error);
      return [];
    }
  }

  /**
   * Get products by category ID
   * @param categoryId Category ID
   * @returns Array of products
   */
  async getByCategoryId(categoryId: string): Promise<Product[]> {
    try {
      console.log(`ProductFirestoreService: Getting products by category ID ${categoryId}`);
      const products = await this.query([where('categoryId', '==', categoryId)]);
      console.log(`ProductFirestoreService: Found ${products.length} products for category ${categoryId}`);
      return products;
    } catch (error) {
      console.error(`ProductFirestoreService: Error getting products by category ID ${categoryId}:`, error);
      return [];
    }
  }

  /**
   * Get products by brand ID
   * @param brandId Brand ID
   * @returns Array of products
   */
  async getByBrandId(brandId: string): Promise<Product[]> {
    try {
      console.log(`ProductFirestoreService: Getting products by brand ID ${brandId}`);
      const products = await this.query([where('brandId', '==', brandId)]);
      console.log(`ProductFirestoreService: Found ${products.length} products for brand ${brandId}`);
      return products;
    } catch (error) {
      console.error(`ProductFirestoreService: Error getting products by brand ID ${brandId}:`, error);
      return [];
    }
  }

  /**
   * Generate next available product code
   * @returns Next available code
   */
  async generateNextProductCode(): Promise<number> {
    try {
      console.log("ProductFirestoreService: Generating next product code");
      const products = await this.getAll();
      
      if (products.length === 0) {
        console.log("ProductFirestoreService: No products found, returning code 1");
        return 1;
      }
      
      const highestCode = products.reduce(
        (max, product) => (product.code > max ? product.code : max),
        0
      );
      
      const nextCode = highestCode + 1;
      console.log(`ProductFirestoreService: Generated next product code: ${nextCode}`);
      return nextCode;
    } catch (error) {
      console.error("ProductFirestoreService: Error generating next product code:", error);
      return 1;
    }
  }
}

// Create a singleton instance
export const productFirestoreService = new ProductFirestoreServiceClass();
