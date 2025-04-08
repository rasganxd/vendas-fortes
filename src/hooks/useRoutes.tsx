
import { DeliveryRoute } from '@/types';
import { routeService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadRoutes = async (): Promise<DeliveryRoute[]> => {
  try {
    return await routeService.getAll();
  } catch (error) {
    console.error("Erro ao carregar rotas:", error);
    return [];
  }
};

export const useRoutes = () => {
  const { routes, setRoutes } = useAppContext();

  const addRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const id = await routeService.add(route);
      const newRoute = { ...route, id } as DeliveryRoute;
      setRoutes([...routes, newRoute]);
      toast({
        title: "Rota adicionada",
        description: "Rota adicionada com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar rota:", error);
      toast({
        title: "Erro ao adicionar rota",
        description: "Houve um problema ao adicionar a rota.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateRoute = async (id: string, route: Partial<DeliveryRoute>) => {
    try {
      await routeService.update(id, route);
      setRoutes(routes.map(r => 
        r.id === id ? { ...r, ...route } : r
      ));
      toast({
        title: "Rota atualizada",
        description: "Rota atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar rota:", error);
      toast({
        title: "Erro ao atualizar rota",
        description: "Houve um problema ao atualizar a rota.",
        variant: "destructive"
      });
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      console.log("Iniciando exclusão da rota com ID:", id);
      
      // Garantindo que o serviço de rota seja chamado corretamente
      await routeService.delete(id);
      console.log("Serviço de exclusão completado para ID:", id);
      
      // Atualizando o estado local após exclusão bem-sucedida
      setRoutes(routes.filter(r => r.id !== id));
      console.log("Estado local atualizado, rota removida:", id);
      
      toast({
        title: "Rota excluída",
        description: "Rota excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir rota:", error);
      toast({
        title: "Erro ao excluir rota",
        description: "Houve um problema ao excluir a rota.",
        variant: "destructive"
      });
      // Relançando o erro para ser tratado pelo componente que chamou
      throw error;
    }
  };

  return {
    routes,
    addRoute,
    updateRoute,
    deleteRoute
  };
};
