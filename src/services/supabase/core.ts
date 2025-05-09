
import { supabase } from '@/integrations/supabase/client';
import { TableName, TableRow, TableInsert, TableUpdate, validTables, tablesWithoutIdField } from './types';

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
          .eq('id', id as any)
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
          .eq('id', id as any);
          
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
          .eq('id', id as any);
          
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
