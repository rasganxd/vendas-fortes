import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// External Supabase project
const EXTERNAL_SUPABASE_URL = "https://fvqdehrbgcafyyqmilox.supabase.co";
const EXTERNAL_SUPABASE_ANON_KEY = Deno.env.get('EXTERNAL_SUPABASE_ANON_KEY') || '';

// Cloud Supabase project (this project)
const CLOUD_SUPABASE_URL = Deno.env.get('SUPABASE_URL') || '';
const CLOUD_SUPABASE_SERVICE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') || '';

// Column mappings for tables with different schemas
const columnMappings: Record<string, Record<string, string>> = {
  system_backups: {
    backup_type: 'type'
  }
};

// Columns to exclude when migrating (exist in external but not in cloud)
const excludeColumns: Record<string, string[]> = {
  import_reports: ['summary_data', 'updated_at'],
  maintenance_logs: ['completed_at', 'created_by', 'updated_at'],
  system_backups: ['created_by', 'updated_at']
};

// Tables to skip (don't exist in external or have major incompatibilities)
const skipTables = ['company_settings', 'mobile_order_import', 'route_stops'];

// Cloud table columns (for filtering unknown columns)
const cloudTableColumns: Record<string, string[]> = {
  units: ['id', 'code', 'description', 'package_quantity', 'created_at', 'updated_at'],
  product_groups: ['id', 'name', 'description', 'notes', 'created_at', 'updated_at'],
  product_categories: ['id', 'name', 'description', 'notes', 'created_at', 'updated_at'],
  product_brands: ['id', 'name', 'description', 'notes', 'created_at', 'updated_at'],
  products: ['id', 'code', 'name', 'description', 'price', 'sale_price', 'cost', 'stock', 'min_stock', 'max_price', 'max_discount_percent', 'unit', 'subunit', 'subunit_ratio', 'has_subunit', 'main_unit_id', 'sub_unit_id', 'group_id', 'category_id', 'brand_id', 'active', 'sync_status', 'created_at', 'updated_at'],
  sales_reps: ['id', 'code', 'name', 'email', 'phone', 'password', 'active', 'created_at', 'updated_at'],
  vehicles: ['id', 'name', 'type', 'brand', 'model', 'year', 'license_plate', 'plate_number', 'capacity', 'driver_name', 'status', 'notes', 'active', 'created_at', 'updated_at'],
  delivery_routes: ['id', 'name', 'description', 'date', 'status', 'vehicle_id', 'vehicle_name', 'driver_id', 'driver_name', 'sales_rep_id', 'sales_rep_name', 'last_updated', 'active', 'created_at', 'updated_at'],
  customers: ['id', 'code', 'name', 'company_name', 'document', 'email', 'phone', 'address', 'neighborhood', 'city', 'state', 'zip', 'notes', 'visit_days', 'visit_frequency', 'visit_sequence', 'visit_sequences', 'sales_rep_id', 'sales_rep_name', 'delivery_route_id', 'active', 'sync_pending', 'created_at', 'updated_at'],
  payment_methods: ['id', 'name', 'description', 'type', 'notes', 'active', 'created_at', 'updated_at'],
  payment_tables: ['id', 'name', 'description', 'type', 'terms', 'installments', 'payable_to', 'payment_location', 'notes', 'active', 'created_at', 'updated_at'],
  orders: ['id', 'code', 'customer_id', 'customer_code', 'customer_name', 'sales_rep_id', 'sales_rep_name', 'date', 'due_date', 'delivery_date', 'delivery_address', 'delivery_city', 'delivery_state', 'delivery_zip', 'status', 'payment_status', 'payment_method', 'payment_method_id', 'payment_table', 'payment_table_id', 'total', 'discount', 'notes', 'visit_notes', 'rejection_reason', 'import_status', 'imported_at', 'imported_by', 'mobile_order_id', 'source_project', 'archived', 'created_at', 'updated_at'],
  order_items: ['id', 'order_id', 'product_id', 'product_code', 'product_name', 'quantity', 'unit', 'price', 'unit_price', 'discount', 'total', 'created_at', 'updated_at'],
  payments: ['id', 'order_id', 'sales_rep_id', 'customer_name', 'customer_document', 'customer_address', 'amount', 'amount_in_words', 'date', 'due_date', 'payment_date', 'method', 'status', 'emission_location', 'payment_location', 'installments', 'notes', 'synced_to_mobile', 'last_sync_date', 'created_at', 'updated_at'],
  loads: ['id', 'code', 'name', 'description', 'date', 'departure_date', 'delivery_date', 'return_date', 'vehicle_id', 'vehicle_name', 'driver_id', 'driver_name', 'sales_rep_id', 'sales_rep_name', 'route_id', 'route_name', 'order_ids', 'status', 'total', 'locked', 'notes', 'created_at', 'updated_at'],
  load_items: ['id', 'load_id', 'order_id', 'order_item_id', 'product_id', 'product_code', 'product_name', 'customer_id', 'quantity', 'price', 'total', 'status', 'created_at', 'updated_at'],
  import_reports: ['id', 'timestamp', 'operation_type', 'operator', 'orders_count', 'total_value', 'sales_reps_count', 'report_data', 'created_at'],
  app_settings: ['id', 'key', 'value', 'created_at', 'updated_at'],
  admin_profiles: ['id', 'user_id', 'name', 'email', 'created_at', 'updated_at'],
  system_backups: ['id', 'name', 'description', 'type', 'backup_data', 'size', 'status', 'created_at'],
  maintenance_logs: ['id', 'operation', 'status', 'details', 'created_at']
};

function filterToCloudColumns(tableName: string, record: Record<string, unknown>): Record<string, unknown> {
  const columns = cloudTableColumns[tableName];
  if (!columns) return record;
  
  const filtered: Record<string, unknown> = {};
  for (const col of columns) {
    if (col in record) {
      filtered[col] = record[col];
    }
  }
  return filtered;
}

function transformRecord(tableName: string, record: Record<string, unknown>): Record<string, unknown> {
  let transformed = { ...record };
  
  // Apply column mappings
  const mappings = columnMappings[tableName];
  if (mappings) {
    for (const [oldCol, newCol] of Object.entries(mappings)) {
      if (oldCol in transformed) {
        transformed[newCol] = transformed[oldCol];
        delete transformed[oldCol];
      }
    }
  }
  
  // Filter to only include columns that exist in cloud
  transformed = filterToCloudColumns(tableName, transformed);
  
  return transformed;
}

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { table, action } = await req.json();

    console.log(`Migration action: ${action}, table: ${table || 'all'}`);

    // Create clients
    const externalClient = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
    const cloudClient = createClient(CLOUD_SUPABASE_URL, CLOUD_SUPABASE_SERVICE_KEY);

    if (action === 'count') {
      const tables = [
        'units', 'product_groups', 'product_categories', 'product_brands', 'products',
        'sales_reps', 'vehicles', 'delivery_routes', 'customers', 'payment_methods',
        'payment_tables', 'orders', 'order_items', 'payments', 'loads', 'load_items',
        'route_stops', 'import_reports', 'mobile_order_import', 'company_settings',
        'app_settings', 'admin_profiles', 'system_backups', 'maintenance_logs'
      ];

      const counts: Record<string, { external: number; cloud: number }> = {};
      
      for (const tableName of tables) {
        try {
          const { count: externalCount } = await externalClient
            .from(tableName)
            .select('*', { count: 'exact', head: true });
          
          const { count: cloudCount } = await cloudClient
            .from(tableName)
            .select('*', { count: 'exact', head: true });

          counts[tableName] = {
            external: externalCount || 0,
            cloud: cloudCount || 0
          };
        } catch (e) {
          console.log(`Error counting ${tableName}:`, e);
          counts[tableName] = { external: 0, cloud: 0 };
        }
      }

      return new Response(JSON.stringify({ success: true, counts }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'migrate') {
      // Migration order is important due to foreign keys
      const migrationOrder = [
        'units',
        'product_groups', 
        'product_categories', 
        'product_brands',
        'sales_reps',
        'vehicles',
        'payment_methods',
        'payment_tables',
        'delivery_routes',
        'products',
        'customers',
        'orders',
        'order_items',
        'payments',
        'loads',
        'load_items',
        'import_reports',
        'app_settings',
        'admin_profiles',
        'system_backups',
        'maintenance_logs'
      ];

      const tablesToMigrate = table ? [table] : migrationOrder;
      const results: Record<string, { success: boolean; count: number; error?: string; skipped?: boolean }> = {};

      for (const tableName of tablesToMigrate) {
        // Skip incompatible tables
        if (skipTables.includes(tableName)) {
          console.log(`Skipping table: ${tableName} (not compatible)`);
          results[tableName] = { success: true, count: 0, skipped: true };
          continue;
        }

        try {
          console.log(`Migrating table: ${tableName}`);
          
          // Fetch all data from external
          const { data: externalData, error: fetchError } = await externalClient
            .from(tableName)
            .select('*');

          if (fetchError) {
            console.log(`Fetch error for ${tableName}:`, fetchError.message);
            results[tableName] = { success: false, count: 0, error: fetchError.message };
            continue;
          }

          if (!externalData || externalData.length === 0) {
            console.log(`No data in ${tableName}`);
            results[tableName] = { success: true, count: 0 };
            continue;
          }

          // Transform records to handle schema differences
          const transformedData = externalData.map(record => transformRecord(tableName, record));

          console.log(`Found ${transformedData.length} records in ${tableName}`);
          console.log(`Sample transformed record:`, JSON.stringify(transformedData[0]).substring(0, 500));

          // Delete existing data in cloud (to avoid duplicates)
          const { error: deleteError } = await cloudClient
            .from(tableName)
            .delete()
            .neq('id', '00000000-0000-0000-0000-000000000000');

          if (deleteError) {
            console.log(`Delete error for ${tableName}:`, deleteError.message);
          }

          // Insert data into cloud in batches
          const batchSize = 50;
          let insertedCount = 0;
          let lastError = null;
          
          for (let i = 0; i < transformedData.length; i += batchSize) {
            const batch = transformedData.slice(i, i + batchSize);
            const { error: insertError } = await cloudClient.from(tableName).insert(batch);
            
            if (insertError) {
              console.error(`Error inserting batch for ${tableName}:`, insertError);
              lastError = insertError.message;
              // Continue with remaining batches instead of stopping
            } else {
              insertedCount += batch.length;
            }
          }

          results[tableName] = { 
            success: insertedCount > 0 || !lastError, 
            count: insertedCount,
            error: lastError || undefined
          };
          
          console.log(`✅ Migrated ${tableName}: ${insertedCount} records`);
        } catch (error) {
          console.error(`Error migrating ${tableName}:`, error);
          results[tableName] = { 
            success: false, 
            count: 0, 
            error: error.message 
          };
        }
      }

      return new Response(JSON.stringify({ success: true, results }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Migration error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
})
