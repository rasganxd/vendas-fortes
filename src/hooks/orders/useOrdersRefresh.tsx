
import { useCallback } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services/supabase/orderService';
import { toast } from '@/components/ui/use-toast';

export const useOrdersRefresh = (
  setOrders: (orders: Order[]) => void,
  setLastRefresh: (date: Date) => void,
  isOrderBeingEdited: (id: string) => boolean
) => {
  const refreshOrders = useCallback(async (silent = false) => {
    try {
      if (!silent) {
        console.log('🔄 Refreshing orders from Supabase...');
      }
      
      const fetchedOrders = await orderService.getAll();
      
      if (!silent) {
        console.log(`✅ Refreshed ${fetchedOrders.length} orders from Supabase`);
      }
      
      // Only update orders that are not currently being edited
      const updatedOrders = fetchedOrders.filter(order => !isOrderBeingEdited(order.id));
      
      if (updatedOrders.length !== fetchedOrders.length && !silent) {
        console.log(`⚠️ Skipped ${fetchedOrders.length - updatedOrders.length} orders being edited`);
      }
      
      setOrders(fetchedOrders); // Always set all orders, let the edit state handle conflicts
      setLastRefresh(new Date());
      
      if (!silent) {
        toast({
          title: 'Pedidos atualizados',
          description: `${fetchedOrders.length} pedidos carregados com sucesso!`,
        });
      }
      
      return fetchedOrders;
    } catch (error) {
      console.error('❌ Error refreshing orders:', error);
      
      if (!silent) {
        toast({
          title: 'Erro ao atualizar pedidos',
          description: 'Não foi possível carregar os pedidos atualizados.',
          variant: 'destructive',
        });
      }
      
      return [];
    }
  }, [setOrders, setLastRefresh, isOrderBeingEdited]);

  return { refreshOrders };
};
