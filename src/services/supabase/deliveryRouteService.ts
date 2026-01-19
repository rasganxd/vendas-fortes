
import { SupabaseService } from './supabaseService';
import { DeliveryRoute, Customer } from '@/types';

interface RouteWithCustomersRow {
  route_id: string;
  route_name: string;
  route_description: string;
  route_status: string;
  route_date: string;
  route_sales_rep_id: string;
  route_sales_rep_name: string;
  route_vehicle_id: string;
  route_vehicle_name: string;
  route_last_updated: string;
  customer_id: string;
  customer_name: string;
  customer_code: number;
  customer_address: string;
  customer_city: string;
  customer_state: string;
  customer_zip_code: string;
  customer_phone: string;
}

class DeliveryRouteSupabaseService extends SupabaseService<DeliveryRoute> {
  constructor() {
    super('delivery_routes');
  }

  protected transformFromDB(dbRecord: any): DeliveryRoute {
    if (!dbRecord) return dbRecord;
    
    return {
      id: dbRecord.id,
      name: dbRecord.name,
      description: dbRecord.description,
      active: dbRecord.active,
      status: dbRecord.status || 'pending',
      date: new Date(dbRecord.date || dbRecord.created_at),
      driverId: dbRecord.driver_id || '',
      driverName: dbRecord.driver_name || '',
      vehicleId: dbRecord.vehicle_id || '',
      vehicleName: dbRecord.vehicle_name || '',
      stops: dbRecord.stops || [],
      createdAt: new Date(dbRecord.created_at),
      updatedAt: new Date(dbRecord.updated_at),
      salesRepId: dbRecord.sales_rep_id,
      salesRepName: dbRecord.sales_rep_name,
      lastUpdated: dbRecord.last_updated ? new Date(dbRecord.last_updated) : undefined,
      customers: []
    };
  }

  protected transformToDB(record: Partial<DeliveryRoute>): any {
    if (!record) return record;
    
    return {
      name: record.name,
      description: record.description,
      active: record.active,
      status: record.status,
      date: record.date?.toISOString(),
      driver_id: record.driverId,
      driver_name: record.driverName,
      vehicle_id: record.vehicleId,
      vehicle_name: record.vehicleName,
      stops: record.stops || [],
      sales_rep_id: record.salesRepId,
      sales_rep_name: record.salesRepName,
      last_updated: record.lastUpdated?.toISOString()
    };
  }

  async getRouteWithCustomers(routeId: string): Promise<DeliveryRoute | null> {
    try {
      console.log(`🔍 Getting route with customers: ${routeId}`);
      
      const { data, error } = await (this.supabase as any).rpc('get_route_with_customers', {
        p_route_id: routeId
      });
      
      if (error) {
        console.error('❌ Error getting route with customers:', error);
        throw error;
      }
      
      if (!data || data.length === 0) {
        console.log('❌ Route not found');
        return null;
      }
      
      // Transform the data
      const firstRow = data[0] as RouteWithCustomersRow;
      const route: DeliveryRoute = {
        id: firstRow.route_id,
        name: firstRow.route_name,
        description: firstRow.route_description || '',
        active: true,
        status: firstRow.route_status as any,
        date: new Date(firstRow.route_date),
        driverId: '',
        driverName: '',
        vehicleId: firstRow.route_vehicle_id || '',
        vehicleName: firstRow.route_vehicle_name || '',
        stops: [],
        createdAt: new Date(),
        updatedAt: new Date(),
        salesRepId: firstRow.route_sales_rep_id,
        salesRepName: firstRow.route_sales_rep_name,
        lastUpdated: firstRow.route_last_updated ? new Date(firstRow.route_last_updated) : undefined,
        customers: []
      };
      
      // Group customers
      const customers: Customer[] = [];
      data.forEach((row: RouteWithCustomersRow) => {
        if (row.customer_id) {
          customers.push({
            id: row.customer_id,
            name: row.customer_name,
            code: row.customer_code,
            address: row.customer_address || '',
            city: row.customer_city || '',
            state: row.customer_state || '',
            zip: row.customer_zip_code || '',
            phone: row.customer_phone || '',
            email: '',
            notes: '',
            createdAt: new Date(),
            updatedAt: new Date(),
            deliveryRouteId: routeId
          });
        }
      });
      
      route.customers = customers;
      
      console.log(`✅ Found route with ${customers.length} customers`);
      return route;
    } catch (error) {
      console.error('❌ Error in getRouteWithCustomers:', error);
      throw error;
    }
  }

  async syncCustomersToRoute(routeId: string, salesRepId: string): Promise<number> {
    try {
      console.log(`🔄 Syncing customers to route: ${routeId}, sales rep: ${salesRepId}`);
      
      const { data, error } = await (this.supabase as any).rpc('sync_customers_to_route', {
        p_route_id: routeId,
        p_sales_rep_id: salesRepId
      });
      
      if (error) {
        console.error('❌ Error syncing customers to route:', error);
        throw error;
      }
      
      const customersCount = data || 0;
      console.log(`✅ Synced ${customersCount} customers to route`);
      return customersCount;
    } catch (error) {
      console.error('❌ Error in syncCustomersToRoute:', error);
      throw error;
    }
  }

  async updateRouteWithSalesRep(routeId: string, salesRepId: string, salesRepName: string): Promise<void> {
    try {
      console.log(`📝 Updating route ${routeId} with sales rep: ${salesRepName}`);
      
      const { error } = await this.supabase
        .from('delivery_routes')
        .update({
          sales_rep_id: salesRepId,
          sales_rep_name: salesRepName,
          last_updated: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .eq('id', routeId);
      
      if (error) {
        console.error('❌ Error updating route with sales rep:', error);
        throw error;
      }
      
      console.log(`✅ Updated route ${routeId} with sales rep`);
    } catch (error) {
      console.error('❌ Error in updateRouteWithSalesRep:', error);
      throw error;
    }
  }

  async generateRouteUpdate(routeId: string, salesRepId: string): Promise<number> {
    try {
      console.log(`🔄 Generating route update: ${routeId} for sales rep: ${salesRepId}`);
      
      // Get sales rep info
      const { data: salesRepData, error: salesRepError } = await this.supabase
        .from('sales_reps')
        .select('name')
        .eq('id', salesRepId)
        .single();
      
      if (salesRepError) {
        console.error('❌ Error getting sales rep:', salesRepError);
        throw salesRepError;
      }
      
      // Update route with sales rep
      await this.updateRouteWithSalesRep(routeId, salesRepId, salesRepData.name);
      
      // Sync customers to route
      const customersCount = await this.syncCustomersToRoute(routeId, salesRepId);
      
      console.log(`✅ Route update generated: ${customersCount} customers synced`);
      return customersCount;
    } catch (error) {
      console.error('❌ Error in generateRouteUpdate:', error);
      throw error;
    }
  }
}

export const deliveryRouteService = new DeliveryRouteSupabaseService();
