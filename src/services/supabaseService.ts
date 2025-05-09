
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

// Special case tables that don't have an id field
const tablesWithoutIdField = ['load_orders'];

// Generic service for CRUD operations on Supabase tables
export const createSupabaseService = (tableName: TableNames) => {
  return {
    // Get all records from a table
    getAll: async () => {
      const { data, error } = await supabase
        .from(tableName)
        .select('*');
        
      if (error) {
        console.error(`Error fetching ${tableName}:`, error);
        throw error;
      }
      
      return data || [];
    },
    
    // Get a single record by ID
    getById: async (id: string) => {
      // Skip ID lookup for tables without ID
      if (tablesWithoutIdField.includes(tableName)) {
        throw new Error(`Table ${tableName} does not have an id field`);
      }
      
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
      
      return data;
    },
    
    // Add a new record
    add: async (record: any) => {
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
      if (tablesWithoutIdField.includes(tableName)) {
        // For tables like load_orders, return some identifier
        return 'created';
      }
      
      return data[0].id;
    },
    
    // Update a record
    update: async (id: string, record: any) => {
      // Skip ID-based update for tables without ID
      if (tablesWithoutIdField.includes(tableName)) {
        throw new Error(`Table ${tableName} does not have an id field for updates`);
      }
      
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
    delete: async (id: string) => {
      // Skip ID-based delete for tables without ID
      if (tablesWithoutIdField.includes(tableName)) {
        throw new Error(`Table ${tableName} does not have an id field for deletion`);
      }
      
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
    query: async (filters: Record<string, any>) => {
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
      
      return data || [];
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
