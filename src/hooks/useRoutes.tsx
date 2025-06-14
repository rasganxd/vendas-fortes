
import { useState, useEffect } from 'react';
import { DeliveryRoute } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { deliveryRouteService } from '@/services/supabase/deliveryRouteService';

export const useRoutes = () => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadRoutes = async () => {
      try {
        setIsLoading(true);
        const data = await deliveryRouteService.getAll();
        setRoutes(data);
      } catch (error) {
        console.error('Error loading routes:', error);
        toast({
          title: "Erro ao carregar rotas",
          description: "Houve um problema ao carregar as rotas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadRoutes();
  }, []);

  const addRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const id = await deliveryRouteService.add(route);
      const newRoute = { ...route, id };
      setRoutes([...routes, newRoute]);
      
      toast({
        title: "Rota adicionada",
        description: "Rota adicionada com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error('Error adding route:', error);
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
      await deliveryRouteService.update(id, route);
      setRoutes(routes.map(r => r.id === id ? { ...r, ...route } : r));
      
      toast({
        title: "Rota atualizada",
        description: "Rota atualizada com sucesso!"
      });
    } catch (error) {
      console.error('Error updating route:', error);
      toast({
        title: "Erro ao atualizar rota",
        description: "Houve um problema ao atualizar a rota.",
        variant: "destructive"
      });
    }
  };

  const deleteRoute = async (id: string) => {
    try {
      await deliveryRouteService.delete(id);
      setRoutes(routes.filter(r => r.id !== id));
      
      toast({
        title: "Rota excluída",
        description: "Rota excluída com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting route:', error);
      toast({
        title: "Erro ao excluir rota",
        description: "Houve um problema ao excluir a rota.",
        variant: "destructive"
      });
    }
  };

  const generateRouteUpdate = async (routeId: string, salesRepId: string) => {
    try {
      const customersCount = await deliveryRouteService.generateRouteUpdate(routeId, salesRepId);
      
      // Refresh routes to get updated data
      const updatedRoutes = await deliveryRouteService.getAll();
      setRoutes(updatedRoutes);
      
      toast({
        title: "Atualização gerada",
        description: `${customersCount} clientes foram sincronizados com a rota.`
      });
      
      return customersCount;
    } catch (error) {
      console.error('Error generating route update:', error);
      toast({
        title: "Erro ao gerar atualização",
        description: "Houve um problema ao gerar a atualização da rota.",
        variant: "destructive"
      });
      return 0;
    }
  };

  const getRouteWithCustomers = async (routeId: string) => {
    try {
      const routeWithCustomers = await deliveryRouteService.getRouteWithCustomers(routeId);
      return routeWithCustomers;
    } catch (error) {
      console.error('Error getting route with customers:', error);
      toast({
        title: "Erro ao carregar clientes da rota",
        description: "Houve um problema ao carregar os clientes da rota.",
        variant: "destructive"
      });
      return null;
    }
  };

  return {
    routes,
    isLoading,
    addRoute,
    updateRoute,
    deleteRoute,
    setRoutes,
    generateRouteUpdate,
    getRouteWithCustomers
  };
};
