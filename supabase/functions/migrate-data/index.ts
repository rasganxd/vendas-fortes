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

Deno.serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const { table, action } = await req.json();

    // Create clients
    const externalClient = createClient(EXTERNAL_SUPABASE_URL, EXTERNAL_SUPABASE_ANON_KEY);
    const cloudClient = createClient(CLOUD_SUPABASE_URL, CLOUD_SUPABASE_SERVICE_KEY);

    if (action === 'count') {
      // Get counts from external database
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
        'route_stops',
        'import_reports',
        'mobile_order_import',
        'company_settings',
        'app_settings',
        'admin_profiles',
        'system_backups',
        'maintenance_logs'
      ];

      const tablesToMigrate = table ? [table] : migrationOrder;
      const results: Record<string, { success: boolean; count: number; error?: string }> = {};

      for (const tableName of tablesToMigrate) {
        try {
          console.log(`Migrating table: ${tableName}`);
          
          // Fetch all data from external
          const { data: externalData, error: fetchError } = await externalClient
            .from(tableName)
            .select('*');

          if (fetchError) {
            results[tableName] = { success: false, count: 0, error: fetchError.message };
            continue;
          }

          if (!externalData || externalData.length === 0) {
            results[tableName] = { success: true, count: 0 };
            continue;
          }

          // Delete existing data in cloud (to avoid duplicates)
          await cloudClient.from(tableName).delete().neq('id', '00000000-0000-0000-0000-000000000000');

          // Insert data into cloud in batches
          const batchSize = 100;
          let insertedCount = 0;
          
          for (let i = 0; i < externalData.length; i += batchSize) {
            const batch = externalData.slice(i, i + batchSize);
            const { error: insertError } = await cloudClient.from(tableName).insert(batch);
            
            if (insertError) {
              console.error(`Error inserting batch for ${tableName}:`, insertError);
              results[tableName] = { 
                success: false, 
                count: insertedCount, 
                error: insertError.message 
              };
              break;
            }
            insertedCount += batch.length;
          }

          if (!results[tableName]) {
            results[tableName] = { success: true, count: insertedCount };
          }
          
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
