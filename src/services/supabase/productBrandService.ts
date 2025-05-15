
import { ProductBrand } from '@/types';

/**
 * Service for product brands
 * Using local storage
 */
class ProductBrandService {
  private storageKey = 'app_product_brands';

  async getAll(): Promise<ProductBrand[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Error getting product brands:", error);
      return [];
    }
  }

  async getById(id: string): Promise<ProductBrand | null> {
    try {
      const brands = await this.getAll();
      return brands.find(brand => brand.id === id) || null;
    } catch (error) {
      console.error("Error getting product brand by id:", error);
      return null;
    }
  }

  async add(brand: Omit<ProductBrand, 'id'>): Promise<string> {
    try {
      const brands = await this.getAll();
      const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newBrand = { ...brand, id };
      
      localStorage.setItem(this.storageKey, JSON.stringify([...brands, newBrand]));
      return id;
    } catch (error) {
      console.error("Error adding product brand:", error);
      throw error;
    }
  }

  async update(id: string, brand: Partial<ProductBrand>): Promise<void> {
    try {
      const brands = await this.getAll();
      const index = brands.findIndex(b => b.id === id);
      if (index === -1) throw new Error(`Brand with ID ${id} not found`);
      
      brands[index] = { ...brands[index], ...brand };
      localStorage.setItem(this.storageKey, JSON.stringify(brands));
    } catch (error) {
      console.error("Error updating product brand:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const brands = await this.getAll();
      const filtered = brands.filter(b => b.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting product brand:", error);
      throw error;
    }
  }
}

export const productBrandService = new ProductBrandService();
