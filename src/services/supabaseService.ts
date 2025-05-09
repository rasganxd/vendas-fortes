
import { supabase } from '@/integrations/supabase/client';

// Define allowed table names to avoid type errors
type TableNames = 
  | 'sales_reps'
  | 'orders'
  | 'customers'
  | 'products'
  | 'loads'
  | 'payments'
  | 'payment_methods'
  | 'payment_tables'
  | 'product_groups'
  | 'product_categories'
  | 'product_brands'
  | 'app_settings'
  | 'payment_table_terms'
  | 'payment_installments'
  | 'payment_table_installments'
  | 'order_items'
  | 'load_items'
  | 'load_orders'
  | 'route_stops'
  | 'vehicles'
  | 'delivery_routes';

// Generic service for CRUD operations on Supabase tables
export const createSupabaseService = <T extends Record<string, any>>(tableName: TableNames) => {
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
      
      return (data || []) as unknown as T[];
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
      
      return data as unknown as T;
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
      
      if (!data || data.length === 0) {
        throw new Error(`Failed to get ID from newly created ${tableName}`);
      }
      
      // Handle the special case for tables without an id field
      if (tableName === 'load_orders') {
        // For load_orders, return some identifier (even if not an ID)
        return 'created';
      }
      
      return (data[0] as any).id;
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
      
      return (data || []) as unknown as T[];
    }
  };
};

// Create services for each entity with explicit unknown type cast to fix deep recursion
export const salesRepService = createSupabaseService<Record<string, any>>('sales_reps');
export const orderService = createSupabaseService<Record<string, any>>('orders');
export const customerService = createSupabaseService<Record<string, any>>('customers');
export const productService = createSupabaseService<Record<string, any>>('products');
export const loadService = createSupabaseService<Record<string, any>>('loads');
export const paymentService = createSupabaseService<Record<string, any>>('payments');
export const paymentMethodService = createSupabaseService<Record<string, any>>('payment_methods');
export const paymentTableService = createSupabaseService<Record<string, any>>('payment_tables');
export const productGroupService = createSupabaseService<Record<string, any>>('product_groups');
export const productCategoryService = createSupabaseService<Record<string, any>>('product_categories');
export const productBrandService = createSupabaseService<Record<string, any>>('product_brands');
