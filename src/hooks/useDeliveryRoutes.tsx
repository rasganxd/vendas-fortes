
import { useState, useEffect } from 'react';
import { DeliveryRoute } from '@/types';
import { deliveryRouteService } from '@/services/supabase/deliveryRouteService';
import { toast } from '@/components/ui/use-toast';

export const useDeliveryRoutes = () => {
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchDeliveryRoutes = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching delivery routes from Supabase");
        const fetchedRoutes = await deliveryRouteService.getAll();
        console.log(`Loaded ${fetchedRoutes.length} delivery routes from Supabase`);
        setDeliveryRoutes(fetchedRoutes);
      } catch (error) {
        console.error('Error fetching delivery routes:', error);
        setDeliveryRoutes([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchDeliveryRoutes();
  }, []);

  const addDeliveryRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const id = await deliveryRouteService.add(route);
      
      const newRoute = { ...route, id } as DeliveryRoute;
      setDeliveryRoutes((prev) => [...prev, newRoute]);
      
      toast({
        title: 'Rota adicionada',
        description: 'Rota de entrega adicionada com sucesso!',
      });
      
      return id;
    } catch (error) {
      console.error('Error adding delivery route:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a rota de entrega.',
        variant: 'destructive',
      });
      return "";
    }
  };

  const updateDeliveryRoute = async (id: string, route: Partial<DeliveryRoute>) => {
    try {
      await deliveryRouteService.update(id, route);
      
      setDeliveryRoutes((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...route } : item))
      );
      
      toast({
        title: 'Rota atualizada',
        description: 'Rota de entrega atualizada com sucesso!',
      });
    } catch (error) {
      console.error('Error updating delivery route:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a rota de entrega.',
        variant: 'destructive',
      });
    }
  };

  const deleteDeliveryRoute = async (id: string) => {
    try {
      await deliveryRouteService.delete(id);
      
      setDeliveryRoutes((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: 'Rota excluída',
        description: 'Rota de entrega excluída com sucesso!',
      });
    } catch (error) {
      console.error('Error deleting delivery route:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a rota de entrega.',
        variant: 'destructive',
      });
    }
  };

  return {
    deliveryRoutes,
    isLoading,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute,
  };
};
