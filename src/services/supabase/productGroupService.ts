import { supabase } from '@/integrations/supabase/client';
import { ProductGroup } from '@/types';

export const productGroupService = {
  async getAll(): Promise<ProductGroup[]> {
    try {
      console.log("Getting all product groups from Supabase...");
      const { data, error } = await supabase
        .from('product_groups')
        .select('*')
        .order('name');
      
      if (error) {
        console.error("Error getting product groups:", error);
        return [];
      }
      
      const groups = data?.map(item => ({
        id: item.id,
        name: item.name,
        description: item.description || '',
        notes: '', // Add default notes field
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) || [];
      
      console.log(`Retrieved ${groups.length} product groups from Supabase`);
      return groups;
    } catch (error) {
      console.error("Error getting all product groups:", error);
      return [];
    }
  },
  
  async getById(id: string): Promise<ProductGroup | null> {
    try {
      const { data, error } = await supabase
        .from('product_groups')
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
        notes: '', // Add default notes field
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting product group by ID:", error);
      return null;
    }
  },
  
  async getByName(name: string): Promise<ProductGroup | null> {
    try {
      const { data, error } = await supabase
        .from('product_groups')
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
        notes: '', // Add default notes field
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting product group by name:", error);
      return null;
    }
  },
  
  
  async add(group: Omit<ProductGroup, 'id'>): Promise<string> {
    try {
      const groupData = {
        name: group.name,
        description: group.description
      };
      
      const { data, error } = await supabase
        .from('product_groups')
        .insert(groupData)
        .select('id')
        .single();
      
      if (error) {
        console.error("Error adding product group:", error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error adding product group:", error);
      throw error;
    }
  },
  
  async update(id: string, group: Partial<ProductGroup>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (group.name !== undefined) updateData.name = group.name;
      if (group.description !== undefined) updateData.description = group.description;
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('product_groups')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error("Error updating product group:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating product group:", error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('product_groups')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting product group:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error deleting product group:", error);
      throw error;
    }
  }
};
