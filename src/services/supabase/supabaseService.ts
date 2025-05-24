
import { supabase } from '@/integrations/supabase/client';

export interface SupabaseEntity {
  id: string;
  created_at?: Date;
  updated_at?: Date;
}

export class SupabaseService<T extends SupabaseEntity> {
  protected tableName: string;
  protected supabase = supabase;
  
  constructor(tableName: string) {
    this.tableName = tableName;
  }
  
  async getAll(): Promise<T[]> {
    try {
      console.log(`Fetching all documents from ${this.tableName}`);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error retrieving ${this.tableName}:`, error);
        return [];
      }
      
      return data || [];
    } catch (error) {
      console.error(`Error retrieving ${this.tableName}:`, error);
      return [];
    }
  }
  
  async getById(id: string): Promise<T | null> {
    try {
      console.log(`Fetching document with ID: ${id} from ${this.tableName}`);
      const { data, error } = await supabase
        .from(this.tableName)
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') {
          console.warn(`Document with ID ${id} not found in ${this.tableName}`);
          return null;
        }
        console.error(`Error retrieving document ${id} from ${this.tableName}:`, error);
        return null;
      }
      
      return data;
    } catch (error) {
      console.error(`Error retrieving document ${id} from ${this.tableName}:`, error);
      return null;
    }
  }
  
  async add(entity: Omit<T, 'id'>): Promise<string> {
    try {
      console.log(`Adding document to ${this.tableName}`);
      
      const dataWithTimestamps = {
        ...entity,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.tableName)
        .insert(dataWithTimestamps)
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error adding document to ${this.tableName}:`, error);
        throw error;
      }
      
      console.log(`Added document to ${this.tableName} with ID:`, data.id);
      return data.id;
    } catch (error) {
      console.error(`Error adding document to ${this.tableName}:`, error);
      throw error;
    }
  }
  
  async update(id: string, entity: Partial<T>): Promise<void> {
    try {
      console.log(`Updating document ${id} in ${this.tableName}`);
      
      const dataWithTimestamp = {
        ...entity,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from(this.tableName)
        .update(dataWithTimestamp)
        .eq('id', id);
      
      if (error) {
        console.error(`Error updating document ${id} in ${this.tableName}:`, error);
        throw error;
      }
      
      console.log(`Updated document ${id} in ${this.tableName}`);
    } catch (error) {
      console.error(`Error updating document ${id} in ${this.tableName}:`, error);
      throw error;
    }
  }
  
  async delete(id: string): Promise<void> {
    try {
      console.log(`Deleting document ${id} from ${this.tableName}`);
      
      const { error } = await supabase
        .from(this.tableName)
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error(`Error deleting document ${id} from ${this.tableName}:`, error);
        throw error;
      }
      
      console.log(`Deleted document ${id} from ${this.tableName}`);
    } catch (error) {
      console.error(`Error deleting document ${id} from ${this.tableName}:`, error);
      throw error;
    }
  }
}
