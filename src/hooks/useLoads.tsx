
import { Load } from '@/types';
import { loadService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadLoads = async (): Promise<Load[]> => {
  try {
    return await loadService.getAll();
  } catch (error) {
    console.error("Erro ao carregar carregamentos:", error);
    return [];
  }
};

export const useLoads = () => {
  const { loads, setLoads } = useAppContext();

  const addLoad = async (load: Omit<Load, 'id'>) => {
    try {
      const id = await loadService.add(load);
      const newLoad = { ...load, id } as Load;
      setLoads([...loads, newLoad]);
      toast({
        title: "Carregamento adicionado",
        description: "Carregamento adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar carregamento:", error);
      toast({
        title: "Erro ao adicionar carregamento",
        description: "Houve um problema ao adicionar o carregamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateLoad = async (id: string, load: Partial<Load>) => {
    try {
      await loadService.update(id, load);
      setLoads(loads.map(l => 
        l.id === id ? { ...l, ...load } : l
      ));
      toast({
        title: "Carregamento atualizado",
        description: "Carregamento atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar carregamento:", error);
      toast({
        title: "Erro ao atualizar carregamento",
        description: "Houve um problema ao atualizar o carregamento.",
        variant: "destructive"
      });
    }
  };

  const deleteLoad = async (id: string) => {
    try {
      await loadService.delete(id);
      setLoads(loads.filter(l => l.id !== id));
      toast({
        title: "Carregamento excluído",
        description: "Carregamento excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir carregamento:", error);
      toast({
        title: "Erro ao excluir carregamento",
        description: "Houve um problema ao excluir o carregamento.",
        variant: "destructive"
      });
    }
  };

  return {
    loads,
    addLoad,
    updateLoad,
    deleteLoad
  };
};
