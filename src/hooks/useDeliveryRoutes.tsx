
import { useState, useEffect } from 'react';
import { DeliveryRoute } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { deliveryRouteService } from '@/services/firebase/deliveryRouteService';
import { ensureDate } from '@/lib/date-utils';

export const useDeliveryRoutes = () => {
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDeliveryRoutes = async () => {
      try {
        setIsLoading(true);
        
        const routes = await deliveryRouteService.getAll();
        setDeliveryRoutes(routes);
        
      } catch (error) {
        console.error("Error loading delivery routes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeliveryRoutes();
  }, []);
  
  const addDeliveryRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const id = await deliveryRouteService.add(route);
      
      const newRoute: DeliveryRoute = {
        ...route,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setDeliveryRoutes([...deliveryRoutes, newRoute]);
      
      toast({
        title: "Rota adicionada",
        description: "Rota adicionada com sucesso!"
      });
      
      return newRoute.id;
    } catch (error) {
      console.error("Error adding delivery route:", error);
      toast({
        title: "Erro ao adicionar rota",
        description: "Houve um problema ao adicionar a rota.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateDeliveryRoute = async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
    try {
      await deliveryRouteService.update(id, route);
      
      setDeliveryRoutes(deliveryRoutes.map(r => 
        r.id === id ? { ...r, ...route, updatedAt: new Date() } : r
      ));
      
      toast({
        title: "Rota atualizada",
        description: "Rota atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Error updating delivery route:", error);
      toast({
        title: "Erro ao atualizar rota",
        description: "Houve um problema ao atualizar a rota.",
        variant: "destructive"
      });
    }
  };
  
  const deleteDeliveryRoute = async (id: string): Promise<void> => {
    try {
      await deliveryRouteService.delete(id);
      
      setDeliveryRoutes(deliveryRoutes.filter(r => r.id !== id));
      
      toast({
        title: "Rota excluída",
        description: "Rota excluída com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting delivery route:", error);
      toast({
        title: "Erro ao excluir rota",
        description: "Houve um problema ao excluir a rota.",
        variant: "destructive"
      });
    }
  };
  
  return {
    deliveryRoutes,
    isLoading,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  };
};
