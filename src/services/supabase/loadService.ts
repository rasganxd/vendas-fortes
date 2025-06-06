
import { supabase } from '@/integrations/supabase/client';
import { Load } from '@/types';

export class LoadService {
  static async getAllLoads(): Promise<Load[]> {
    console.log('🔍 Getting all loads from database...');
    
    const { data: loadsData, error: loadsError } = await supabase
      .from('loads')
      .select('*')
      .order('created_at', { ascending: false });
    
    if (loadsError) {
      console.error('❌ Error getting loads:', loadsError);
      return [];
    }
    
    return (loadsData || []).map(load => ({
      id: load.id,
      name: load.name,
      code: load.code,
      description: load.description,
      date: new Date(load.date),
      vehicleId: load.vehicle_id,
      vehicleName: load.vehicle_name,
      driverId: load.driver_id,
      driverName: load.driver_name,
      salesRepId: load.sales_rep_id,
      salesRepName: load.sales_rep_name,
      routeId: load.route_id,
      routeName: load.route_name,
      status: load.status as Load['status'],
      departureDate: load.departure_date ? new Date(load.departure_date) : undefined,
      deliveryDate: load.delivery_date ? new Date(load.delivery_date) : undefined,
      returnDate: load.return_date ? new Date(load.return_date) : undefined,
      notes: load.notes,
      orderIds: Array.isArray(load.order_ids) ? load.order_ids as string[] : [],
      total: load.total || 0,
      locked: load.locked || false,
      createdAt: new Date(load.created_at),
      updatedAt: new Date(load.updated_at)
    }));
  }

  static async createLoad(loadData: Omit<Load, 'id' | 'code'>): Promise<string> {
    console.log('📦 Creating new load:', loadData);
    
    // Get next load code
    const { data: codeData, error: codeError } = await supabase
      .rpc('get_next_load_code');
    
    if (codeError) {
      console.error('❌ Error getting next load code:', codeError);
      throw codeError;
    }

    const loadCode = codeData;
    
    const { data, error } = await supabase
      .from('loads')
      .insert({
        name: loadData.name,
        code: loadCode,
        description: loadData.description,
        date: loadData.date.toISOString(),
        vehicle_id: loadData.vehicleId,
        vehicle_name: loadData.vehicleName,
        driver_id: loadData.driverId,
        driver_name: loadData.driverName,
        sales_rep_id: loadData.salesRepId,
        sales_rep_name: loadData.salesRepName,
        route_id: loadData.routeId,
        route_name: loadData.routeName,
        status: loadData.status,
        departure_date: loadData.departureDate?.toISOString(),
        delivery_date: loadData.deliveryDate?.toISOString(),
        return_date: loadData.returnDate?.toISOString(),
        notes: loadData.notes,
        order_ids: loadData.orderIds || [],
        total: loadData.total || 0,
        locked: loadData.locked || false,
        created_at: loadData.createdAt.toISOString(),
        updated_at: loadData.updatedAt.toISOString()
      })
      .select()
      .single();
    
    if (error) {
      console.error('❌ Error creating load:', error);
      throw error;
    }
    
    console.log('✅ Load created successfully:', data.id);
    
    // Create load items if orders are provided
    if (loadData.orderIds && loadData.orderIds.length > 0) {
      await this.createLoadItems(data.id, loadData.orderIds);
    }
    
    return data.id;
  }

  static async updateLoad(id: string, updates: Partial<Load>): Promise<void> {
    console.log('📝 Updating load:', id, updates);
    
    const updateData: any = {};
    
    if (updates.name !== undefined) updateData.name = updates.name;
    if (updates.description !== undefined) updateData.description = updates.description;
    if (updates.date !== undefined) updateData.date = updates.date.toISOString();
    if (updates.vehicleId !== undefined) updateData.vehicle_id = updates.vehicleId;
    if (updates.vehicleName !== undefined) updateData.vehicle_name = updates.vehicleName;
    if (updates.driverId !== undefined) updateData.driver_id = updates.driverId;
    if (updates.driverName !== undefined) updateData.driver_name = updates.driverName;
    if (updates.salesRepId !== undefined) updateData.sales_rep_id = updates.salesRepId;
    if (updates.salesRepName !== undefined) updateData.sales_rep_name = updates.salesRepName;
    if (updates.routeId !== undefined) updateData.route_id = updates.routeId;
    if (updates.routeName !== undefined) updateData.route_name = updates.routeName;
    if (updates.status !== undefined) updateData.status = updates.status;
    if (updates.departureDate !== undefined) updateData.departure_date = updates.departureDate?.toISOString();
    if (updates.deliveryDate !== undefined) updateData.delivery_date = updates.deliveryDate?.toISOString();
    if (updates.returnDate !== undefined) updateData.return_date = updates.returnDate?.toISOString();
    if (updates.notes !== undefined) updateData.notes = updates.notes;
    if (updates.orderIds !== undefined) updateData.order_ids = updates.orderIds;
    if (updates.total !== undefined) updateData.total = updates.total;
    if (updates.locked !== undefined) updateData.locked = updates.locked;
    
    updateData.updated_at = new Date().toISOString();
    
    const { error } = await supabase
      .from('loads')
      .update(updateData)
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error updating load:', error);
      throw error;
    }
    
    // Update load items if order IDs changed
    if (updates.orderIds !== undefined) {
      await this.updateLoadItems(id, updates.orderIds);
    }
    
    console.log('✅ Load updated successfully');
  }

  static async deleteLoad(id: string): Promise<void> {
    console.log('🗑️ Deleting load:', id);
    
    // First delete associated load items
    await this.deleteLoadItems(id);
    
    const { error } = await supabase
      .from('loads')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('❌ Error deleting load:', error);
      throw error;
    }
    
    console.log('✅ Load deleted successfully');
  }

  private static async createLoadItems(loadId: string, orderIds: string[]): Promise<void> {
    console.log('📦 Creating load items for load:', loadId);
    
    const loadItems = orderIds.map(orderId => ({
      load_id: loadId,
      order_id: orderId,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    }));
    
    const { error } = await supabase
      .from('load_items')
      .insert(loadItems);
    
    if (error) {
      console.error('❌ Error creating load items:', error);
      throw error;
    }
    
    console.log('✅ Load items created successfully');
  }

  private static async updateLoadItems(loadId: string, orderIds: string[]): Promise<void> {
    console.log('📝 Updating load items for load:', loadId);
    
    // Delete existing load items
    await this.deleteLoadItems(loadId);
    
    // Create new load items
    if (orderIds.length > 0) {
      await this.createLoadItems(loadId, orderIds);
    }
  }

  private static async deleteLoadItems(loadId: string): Promise<void> {
    console.log('🗑️ Deleting load items for load:', loadId);
    
    const { error } = await supabase
      .from('load_items')
      .delete()
      .eq('load_id', loadId);
    
    if (error) {
      console.error('❌ Error deleting load items:', error);
      throw error;
    }
    
    console.log('✅ Load items deleted successfully');
  }
}
