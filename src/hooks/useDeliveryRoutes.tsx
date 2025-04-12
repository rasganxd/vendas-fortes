
import { useState, useEffect } from 'react';
import { DeliveryRoute } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useDeliveryRoutes = () => {
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Initialize with empty data or fetch from server
    setDeliveryRoutes([]);
    setIsLoading(false);
  }, []);

  const addDeliveryRoute = async (deliveryRoute: Omit<DeliveryRoute, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 11);
      const newDeliveryRoute = { ...deliveryRoute, id: newId };
      setDeliveryRoutes([...deliveryRoutes, newDeliveryRoute]);
      toast({
        title: "Rota adicionada",
        description: "Rota de entrega adicionada com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar rota de entrega:", error);
      toast({
        title: "Erro ao adicionar rota",
        description: "Houve um problema ao adicionar a rota de entrega.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateDeliveryRoute = async (id: string, deliveryRoute: Partial<DeliveryRoute>) => {
    try {
      setDeliveryRoutes(deliveryRoutes.map(dr => 
        dr.id === id ? { ...dr, ...deliveryRoute } : dr
      ));
      toast({
        title: "Rota atualizada",
        description: "Rota de entrega atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar rota de entrega:", error);
      toast({
        title: "Erro ao atualizar rota",
        description: "Houve um problema ao atualizar a rota de entrega.",
        variant: "destructive"
      });
    }
  };

  const deleteDeliveryRoute = async (id: string) => {
    try {
      setDeliveryRoutes(deliveryRoutes.filter(dr => dr.id !== id));
      toast({
        title: "Rota excluída",
        description: "Rota de entrega excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir rota de entrega:", error);
      toast({
        title: "Erro ao excluir rota",
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
    deleteDeliveryRoute
  };
};
