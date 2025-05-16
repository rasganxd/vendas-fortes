
import { Product } from '@/types';
import { productService as firebaseProductService, createBulkProducts as firebaseCreateBulkProducts } from '../firebase/productService';

/**
 * Service for product operations
 * Now using Firebase instead of local storage
 */
export const productService = {
  // Get all products
  getAll: async (): Promise<Product[]> => {
    return firebaseProductService.getAll();
  },

  // Get product by ID
  getById: async (id: string): Promise<Product | null> => {
    return firebaseProductService.getById(id);
  },

  // Add product
  add: async (product: Omit<Product, 'id'>): Promise<string> => {
    return firebaseProductService.add(product);
  },

  // Update product
  update: async (id: string, product: Partial<Product>): Promise<void> => {
    return firebaseProductService.update(id, product);
  },

  // Delete product
  delete: async (id: string): Promise<void> => {
    return firebaseProductService.delete(id);
  },

  // Get product by code
  getByCode: async (code: number): Promise<Product | null> => {
    return firebaseProductService.getByCode(code);
  }
};

/**
 * Create multiple products at once
 * @param products Array of products to create
 * @returns Array of generated IDs
 */
export const createBulkProducts = async (products: Omit<Product, 'id'>[]): Promise<string[]> => {
  return firebaseCreateBulkProducts(products);
};
