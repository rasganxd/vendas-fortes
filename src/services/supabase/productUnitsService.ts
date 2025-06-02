
import { supabase } from '@/lib/supabase';
import { Unit } from '@/types/unit';

export const productUnitsService = {
  async getAll(): Promise<Unit[]> {
    try {
      const { data, error } = await supabase
        .from('units')
        .select('*')
        .order('code');

      if (error) throw error;
      return data || [];
    } catch (error) {
      console.error('Error fetching units:', error);
      return [];
    }
  },

  async create(unitData: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
    try {
      const { data, error } = await supabase
        .from('units')
        .insert([unitData])
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error creating unit:', error);
      throw error;
    }
  },

  async update(id: string, unitData: Partial<Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Unit> {
    try {
      const { data, error } = await supabase
        .from('units')
        .update({ ...unitData, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();

      if (error) throw error;
      return data;
    } catch (error) {
      console.error('Error updating unit:', error);
      throw error;
    }
  },

  async delete(id: string): Promise<void> {
    try {
      const { error } = await supabase
        .from('units')
        .delete()
        .eq('id', id);

      if (error) throw error;
    } catch (error) {
      console.error('Error deleting unit:', error);
      throw error;
    }
  }
};
