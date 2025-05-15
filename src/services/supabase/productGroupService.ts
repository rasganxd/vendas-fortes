
import { ProductGroup } from '@/types';

/**
 * Service for product groups
 * Using local storage
 */
class ProductGroupService {
  private storageKey = 'app_product_groups';

  async getAll(): Promise<ProductGroup[]> {
    try {
      const data = localStorage.getItem(this.storageKey);
      if (!data) return [];
      return JSON.parse(data);
    } catch (error) {
      console.error("Error getting product groups:", error);
      return [];
    }
  }

  async getById(id: string): Promise<ProductGroup | null> {
    try {
      const groups = await this.getAll();
      return groups.find(group => group.id === id) || null;
    } catch (error) {
      console.error("Error getting product group by id:", error);
      return null;
    }
  }

  async add(group: Omit<ProductGroup, 'id'>): Promise<string> {
    try {
      const groups = await this.getAll();
      const id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
      const newGroup = { ...group, id };
      
      localStorage.setItem(this.storageKey, JSON.stringify([...groups, newGroup]));
      return id;
    } catch (error) {
      console.error("Error adding product group:", error);
      throw error;
    }
  }

  async update(id: string, group: Partial<ProductGroup>): Promise<void> {
    try {
      const groups = await this.getAll();
      const index = groups.findIndex(g => g.id === id);
      if (index === -1) throw new Error(`Group with ID ${id} not found`);
      
      groups[index] = { ...groups[index], ...group };
      localStorage.setItem(this.storageKey, JSON.stringify(groups));
    } catch (error) {
      console.error("Error updating product group:", error);
      throw error;
    }
  }

  async delete(id: string): Promise<void> {
    try {
      const groups = await this.getAll();
      const filtered = groups.filter(g => g.id !== id);
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
    } catch (error) {
      console.error("Error deleting product group:", error);
      throw error;
    }
  }
}

export const productGroupService = new ProductGroupService();
