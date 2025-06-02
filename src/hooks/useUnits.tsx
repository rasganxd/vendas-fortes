
import { useState, useEffect } from 'react';
import { Unit } from '@/types/unit';
import { unitService } from '@/services/supabase/unitService';
import { toast } from 'sonner';

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadUnits = async () => {
    try {
      setIsLoading(true);
      const data = await unitService.getAll();
      setUnits(data);
    } catch (error) {
      console.error('Erro ao carregar unidades:', error);
      toast.error('Erro ao carregar unidades');
    } finally {
      setIsLoading(false);
    }
  };

  const createUnit = async (unit: Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newUnit = await unitService.create(unit);
      setUnits(prev => [...prev, newUnit]);
      toast.success('Unidade criada com sucesso');
      return newUnit;
    } catch (error) {
      console.error('Erro ao criar unidade:', error);
      toast.error('Erro ao criar unidade');
      throw error;
    }
  };

  const updateUnit = async (id: string, unit: Partial<Omit<Unit, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedUnit = await unitService.update(id, unit);
      setUnits(prev => prev.map(u => u.id === id ? updatedUnit : u));
      toast.success('Unidade atualizada com sucesso');
      return updatedUnit;
    } catch (error) {
      console.error('Erro ao atualizar unidade:', error);
      toast.error('Erro ao atualizar unidade');
      throw error;
    }
  };

  const deleteUnit = async (id: string) => {
    try {
      await unitService.delete(id);
      setUnits(prev => prev.filter(u => u.id !== id));
      toast.success('Unidade excluída com sucesso');
    } catch (error) {
      console.error('Erro ao excluir unidade:', error);
      toast.error('Erro ao excluir unidade');
      throw error;
    }
  };

  useEffect(() => {
    loadUnits();
  }, []);

  return {
    units,
    isLoading,
    createUnit,
    updateUnit,
    deleteUnit,
    refreshUnits: loadUnits
  };
};
