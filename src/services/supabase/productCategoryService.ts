
import { ProductCategory } from '@/types';

/**
 * Service for product categories
 * Using local storage
 */
class ProductCategoryService {
  private storageKey = 'app_product_categories';

  async getAll(): Promise<ProductCategory[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Error getting product categories:", error);
      return [];
    }
  }

  async getById(id: string): Promise<ProductCategory | null> {
    try {
      const categories = await this.getAll();
      return categories.find(category => category.id === id) || null;
    } catch (error) {
      console.error("Error getting product category by id:", error);
      return null;
    }
  }

  async add(category: Omit<ProductCategory, 'id'>): Promise<string> {
    try {
      const categories = await this.getAll();
      const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newCategory = { ...category, id };
      
      localStorage.setItem(this.storageKey, JSON.stringify([...categories, newCategory]));
      return id;
    } catch (error) {
      console.error("Error adding product category:", error);
      throw error;
    }
  }

  async update(id: string, category: Partial<ProductCategory>): Promise<void> {
    try {
      const categories = await this.getAll();
      const index = categories.findIndex(c => c.id === id);
      if (index === -1) throw new Error(`Category with ID ${id} not found`);
      
      categories[index] = { ...categories[index], ...category };
      localStorage.setItem(this.storageKey, JSON.stringify(categories));
    } catch (error) {
      console.error("Error updating product category:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const categories = await this.getAll();
      const filtered = categories.filter(c => c.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting product category:", error);
      throw error;
    }
  }
}

export const productCategoryService = new ProductCategoryService();
