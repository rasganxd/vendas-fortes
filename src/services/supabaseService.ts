
import { supabase } from '@/integrations/supabase/client';

// Generic service for CRUD operations on Supabase tables
export const createSupabaseService = <T extends Record<string, any>>(tableName: string) => {
  return {
    // Get all records from a table
    getAll: async (): Promise<T[]> => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
        
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }
      
      return data as T[];
    },
    
    // Get a single record by ID
    getById: async (id: string): Promise<T | null> => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*')
        .eq('id', id)
        .single();
        
      if (error) {
        if (error.code === 'PGRST116') { // Record not found
          return null;
        }
        console.error(`Error fetching ${tableName} with id ${id}:`, error);
        throw error;
      }
      
      return data as T;
    },
    
    // Add a new record
    add: async (record: Omit<T, 'id'>): Promise<string> => {
      const { data, error } = await supabase
        .from(tableName)
        .insert(record)
        .select();
        
      if (error) {
        console.error(`Error adding record to ${tableName}:`, error);
        throw error;
      }
      
      return data[0].id;
    },
    
    // Update a record
    update: async (id: string, record: Partial<T>): Promise<void> => {
      const { error } = await supabase
        .from(tableName)
        .update(record)
        .eq('id', id);
        
      if (error) {
        console.error(`Error updating record in ${tableName}:`, error);
        throw error;
      }
    },
    
    // Delete a record
    delete: async (id: string): Promise<void> => {
      const { error } = await supabase
        .from(tableName)
        .delete()
        .eq('id', id);
        
      if (error) {
        console.error(`Error deleting record from ${tableName}:`, error);
        throw error;
      }
    },
    
    // Query records with filters
    query: async (filters: Partial<T>): Promise<T[]> => {
      let query = supabase
        .from(tableName)
        .select('*');
        
      // Apply each filter
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          query = query.eq(key, value);
        }
      });
      
      const { data, error } = await query;
      
      if (error) {
        console.error(`Error querying ${tableName}:`, error);
        throw error;
      }
      
      return data as T[];
    }
  };
};

// Create services for each entity
export const salesRepService = createSupabaseService('sales_reps');
export const orderService = createSupabaseService('orders');
export const customerService = createSupabaseService('customers');
export const productService = createSupabaseService('products');
export const loadService = createSupabaseService('loads');
export const paymentService = createSupabaseService('payments');
export const paymentMethodService = createSupabaseService('payment_methods');
export const paymentTableService = createSupabaseService('payment_tables');
export const productGroupService = createSupabaseService('product_groups');
export const productCategoryService = createSupabaseService('product_categories');
export const productBrandService = createSupabaseService('product_brands');
