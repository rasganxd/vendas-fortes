
import { supabase } from '@/integrations/supabase/client';

// Define types for commonly used data structures
type SupabaseRecord = Record<string, any>;

// Special case tables that don't have an id field
const tablesWithoutIdField = ['load_orders'];

// Generic service for CRUD operations on Supabase tables
export const createSupabaseService = (tableName: string) => {
  const isTableWithoutId = tablesWithoutIdField.includes(tableName);
  
  return {
    // Get all records from a table
    getAll: async () => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*');
          
        if (error) {
          console.error(`Error fetching ${tableName}:`, error);
          throw error;
        }
        
        return data || [];
      } catch (error) {
        console.error(`Error in getAll for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Get a single record by ID (only for tables with ID)
    getById: async (id: string) => {
      // Skip ID lookup for tables without ID
      if (isTableWithoutId) {
        throw new Error(`Table ${tableName} does not have an id field`);
      }
      
      try {
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
      } catch (error) {
        console.error(`Error in getById for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Add a new record
    add: async (record: SupabaseRecord) => {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .insert(record)
          .select();
          
        if (error) {
          console.error(`Error adding record to ${tableName}:`, error);
          throw error;
        }
        
        if (!data || data.length === 0) {
          throw new Error(`Failed to get data from newly created ${tableName}`);
        }
        
        // Handle the special case for tables without an id field
        if (isTableWithoutId) {
          // For tables like load_orders, return some identifier
          return 'created';
        }
        
        return data[0].id;
      } catch (error) {
        console.error(`Error in add for ${tableName}:`, error);
        throw error;
      }
    },
    
    // Update a record (only for tables with ID)
    update: async (id: string, record: SupabaseRecord) => {
      // Skip ID-based update for tables without ID
      if (isTableWithoutId) {
        throw new Error(`Table ${tableName} does not have an id field for updates`);
      }
      
      try {
        const { error } = await supabase
          .from(tableName)
          .update(record)
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
    
    // Delete a record (only for tables with ID)
    delete: async (id: string) => {
      // Skip ID-based delete for tables without ID
      if (isTableWithoutId) {
        throw new Error(`Table ${tableName} does not have an id field for deletion`);
      }
      
      try {
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
    query: async (filters: Record<string, any>) => {
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
        
        return data || [];
      } catch (error) {
        console.error(`Error in query for ${tableName}:`, error);
        throw error;
      }
    }
  };
};

// Special service for load_orders which doesn't have an ID field
export const createLoadOrdersService = () => {
  return {
    // Get all load orders
    getAll: async () => {
      const { data, error } = await supabase
        .from('load_orders')
        .select('*');
        
      if (error) {
        console.error('Error fetching load_orders:', error);
        throw error;
      }
      
      return data || [];
    },
    
    // Add a new load order relationship
    add: async (loadId: string, orderId: string) => {
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
    },
    
    // Delete a load order relationship
    delete: async (loadId: string, orderId: string) => {
      const { error } = await supabase
        .from('load_orders')
        .delete()
        .eq('load_id', loadId)
        .eq('order_id', orderId);
        
      if (error) {
        console.error('Error deleting load_order:', error);
        throw error;
      }
    },
    
    // Get all orders for a load
    getOrdersForLoad: async (loadId: string) => {
      const { data, error } = await supabase
        .from('load_orders')
        .select('order_id')
        .eq('load_id', loadId);
        
      if (error) {
        console.error('Error fetching orders for load:', error);
        throw error;
      }
      
      return (data || []).map(item => item.order_id);
    },
    
    // Get all loads for an order
    getLoadsForOrder: async (orderId: string) => {
      const { data, error } = await supabase
        .from('load_orders')
        .select('load_id')
        .eq('order_id', orderId);
        
      if (error) {
        console.error('Error fetching loads for order:', error);
        throw error;
      }
      
      return (data || []).map(item => item.load_id);
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
export const loadOrderService = createLoadOrdersService();
