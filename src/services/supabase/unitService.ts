
import { supabase } from '@/integrations/supabase/client';
import { Unit } from '@/types/unit';

export const unitService = {
  async getAll(): Promise<Unit[]> {
    const { data, error } = await supabase
      .from('units')
      .select('*')
      .order('code');

    if (error) {
      console.error('Erro ao buscar unidades:', error);
      throw error;
    }

    return data?.map(unit => ({
      id: unit.id,
      code: unit.code,
      description: unit.description,
      packaging: unit.packaging,
      createdAt: new Date(unit.created_at),
      updatedAt: new Date(unit.updated_at)
    })) || [];
  },

  async create(unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .insert({
        code: unit.code,
        description: unit.description,
        packaging: unit.packaging
      })
      .select()
      .single();

    if (error) {
      console.error('Erro ao criar unidade:', error);
      throw error;
    }

    return {
      id: data.id,
      code: data.code,
      description: data.description,
      packaging: data.packaging,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async update(id: string, unit: Partial<Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Unit> {
    const { data, error } = await supabase
      .from('units')
      .update({
        code: unit.code,
        description: unit.description,
        packaging: unit.packaging,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) {
      console.error('Erro ao atualizar unidade:', error);
      throw error;
    }

    return {
      id: data.id,
      code: data.code,
      description: data.description,
      packaging: data.packaging,
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
  },

  async delete(id: string): Promise<void> {
    const { error } = await supabase
      .from('units')
      .delete()
      .eq('id', id);

    if (error) {
      console.error('Erro ao deletar unidade:', error);
      throw error;
    }
  }
};
