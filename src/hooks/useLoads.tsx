
import { useState, useEffect, useCallback } from 'react';
import { Load } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { loadService } from '@/services/firebase/loadService';

export const useLoads = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load data from Firebase
  useEffect(() => {
    const fetchLoads = async () => {
      try {
        setIsLoading(true);
        const loadedLoads = await loadService.getAll();
        setLoads(loadedLoads);
      } catch (error) {
        console.error("Error loading loads:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar cargas",
          description: "Não foi possível carregar as cargas."
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoads();
  }, []);

  // Get load by ID with better error handling
  const getLoadById = useCallback(async (id: string): Promise<Load | null> => {
    if (!id) {
      console.error("Invalid load ID provided");
      return null;
    }

    try {
      return await loadService.getById(id);
    } catch (error) {
      console.error(`Error getting load by ID ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar carga",
        description: `Não foi possível carregar a carga: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return null;
    }
  }, []);

  // Add a new load
  const addLoad = async (load: Omit<Load, 'id'>): Promise<string> => {
    try {
      setIsProcessing(true);
      
      // Generate a new load code if not provided
      if (!load.code) {
        const nextCode = await loadService.generateNextCode();
        load = { ...load, code: nextCode };
      }
      
      const id = await loadService.add(load);
      const newLoad = { ...load, id } as Load;
      
      setLoads(prev => [...prev, newLoad]);
      
      toast({
        title: "Carga adicionada",
        description: "Carga adicionada com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Error adding load:", error);
      toast({
        variant: "destructive",
        title: "Erro ao adicionar carga",
        description: `Houve um problema ao adicionar a carga: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  // Update an existing load
  const updateLoad = async (id: string, load: Partial<Load>): Promise<void> => {
    try {
      setIsProcessing(true);
      
      await loadService.update(id, load);
      
      setLoads(prev => 
        prev.map(l => l.id === id ? { ...l, ...load } : l)
      );
      
      toast({
        title: "Carga atualizada",
        description: "Carga atualizada com sucesso!"
      });
    } catch (error) {
      console.error(`Error updating load ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar carga",
        description: `Houve um problema ao atualizar a carga: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete a load
  const deleteLoad = async (id: string): Promise<void> => {
    try {
      setIsProcessing(true);
      
      await loadService.delete(id);
      
      setLoads(prev => prev.filter(l => l.id !== id));
      
      toast({
        title: "Carga excluída",
        description: "Carga excluída com sucesso!"
      });
    } catch (error) {
      console.error(`Error deleting load ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir carga",
        description: `Houve um problema ao excluir a carga: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Toggle lock status of a load
  const toggleLoadLock = async (id: string): Promise<void> => {
    try {
      const load = loads.find(l => l.id === id);
      if (!load) {
        throw new Error("Carga não encontrada");
      }

      const newLockedStatus = !load.locked;
      await updateLoad(id, { locked: newLockedStatus });
      
      toast({
        title: newLockedStatus ? "Carga bloqueada" : "Carga desbloqueada",
        description: newLockedStatus 
          ? "A carga foi bloqueada para edição" 
          : "A carga foi desbloqueada para edição"
      });
    } catch (error) {
      console.error(`Error toggling lock status for load ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao alterar bloqueio",
        description: "Não foi possível alterar o status de bloqueio da carga."
      });
    }
  };

  return {
    loads,
    setLoads,
    isLoading,
    isProcessing,
    getLoadById,
    addLoad,
    updateLoad,
    deleteLoad,
    toggleLoadLock
  };
};
