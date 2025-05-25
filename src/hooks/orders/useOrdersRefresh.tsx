
import { orderService } from '@/services/supabase/orderService';
import { Order } from '@/types';

export const useOrdersRefresh = (
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  setLastRefresh: React.Dispatch<React.SetStateAction<Date>>,
  isOrderBeingEdited: (orderId: string) => boolean
) => {
  const refreshOrders = async () => {
    try {
      console.log("🔄 Refreshing orders from server...");
      const loadedOrders = await orderService.getAll();
      
      setOrders(prevOrders => {
        return loadedOrders.map(serverOrder => {
          if (isOrderBeingEdited(serverOrder.id)) {
            const localOrder = prevOrders.find(o => o.id === serverOrder.id);
            console.log("⚠️ Preserving local state for edited order:", serverOrder.id);
            return localOrder || serverOrder;
          }
          return serverOrder;
        });
      });
      
      setLastRefresh(new Date());
      console.log("✅ Orders refreshed:", loadedOrders.length);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  return { refreshOrders };
};
