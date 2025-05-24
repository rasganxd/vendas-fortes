
import { supabase } from '@/integrations/supabase/client';
import { Customer } from '@/types';

export const customerService = {
  async getAll(): Promise<Customer[]> {
    try {
      console.log("Getting all customers from Supabase...");
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .order('created_at', { ascending: false });
      
      if (error) {
        console.error("Error getting customers:", error);
        return [];
      }
      
      const customers = data?.map(item => ({
        id: item.id,
        code: item.code || 0,
        name: item.name,
        email: item.email || '',
        phone: item.phone || '',
        address: item.address || '',
        city: item.city || '',
        state: item.state || '',
        zip: item.zip_code || '',
        document: '',
        notes: '',
        sales_rep_id: item.sales_rep_id || '',
        deliveryRouteId: item.delivery_route_id || '',
        createdAt: new Date(item.created_at),
        updatedAt: new Date(item.updated_at)
      })) || [];
      
      console.log(`Retrieved ${customers.length} customers from Supabase`);
      return customers;
    } catch (error) {
      console.error("Error getting all customers:", error);
      return [];
    }
  },
  
  async getById(id: string): Promise<Customer | null> {
    try {
      const { data, error } = await supabase
        .from('customers')
        .select('*')
        .eq('id', id)
        .single();
      
      if (error) {
        if (error.code === 'PGRST116') return null;
        console.error("Error getting customer by ID:", error);
        return null;
      }
      
      return {
        id: data.id,
        code: data.code || 0,
        name: data.name,
        email: data.email || '',
        phone: data.phone || '',
        address: data.address || '',
        city: data.city || '',
        state: data.state || '',
        zip: data.zip_code || '',
        document: '',
        notes: '',
        sales_rep_id: data.sales_rep_id || '',
        deliveryRouteId: data.delivery_route_id || '',
        createdAt: new Date(data.created_at),
        updatedAt: new Date(data.updated_at)
      };
    } catch (error) {
      console.error("Error getting customer by ID:", error);
      return null;
    }
  },
  
  async add(customer: Omit<Customer, 'id'>): Promise<string> {
    try {
      // Get next code if not provided
      let code = customer.code;
      if (!code) {
        const { data: codeData } = await supabase.rpc('get_next_customer_code');
        code = codeData || 1;
      }
      
      const customerData = {
        code,
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        address: customer.address,
        city: customer.city,
        state: customer.state,
        zip_code: customer.zip,
        sales_rep_id: customer.sales_rep_id,
        delivery_route_id: customer.deliveryRouteId
      };
      
      const { data, error } = await supabase
        .from('customers')
        .insert(customerData)
        .select('id')
        .single();
      
      if (error) {
        console.error("Error adding customer:", error);
        throw error;
      }
      
      return data.id;
    } catch (error) {
      console.error("Error adding customer:", error);
      throw error;
    }
  },
  
  async update(id: string, customer: Partial<Customer>): Promise<void> {
    try {
      const updateData: any = {};
      
      if (customer.code !== undefined) updateData.code = customer.code;
      if (customer.name !== undefined) updateData.name = customer.name;
      if (customer.email !== undefined) updateData.email = customer.email;
      if (customer.phone !== undefined) updateData.phone = customer.phone;
      if (customer.address !== undefined) updateData.address = customer.address;
      if (customer.city !== undefined) updateData.city = customer.city;
      if (customer.state !== undefined) updateData.state = customer.state;
      if (customer.zip !== undefined) updateData.zip_code = customer.zip;
      if (customer.sales_rep_id !== undefined) updateData.sales_rep_id = customer.sales_rep_id;
      if (customer.deliveryRouteId !== undefined) updateData.delivery_route_id = customer.deliveryRouteId;
      
      updateData.updated_at = new Date().toISOString();
      
      const { error } = await supabase
        .from('customers')
        .update(updateData)
        .eq('id', id);
      
      if (error) {
        console.error("Error updating customer:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error updating customer:", error);
      throw error;
    }
  },
  
  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('customers')
        .delete()
        .eq('id', id);
      
      if (error) {
        console.error("Error deleting customer:", error);
        throw error;
      }
    } catch (error) {
      console.error("Error deleting customer:", error);
      throw error;
    }
  }
};
