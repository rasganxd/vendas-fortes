
import { ProductBrand } from '@/types';

// Mock service para funcionar sem tabela no banco
export const productBrandService = {
  async getAll(): Promise<ProductBrand[]> {
    try {
      console.log("Getting all product brands (mock data)...");
      
      // Retorna dados mock já que a tabela product_brands não existe
      const brands: ProductBrand[] = [];
      
      console.log(`Retrieved ${brands.length} product brands (mock)`);
      return brands;
    } catch (error) {
      console.error("Error getting all product brands:", error);
      return [];
    }
  },
  
  async getById(id: string): Promise<ProductBrand | null> {
    console.log("Getting product brand by ID (mock):", id);
    return null;
  },
  
  async getByName(name: string): Promise<ProductBrand | null> {
    console.log("Getting product brand by name (mock):", name);
    return null;
  },
  
  async add(brand: Omit<ProductBrand, 'id'>): Promise<string> {
    console.log("Adding product brand (mock):", brand);
    return 'mock-id';
  },
  
  async update(id: string, brand: Partial<ProductBrand>): Promise<void> {
    console.log("Updating product brand (mock):", id, brand);
  },
  
  async delete(id: string): Promise<void> {
    console.log("Deleting product brand (mock):", id);
  }
};
