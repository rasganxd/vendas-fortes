
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types/unit';

export interface DatabaseUnit {
  id: string;
  value: string;
  label: string;
  conversion_rate: number;
  is_default: boolean;
  created_at: string;
  updated_at: string;
}

export const productUnitsService = {
  // Buscar todas as unidades
  async getAll(): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('product_units')
      .select('*')
      .order('value');

    if (error) {
      console.error('Erro ao buscar unidades:', error);
      throw error;
    }

    return data.map(unit => ({
      value: unit.value,
      label: unit.label,
      conversionRate: Number(unit.conversion_rate)
    }));
  },

  // Adicionar nova unidade
  async add(unit: Omit<Unit, 'id'>): Promise<string> {
    const { data, error } = await supabase
      .from('product_units')
      .insert({
        value: unit.value.toUpperCase(),
        label: unit.label,
        conversion_rate: unit.conversionRate,
        is_default: false
      })
      .select('id')
      .single();

    if (error) {
      console.error('Erro ao adicionar unidade:', error);
      throw error;
    }

    return data.id;
  },

  // Atualizar unidade existente
  async update(value: string, unit: Partial<Unit>): Promise<void> {
    const updateData: any = {};
    
    if (unit.value) updateData.value = unit.value.toUpperCase();
    if (unit.label) updateData.label = unit.label;
    if (unit.conversionRate !== undefined) updateData.conversion_rate = unit.conversionRate;
    
    updateData.updated_at = new Date().toISOString();

    const { error } = await supabase
      .from('product_units')
      .update(updateData)
      .eq('value', value);

    if (error) {
      console.error('Erro ao atualizar unidade:', error);
      throw error;
    }
  },

  // Remover unidade
  async remove(value: string): Promise<void> {
    const { error } = await supabase
      .from('product_units')
      .delete()
      .eq('value', value);

    if (error) {
      console.error('Erro ao remover unidade:', error);
      throw error;
    }
  },

  // Resetar para unidades padrão
  async resetToDefault(): Promise<void> {
    // Primeiro, remove todas as unidades não padrão
    const { error: deleteError } = await supabase
      .from('product_units')
      .delete()
      .eq('is_default', false);

    if (deleteError) {
      console.error('Erro ao limpar unidades customizadas:', deleteError);
      throw deleteError;
    }

    // As unidades padrão já estão no banco, não precisa reinseri-las
  }
};
