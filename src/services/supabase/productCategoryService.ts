
import { supabase } from '@/integrations/supabase/client';
import { ProductCategory } from '@/types';

export const productCategoryService = {
  async getAll(): Promise<ProductCategory[]> {
    try {
      console.log("Getting all product categories from Supabase...");
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error getting product categories:", error);
        return [];
      }
      
      const categories = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        notes: item.notes || '',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) || [];
      
      console.log(`Retrieved ${categories.length} product categories from Supabase`);
      return categories;
    } catch (error) {
      console.error("Error getting all product categories:", error);
      return [];
    }
  },
  
  async getById(id: string): Promise<ProductCategory | null> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting product category by ID:", error);
      return null;
    }
  },
  
  async getByName(name: string): Promise<ProductCategory | null> {
    try {
      const { data, error } = await supabase
        .from('product_categories')
        .select('*')
        .eq('name', name)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        return null;
      }
      
      return {
        id: data.id,
        name: data.name,
        description: data.description || '',
        notes: data.notes || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting product category by name:", error);
      return null;
    }
  },
  
  async add(category: Omit<ProductCategory, 'id'>): Promise<string> {
    try {
      const categoryData = {
        name: category.name,
        description: category.description,
        notes: category.notes
      };
      
      const { data, error } = await supabase
        .from('product_categories')
        .insert(categoryData)
        .select('id')
        .single();
      
      if (error) {
        console.error("Error adding product category:", error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error adding product category:", error);
      throw error;
    }
  },
  
  async update(id: string, category: Partial<ProductCategory>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (category.name !== undefined) updateData.name = category.name;
      if (category.description !== undefined) updateData.description = category.description;
      if (category.notes !== undefined) updateData.notes = category.notes;
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('product_categories')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error("Error updating product category:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating product category:", error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting product category:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error deleting product category:", error);
      throw error;
    }
  }
};
