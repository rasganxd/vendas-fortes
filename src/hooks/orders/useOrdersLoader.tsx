
import { useEffect } from 'react';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/services/supabase/orderService';
import { Order } from '@/types';

export const useOrdersLoader = (
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  setIsLoading: React.Dispatch<React.SetStateAction<boolean>>,
  setLastRefresh: React.Dispatch<React.SetStateAction<Date>>
) => {
  // Load orders on initial render
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const loadedOrders = await orderService.getAll();
        setOrders(loadedOrders);
        setLastRefresh(new Date());
        console.log("📋 Orders loaded:", loadedOrders.length);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast({
          title: "Erro ao carregar pedidos",
          description: "Houve um problema ao carregar os pedidos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [setOrders, setIsLoading, setLastRefresh]);
};
