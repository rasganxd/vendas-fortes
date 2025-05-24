
import { useState, useEffect } from 'react';
import { DeliveryRoute } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { deliveryRouteService } from '@/services/supabase/deliveryRouteService';

export const useDeliveryRoutes = () => {
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load delivery routes on initial render
  useEffect(() => {
    const fetchDeliveryRoutes = async () => {
      try {
        setIsLoading(true);
        const loadedRoutes = await deliveryRouteService.getAll();
        setDeliveryRoutes(loadedRoutes);
      } catch (error) {
        console.error("Error loading delivery routes:", error);
        toast({
          title: "Erro ao carregar rotas de entrega",
          description: "Houve um problema ao carregar as rotas de entrega.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryRoutes();
  }, []);

  // Add a new delivery route
  const addDeliveryRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const id = await deliveryRouteService.add(route);
      
      const newRoute: DeliveryRoute = {
        ...route,
        id,
        createdAt: route.createdAt || new Date(),
        updatedAt: route.updatedAt || new Date()
      };
      
      setDeliveryRoutes([...deliveryRoutes, newRoute]);
      
      toast({
        title: "Rota de entrega adicionada",
        description: "Rota de entrega adicionada com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar rota de entrega:", error);
      toast({
        title: "Erro ao adicionar rota de entrega",
        description: "Houve um problema ao adicionar a rota de entrega.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing delivery route
  const updateDeliveryRoute = async (id: string, route: Partial<DeliveryRoute>) => {
    try {
      await deliveryRouteService.update(id, route);
      
      // Update local state
      setDeliveryRoutes(deliveryRoutes.map(dr => 
        dr.id === id ? { ...dr, ...route } : dr
      ));
      
      toast({
        title: "Rota de entrega atualizada",
        description: "Rota de entrega atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar rota de entrega:", error);
      toast({
        title: "Erro ao atualizar rota de entrega",
        description: "Houve um problema ao atualizar a rota de entrega.",
        variant: "destructive"
      });
    }
  };

  // Delete a delivery route
  const deleteDeliveryRoute = async (id: string): Promise<void> => {
    try {
      await deliveryRouteService.delete(id);
      
      // Update local state
      setDeliveryRoutes(deliveryRoutes.filter(dr => dr.id !== id));
      
      toast({
        title: "Rota de entrega excluída",
        description: "Rota de entrega excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir rota de entrega:", error);
      toast({
        title: "Erro ao excluir rota de entrega",
        description: "Houve um problema ao excluir a rota de entrega.",
        variant: "destructive"
      });
    }
  };

  return {
    deliveryRoutes,
    isLoading,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,
    setDeliveryRoutes
  };
};
