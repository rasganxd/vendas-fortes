
import { DeliveryRoute } from '@/types';
import { useState, useEffect } from 'react';
import { deliveryRouteService } from '@/services/firebase/deliveryRouteService';
import { toast } from '@/components/ui/use-toast';
import { ensureDate } from '@/lib/date-utils';

export const loadRoutes = async (): Promise<DeliveryRoute[]> => {
  try {
    return await deliveryRouteService.getAll();
  } catch (error) {
    console.error("Erro ao carregar rotas:", error);
    return [];
  }
};

export const useRoutes = () => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize routes when component mounts
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const loadedRoutes = await loadRoutes();
        setRoutes(loadedRoutes);
      } catch (error) {
        console.error("Error loading routes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const addRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const id = await deliveryRouteService.add(route);
      
      // Create the new route object with the ID
      const newRoute: DeliveryRoute = {
        ...route,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      // Update local state
      setRoutes([...routes, newRoute]);
      toast({
        title: "Rota adicionada",
        description: "Rota adicionada com sucesso!"
      });
      return newRoute.id;
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

  const updateRoute = async (id: string, routeUpdate: Partial<DeliveryRoute>): Promise<void> => {
    try {
      await deliveryRouteService.update(id, routeUpdate);
      
      // Update local state
      setRoutes(routes.map(r => 
        r.id === id ? { ...r, ...routeUpdate, updatedAt: new Date() } : r
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

  const deleteRoute = async (id: string): Promise<void> => {
    try {
      await deliveryRouteService.delete(id);
      
      // Update local state
      setRoutes(routes.filter(r => r.id !== id));
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
    }
  };

  return {
    routes,
    isLoading,
    addRoute,
    updateRoute,
    deleteRoute,
    setRoutes
  };
};
