import { supabase } from '@/integrations/supabase/client';
import { ProductBrand } from '@/types';

export const productBrandService = {
  async getAll(): Promise<ProductBrand[]> {
    try {
      console.log("Getting all product brands from Supabase...");
      const { data, error } = await supabase
        .from('product_brands')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error getting product brands:", error);
        return [];
      }
      
      const brands = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        notes: '', // Add default notes field
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) || [];
      
      console.log(`Retrieved ${brands.length} product brands from Supabase`);
      return brands;
    } catch (error) {
      console.error("Error getting all product brands:", error);
      return [];
    }
  },
  
  async getById(id: string): Promise<ProductBrand | null> {
    try {
      const { data, error } = await supabase
        .from('product_brands')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error getting product brand by ID:", error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        notes: '', // Add default notes field
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting product brand by ID:", error);
      return null;
    }
  },
  
  async getByName(name: string): Promise<ProductBrand | null> {
    try {
      const { data, error } = await supabase
        .from('product_brands')
        .select('*')
        .eq('name', name)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error getting product brand by name:", error);
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        notes: '', // Add default notes field
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting product brand by name:", error);
      return null;
    }
  },
  
  async add(brand: Omit<ProductBrand, 'id'>): Promise<string> {
    try {
      const brandData = {
        name: brand.name,
        description: brand.description
      };
      
      const { data, error } = await supabase
        .from('product_brands')
        .insert(brandData)
        .select('id')
        .single();
      
      if (error) {
        console.error("Error adding product brand:", error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error adding product brand:", error);
      throw error;
    }
  },
  
  async update(id: string, brand: Partial<ProductBrand>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (brand.name !== undefined) updateData.name = brand.name;
      if (brand.description !== undefined) updateData.description = brand.description;
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('product_brands')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error("Error updating product brand:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating product brand:", error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_brands')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting product brand:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error deleting product brand:", error);
      throw error;
    }
  }
};
