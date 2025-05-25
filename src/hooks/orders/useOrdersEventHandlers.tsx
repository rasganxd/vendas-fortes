
import { useEffect } from 'react';
import { Order } from '@/types';

export const useOrdersEventHandlers = (
  isOrderBeingEdited: (orderId: string) => boolean,
  refreshOrders: () => Promise<void>
) => {
  useEffect(() => {
    const handleOrderUpdated = (event: CustomEvent) => {
      console.log("🔄 Order updated event received:", event.detail);
      const { orderId } = event.detail;
      
      if (!isOrderBeingEdited(orderId)) {
        refreshOrders();
      } else {
        console.log("⚠️ Skipping refresh for order being edited:", orderId);
      }
    };

    const handleOrderItemsUpdated = (event: CustomEvent) => {
      console.log("🔄 Order items updated event received:", event.detail);
      const { orderId } = event.detail;
      
      if (!isOrderBeingEdited(orderId)) {
        setTimeout(() => {
          refreshOrders();
        }, 1000);
      } else {
        console.log("⚠️ Skipping refresh for order being edited:", orderId);
      }
    };

    window.addEventListener('orderUpdated', handleOrderUpdated as EventListener);
    window.addEventListener('orderItemsUpdated', handleOrderItemsUpdated as EventListener);

    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdated as EventListener);
      window.removeEventListener('orderItemsUpdated', handleOrderItemsUpdated as EventListener);
    };
  }, [isOrderBeingEdited, refreshOrders]);
};
