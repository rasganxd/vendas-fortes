
import { supabase } from '@/integrations/supabase/client';

export interface Unit {
  id: string;
  code: string;
  description: string;
  package_quantity?: number;
  created_at: string;
  updated_at: string;
}

export const unitService = {
  async getAll(): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('code');
    
    if (error) {
      console.error('Error fetching units:', error);
      throw new Error(`Failed to fetch units: ${error.message}`);
    }
    
    return data || [];
  },

  async create(unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<string> {
    const { data, error } = await supabase
      .from('units')
      .insert([unit])
      .select()
      .single();
    
    if (error) {
      console.error('Error creating unit:', error);
      throw new Error(`Failed to create unit: ${error.message}`);
    }
    
    return data.id;
  },

  async update(id: string, unit: Partial<Omit<Unit, 'id' | 'created_at' | 'updated_at'>>): Promise<void> {
    const { error } = await supabase
      .from('units')
      .update({ ...unit, updated_at: new Date().toISOString() })
      .eq('id', id);
    
    if (error) {
      console.error('Error updating unit:', error);
      throw new Error(`Failed to update unit: ${error.message}`);
    }
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);
    
    if (error) {
      console.error('Error deleting unit:', error);
      throw new Error(`Failed to delete unit: ${error.message}`);
    }
  }
};
