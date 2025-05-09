
import { supabase } from '@/integrations/supabase/client';
import { Database } from '@/integrations/supabase/types';

// Define types for tables in our database
export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// List of available tables to check against
const validTables: TableName[] = [
  'app_settings',
  'customers',
  'delivery_routes',
  'load_items',
  'load_orders',
  'loads',
  'order_items',
  'orders',
  'payment_installments',
  'payment_methods',
  'payment_table_installments',
  'payment_table_terms',
  'payment_tables',
  'payments',
  'product_brands',
  'product_categories',
  'product_groups',
  'products',
  'route_stops',
  'sales_reps',
  'vehicles'
];

// Special case tables that don't have an id field
const tablesWithoutIdField = new Set<TableName>(['load_orders']);

/**
 * Creates a service for standard tables with an ID field
 * @param tableName The table name
 * @returns CRUD operations for the table
 */
export function createStandardService<T extends TableName>(tableName: T) {
  // Type guard to validate table name
  if (!validTables.includes(tableName)) {
    throw new Error(`Invalid table name: ${tableName}`);
  }
  
  return {
    // Get all records from a table
    getAll: async (): Promise<TableRow<T>[]> => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          throw error;
        }
        
        return data as TableRow<T>[];
      } catch (error) {
        console.error(`Error in getAll for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Get a single record by ID
    getById: async (id: string): Promise<TableRow<T> | null> => {
      try {
        // Skip ID lookup for tables without ID
        if (tablesWithoutIdField.has(tableName)) {
          throw new Error(`Table ${tableName} does not have an id field`);
        }
        
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .eq('id', id)
          .maybeSingle();
          
        if (error) {
          console.error(`Error fetching ${tableName} with id ${id}:`, error);
          throw error;
        }
        
        return data as TableRow<T> | null;
      } catch (error) {
        console.error(`Error in getById for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Add a new record
    add: async (record: Partial<TableInsert<T>>): Promise<string> => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert(record as any)
          .select();
          
        if (error) {
          console.error(`Error adding record to ${tableName}:`, error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error(`Failed to get data from newly created ${tableName}`);
        }
        
        // Handle tables without ID field - this should not happen with standard tables
        if (tablesWithoutIdField.has(tableName)) {
          // For tables like load_orders, return some identifier
          return 'created';
        }
        
        // Safe to access data[0].id since we've verified this is a standard table
        const row = data[0] as any;
        return row.id || 'unknown';
      } catch (error) {
        console.error(`Error in add for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Update a record
    update: async (id: string, record: Partial<TableUpdate<T>>): Promise<void> => {
      try {
        // Skip ID-based update for tables without ID
        if (tablesWithoutIdField.has(tableName)) {
          throw new Error(`Table ${tableName} does not have an id field for updates`);
        }
        
        const { error } = await supabase
          .from(tableName)
          .update(record as any)
          .eq('id', id);
          
        if (error) {
          console.error(`Error updating record in ${tableName}:`, error);
          throw error;
        }
      } catch (error) {
        console.error(`Error in update for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Delete a record
    delete: async (id: string): Promise<void> => {
      try {
        // Skip ID-based delete for tables without ID
        if (tablesWithoutIdField.has(tableName)) {
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
      } catch (error) {
        console.error(`Error in delete for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Query records with filters
    query: async (filters: Record<string, any>): Promise<TableRow<T>[]> => {
      try {
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
        
        return data as TableRow<T>[];
      } catch (error) {
        console.error(`Error in query for ${tableName}:`, error);
        throw error;
      }
    }
  };
}

/**
 * Create service specifically for load_orders which doesn't have an ID field
 */
export const createLoadOrdersService = () => {
  return {
    // Get all load orders
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('*');
          
        if (error) {
          console.error('Error fetching load_orders:', error);
          throw error;
        }
        
        return (data || []) as Database['public']['Tables']['load_orders']['Row'][];
      } catch (error) {
        console.error("Error in getAll for load_orders:", error);
        throw error;
      }
    },
    
    // Add a new load order relationship
    add: async (loadId: string, orderId: string) => {
      try {
        const record = {
          load_id: loadId,
          order_id: orderId
        };
        
        const { error } = await supabase
          .from('load_orders')
          .insert(record);
          
        if (error) {
          console.error('Error adding load_order:', error);
          throw error;
        }
        
        return 'created';
      } catch (error) {
        console.error("Error in add for load_orders:", error);
        throw error;
      }
    },
    
    // Delete a load order relationship
    delete: async (loadId: string, orderId: string) => {
      try {
        const { error } = await supabase
          .from('load_orders')
          .delete()
          .eq('load_id', loadId)
          .eq('order_id', orderId);
          
        if (error) {
          console.error('Error deleting load_order:', error);
          throw error;
        }
      } catch (error) {
        console.error("Error in delete for load_orders:", error);
        throw error;
      }
    },
    
    // Get all orders for a load
    getOrdersForLoad: async (loadId: string) => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('order_id')
          .eq('load_id', loadId);
          
        if (error) {
          console.error('Error fetching orders for load:', error);
          throw error;
        }
        
        return (data || []).map(item => item.order_id);
      } catch (error) {
        console.error("Error in getOrdersForLoad:", error);
        throw error;
      }
    },
    
    // Get all loads for an order
    getLoadsForOrder: async (orderId: string) => {
      try {
        const { data, error } = await supabase
          .from('load_orders')
          .select('load_id')
          .eq('order_id', orderId);
          
        if (error) {
          console.error('Error fetching loads for order:', error);
          throw error;
        }
        
        return (data || []).map(item => item.load_id);
      } catch (error) {
        console.error("Error in getLoadsForOrder:", error);
        throw error;
      }
    }
  };
};

// Create services for each entity using the appropriate service factory
export const salesRepService = createStandardService('sales_reps');
export const orderService = createStandardService('orders');
export const customerService = createStandardService('customers');
export const productService = createStandardService('products');
export const loadService = createStandardService('loads');
export const paymentService = createStandardService('payments');
export const paymentMethodService = createStandardService('payment_methods');
export const paymentTableService = createStandardService('payment_tables');
export const productGroupService = createStandardService('product_groups');
export const productCategoryService = createStandardService('product_categories');
export const productBrandService = createStandardService('product_brands');
export const loadOrderService = createLoadOrdersService();
