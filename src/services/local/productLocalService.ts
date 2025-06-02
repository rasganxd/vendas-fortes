
import { Product } from '@/types';
import { LocalStorageService } from './localStorageService';

/**
 * LocalStorage service for products
 */
class ProductLocalService extends LocalStorageService<Product> {
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
      const newIds: string[] = [];
      
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

  /**
   * Force save a product even if it already exists
   * @param product Full product with ID
   * @returns The product ID
   */
  async forceSave(product: Product): Promise<string> {
    try {
      const products = await this.getAll();
      const index = products.findIndex(p => p.id === product.id);
      
      if (index >= 0) {
        products[index] = product;
      } else {
        products.push(product);
      }
      
      await this.setAll(products);
      return product.id;
    } catch (error) {
      console.error(`Error force saving product:`, error);
      throw error;
    }
  }
  
  /**
   * Save products that are pending synchronization
   * @param products Array of products with pending sync
   */
  async savePendingProducts(products: Product[]): Promise<void> {
    try {
      const allProducts = await this.getAll();
      const updatedProducts = [...allProducts];
      
      for (const product of products) {
        const index = updatedProducts.findIndex(p => p.id === product.id);
        if (index >= 0) {
          updatedProducts[index] = product;
        } else {
          updatedProducts.push(product);
        }
      }
      
      await this.setAll(updatedProducts);
    } catch (error) {
      console.error(`Error saving pending products:`, error);
      throw error;
    }
  }
}

// Create a singleton instance
export const productLocalService = new ProductLocalService();
