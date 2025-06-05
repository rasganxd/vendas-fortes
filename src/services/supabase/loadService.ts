
import { SupabaseService } from './supabaseService';
import { Load } from '@/types';

class LoadSupabaseService extends SupabaseService<Load> {
  constructor() {
    super('loads');
  }

  async generateNextCode(): Promise<number> {
    try {
      const { data, error } = await this.supabase.rpc('get_next_load_code');
      
      if (error) {
        console.error('Error generating load code:', error);
        // Fallback: get max code and add 1
        const allLoads = await this.getAll();
        const maxCode = allLoads.reduce((max, load) => Math.max(max, load.code || 0), 0);
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating load code:', error);
      return 1;
    }
  }

  // Sobrescrevemos o método add para mapear corretamente os campos
  async add(load: Omit<Load, 'id'>): Promise<string> {
    try {
      // Prepara o objeto para inserção no banco
      const loadToInsert = {
        name: load.name,
        description: load.description,
        date: load.date,
        vehicle_id: load.vehicleId,
        vehicle_name: load.vehicleName,
        sales_rep_id: load.salesRepId,
        sales_rep_name: load.salesRepName,
        driver_id: load.driverId,
        driver_name: load.driverName,
        route_id: load.routeId,
        route_name: load.routeName,
        status: load.status,
        locked: load.locked || false,
        notes: load.notes,
        order_ids: load.orderIds || [],
        total: load.total || 0,
        departure_date: load.departureDate,
        delivery_date: load.deliveryDate,
        return_date: load.returnDate,
        code: load.code
      };

      const { data, error } = await this.supabase
        .from(this.tableName)
        .insert(loadToInsert)
        .select('id')
        .single();

      if (error) {
        console.error('Error adding load:', error);
        throw error;
      }

      return data.id;
    } catch (error) {
      console.error('Error in add load:', error);
      throw error;
    }
  }

  // Sobrescrevemos o método getAll para mapear corretamente os campos
  async getAll(): Promise<Load[]> {
    try {
      const { data, error } = await this.supabase
        .from(this.tableName)
        .select('*')
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching loads:', error);
        throw error;
      }

      // Mapeia os resultados do banco para o formato esperado pelo frontend
      return data.map(load => ({
        id: load.id,
        name: load.name,
        code: load.code,
        description: load.description,
        date: new Date(load.date),
        vehicleId: load.vehicle_id,
        vehicleName: load.vehicle_name,
        salesRepId: load.sales_rep_id,
        salesRepName: load.sales_rep_name,
        driverId: load.driver_id,
        driverName: load.driver_name,
        routeId: load.route_id,
        routeName: load.route_name,
        status: load.status,
        locked: load.locked || false,
        notes: load.notes,
        orderIds: load.order_ids || [],
        total: load.total || 0,
        departureDate: load.departure_date ? new Date(load.departure_date) : undefined,
        deliveryDate: load.delivery_date ? new Date(load.delivery_date) : undefined,
        returnDate: load.return_date ? new Date(load.return_date) : undefined,
        createdAt: new Date(load.created_at),
        updatedAt: new Date(load.updated_at)
      }));
    } catch (error) {
      console.error('Error in getAll loads:', error);
      return [];
    }
  }
  
  // Sobrescrevemos o método update para mapear corretamente os campos
  async update(id: string, load: Partial<Load>): Promise<void> {
    try {
      // Prepara o objeto para atualização no banco
      const loadToUpdate: any = {};

      if (load.name !== undefined) loadToUpdate.name = load.name;
      if (load.description !== undefined) loadToUpdate.description = load.description;
      if (load.date !== undefined) loadToUpdate.date = load.date;
      if (load.vehicleId !== undefined) loadToUpdate.vehicle_id = load.vehicleId;
      if (load.vehicleName !== undefined) loadToUpdate.vehicle_name = load.vehicleName;
      if (load.salesRepId !== undefined) loadToUpdate.sales_rep_id = load.salesRepId;
      if (load.salesRepName !== undefined) loadToUpdate.sales_rep_name = load.salesRepName;
      if (load.driverId !== undefined) loadToUpdate.driver_id = load.driverId;
      if (load.driverName !== undefined) loadToUpdate.driver_name = load.driverName;
      if (load.routeId !== undefined) loadToUpdate.route_id = load.routeId;
      if (load.routeName !== undefined) loadToUpdate.route_name = load.routeName;
      if (load.status !== undefined) loadToUpdate.status = load.status;
      if (load.locked !== undefined) loadToUpdate.locked = load.locked;
      if (load.notes !== undefined) loadToUpdate.notes = load.notes;
      if (load.orderIds !== undefined) loadToUpdate.order_ids = load.orderIds;
      if (load.total !== undefined) loadToUpdate.total = load.total;
      if (load.departureDate !== undefined) loadToUpdate.departure_date = load.departureDate;
      if (load.deliveryDate !== undefined) loadToUpdate.delivery_date = load.deliveryDate;
      if (load.returnDate !== undefined) loadToUpdate.return_date = load.returnDate;

      const { error } = await this.supabase
        .from(this.tableName)
        .update(loadToUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating load:', error);
        throw error;
      }
    } catch (error) {
      console.error('Error in update load:', error);
      throw error;
    }
  }
}

export const loadService = new LoadSupabaseService();
