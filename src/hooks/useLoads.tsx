
import { useState, useEffect } from 'react';
import { Load } from '@/types';
import { LoadService } from '@/services/supabase/loadService';
import { toast } from 'sonner';

export const useLoads = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadLoads = async () => {
    try {
      setIsLoading(true);
      console.log('🔄 Loading loads...');
      const loadsData = await LoadService.getAllLoads();
      setLoads(loadsData);
      console.log('✅ Loads loaded successfully:', loadsData.length);
    } catch (error) {
      console.error('❌ Error loading loads:', error);
      toast.error('Erro ao carregar cargas');
    } finally {
      setIsLoading(false);
    }
  };

  const addLoad = async (loadData: Omit<Load, 'id' | 'code'>): Promise<string> => {
    try {
      console.log('📦 Adding new load...');
      const loadId = await LoadService.createLoad(loadData);
      await loadLoads(); // Refresh the list
      toast.success('Carga criada com sucesso!');
      return loadId;
    } catch (error) {
      console.error('❌ Error adding load:', error);
      toast.error('Erro ao criar carga');
      throw error;
    }
  };

  const updateLoad = async (id: string, updates: Partial<Load>): Promise<void> => {
    try {
      console.log('📝 Updating load:', id);
      await LoadService.updateLoad(id, updates);
      await loadLoads(); // Refresh the list
      toast.success('Carga atualizada com sucesso!');
    } catch (error) {
      console.error('❌ Error updating load:', error);
      toast.error('Erro ao atualizar carga');
      throw error;
    }
  };

  const deleteLoad = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Deleting load:', id);
      await LoadService.deleteLoad(id);
      await loadLoads(); // Refresh the list
      toast.success('Carga excluída com sucesso!');
    } catch (error) {
      console.error('❌ Error deleting load:', error);
      toast.error('Erro ao excluir carga');
      throw error;
    }
  };

  useEffect(() => {
    loadLoads();
  }, []);

  return {
    loads,
    isLoading,
    addLoad,
    updateLoad,
    deleteLoad,
    refreshLoads: loadLoads
  };
};
