
import { DeliveryRoute } from '@/types';
import { useState, useEffect } from 'react';
import { routeService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';

export const loadRoutes = async (): Promise<DeliveryRoute[]> => {
  try {
    return await routeService.getAll();
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
      // Add to Firebase
      const id = await routeService.add(route);
      const newRoute = { ...route, id } as DeliveryRoute;
      
      // Update local state
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

  const updateRoute = async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
    try {
      // Update in Firebase
      await routeService.update(id, route);
      
      // Update local state
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

  const deleteRoute = async (id: string): Promise<void> => {
    try {
      // Delete from Firebase
      await routeService.delete(id);
      
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
