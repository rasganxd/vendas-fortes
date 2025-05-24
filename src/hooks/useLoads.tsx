
import { useState, useEffect } from 'react';
import { Load } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { loadService } from '@/services/supabase/loadService';
import { orderService } from '@/services/supabase/orderService';

export const useLoads = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load loads on initial render
  useEffect(() => {
    const fetchLoads = async () => {
      try {
        setIsLoading(true);
        const loadedLoads = await loadService.getAll();
        setLoads(loadedLoads);
      } catch (error) {
        console.error("Error loading loads:", error);
        toast({
          title: "Erro ao carregar cargas",
          description: "Houve um problema ao carregar as cargas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoads();
  }, []);

  // Add a new load
  const addLoad = async (load: Omit<Load, 'id'>) => {
    try {
      const id = await loadService.add(load);
      
      const newLoad: Load = {
        ...load,
        id,
        createdAt: load.createdAt || new Date(),
        updatedAt: load.updatedAt || new Date()
      };
      
      setLoads([...loads, newLoad]);
      
      toast({
        title: "Carga adicionada",
        description: "Carga adicionada com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar carga:", error);
      toast({
        title: "Erro ao adicionar carga",
        description: "Houve um problema ao adicionar a carga.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing load
  const updateLoad = async (id: string, load: Partial<Load>) => {
    try {
      await loadService.update(id, load);
      
      // Update local state
      setLoads(loads.map(l => 
        l.id === id ? { ...l, ...load } : l
      ));
      
      toast({
        title: "Carga atualizada",
        description: "Carga atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar carga:", error);
      toast({
        title: "Erro ao atualizar carga",
        description: "Houve um problema ao atualizar a carga.",
        variant: "destructive"
      });
    }
  };

  // Delete a load
  const deleteLoad = async (id: string): Promise<void> => {
    try {
      await loadService.delete(id);
      
      // Update local state
      setLoads(loads.filter(l => l.id !== id));
      
      toast({
        title: "Carga excluída",
        description: "Carga excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir carga:", error);
      toast({
        title: "Erro ao excluir carga",
        description: "Houve um problema ao excluir a carga.",
        variant: "destructive"
      });
    }
  };

  return {
    loads,
    isLoading,
    addLoad,
    updateLoad,
    deleteLoad,
    setLoads
  };
};
