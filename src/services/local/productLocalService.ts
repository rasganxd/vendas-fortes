
import { Product } from '@/types';
import { LocalStorageService } from './localStorageService';
import { mockProducts } from '@/data/mock/products';

/**
 * LocalStorage service for products
 */
class ProductLocalService extends LocalStorageService<Product> {
  constructor() {
    super('products');
    this.initializeWithMockData();
  }
  
  /**
   * Initialize with mock data if empty
   */
  async initializeWithMockData(): Promise<void> {
    const data = await this.getAll();
    
    if (data.length === 0) {
      console.log("Initializing products local storage with mock data");
      await this.initializeWithDefault(mockProducts);
    }
  }
  
  /**
   * Get product by code
   * @param code Product code
   * @returns Product or null if not found
   */
  async getByCode(code: number): Promise<Product | null> {
    try {
      const products = await this.getAll();
      return products.find(product => product.code === code) || null;
    } catch (error) {
      console.error(`Error retrieving product by code ${code}:`, error);
      return null;
    }
  }
  
  /**
   * Get highest code currently used
   * @returns Highest code number
   */
  async getHighestCode(): Promise<number> {
    const products = await this.getAll();
    
    if (products.length === 0) return 0;
    
    return products.reduce(
      (max, product) => (product.code > max ? product.code : max), 
      0
    );
  }
  
  /**
   * Create multiple products at once
   * @param products Array of products to create
   * @returns Array of generated IDs
   */
  async createBulk(products: Omit<Product, 'id'>[]): Promise<string[]> {
    try {
      const allProducts = await this.getAll();
      const newIds: string[] = [];
      const newProducts: Product[] = [];
      
      for (const product of products) {
        const id = await this.add(product);
        newIds.push(id);
      }
      
      return newIds;
    } catch (error) {
      console.error(`Error creating bulk products:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
export const productLocalService = new ProductLocalService();
