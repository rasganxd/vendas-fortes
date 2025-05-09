
import { Database } from '@/integrations/supabase/types';

// Define types for tables in our database
export type TableName = keyof Database['public']['Tables'];
export type TableRow<T extends TableName> = Database['public']['Tables'][T]['Row'];
export type TableInsert<T extends TableName> = Database['public']['Tables'][T]['Insert'];
export type TableUpdate<T extends TableName> = Database['public']['Tables'][T]['Update'];

// List of available tables to check against
export const validTables: TableName[] = [
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
export const tablesWithoutIdField = new Set<TableName>(['load_orders']);
