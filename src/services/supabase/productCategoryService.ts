
import { ProductCategory } from '@/types';

// Mock service para funcionar sem tabela no banco
export const productCategoryService = {
  async getAll(): Promise<ProductCategory[]> {
    try {
      console.log("Getting all product categories (mock data)...");
      
      // Retorna dados mock já que a tabela product_categories não existe
      const categories: ProductCategory[] = [];
      
      console.log(`Retrieved ${categories.length} product categories (mock)`);
      return categories;
    } catch (error) {
      console.error("Error getting all product categories:", error);
      return [];
    }
  },
  
  async getById(id: string): Promise<ProductCategory | null> {
    console.log("Getting product category by ID (mock):", id);
    return null;
  },
  
  async getByName(name: string): Promise<ProductCategory | null> {
    console.log("Getting product category by name (mock):", name);
    return null;
  },
  
  async add(category: Omit<ProductCategory, 'id'>): Promise<string> {
    console.log("Adding product category (mock):", category);
    return 'mock-id';
  },
  
  async update(id: string, category: Partial<ProductCategory>): Promise<void> {
    console.log("Updating product category (mock):", id, category);
  },
  
  async delete(id: string): Promise<void> {
    console.log("Deleting product category (mock):", id);
  }
};
