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

  // Transform data from database format to TypeScript interface
  protected transformFromDB(dbRecord: any): T {
    if (!dbRecord) return dbRecord;
    
    const transformed = { ...dbRecord };
    
    // Convert timestamp fields to Date objects
    if (dbRecord.created_at) {
      transformed.createdAt = new Date(dbRecord.created_at);
      delete transformed.created_at;
    }
    
    if (dbRecord.updated_at) {
      transformed.updatedAt = new Date(dbRecord.updated_at);
      delete transformed.updated_at;
    }
    
    return transformed as T;
  }

  // Transform data from TypeScript interface to database format
  protected transformToDB(record: Partial<T>): any {
    if (!record) return record;
    
    const transformed = { ...record } as any;
    
    // Convert dates and handle optional fields safely
    if ('createdAt' in transformed && transformed.createdAt) {
      transformed.created_at = transformed.createdAt.toISOString();
      delete transformed.createdAt;
    }
    
    if ('updatedAt' in transformed && transformed.updatedAt) {
      transformed.updated_at = transformed.updatedAt.toISOString();
      delete transformed.updatedAt;
    }
    
    // Remove id for inserts
    delete transformed.id;
    
    return transformed;
  }
  
  async getAll(): Promise<T[]> {
    try {
      console.log(`Fetching all documents from ${this.tableName}`);
      const { data, error } = await supabase
        .from(this.tableName as any)
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error(`Error retrieving ${this.tableName}:`, error);
        return [];
      }
      
      return (data || []).map(item => this.transformFromDB(item));
    } catch (error) {
      console.error(`Error retrieving ${this.tableName}:`, error);
      return [];
    }
  }
  
  async getById(id: string): Promise<T | null> {
    try {
      console.log(`Fetching document with ID: ${id} from ${this.tableName}`);
      const { data, error } = await supabase
        .from(this.tableName as any)
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
      
      return this.transformFromDB(data);
    } catch (error) {
      console.error(`Error retrieving document ${id} from ${this.tableName}:`, error);
      return null;
    }
  }
  
  async add(entity: Omit<T, 'id'>): Promise<string> {
    try {
      console.log(`Adding document to ${this.tableName}`);
      
      const transformedData = this.transformToDB(entity as T);
      
      const dataWithTimestamps = {
        ...transformedData,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      const { data, error } = await supabase
        .from(this.tableName as any)
        .insert(dataWithTimestamps)
        .select('id')
        .single();
      
      if (error) {
        console.error(`Error adding document to ${this.tableName}:`, error);
        throw error;
      }
      
      console.log(`Added document to ${this.tableName} with ID:`, (data as any).id);
      return (data as any).id;
    } catch (error) {
      console.error(`Error adding document to ${this.tableName}:`, error);
      throw error;
    }
  }
  
  async update(id: string, entity: Partial<T>): Promise<void> {
    try {
      console.log(`Updating document ${id} in ${this.tableName}`);
      
      const transformedData = this.transformToDB(entity as T);
      
      const dataWithTimestamp = {
        ...transformedData,
        updated_at: new Date().toISOString()
      };
      
      const { error } = await supabase
        .from(this.tableName as any)
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
        .from(this.tableName as any)
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
