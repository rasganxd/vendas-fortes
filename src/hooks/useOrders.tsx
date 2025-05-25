
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/services/supabase/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [lastRefresh, setLastRefresh] = useState<Date>(new Date());

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
  }, []);

  // Listen for order updates
  useEffect(() => {
    const handleOrderUpdated = (event: CustomEvent) => {
      console.log("🔄 Order updated event received:", event.detail);
      refreshOrders();
    };

    const handleOrderItemsUpdated = (event: CustomEvent) => {
      console.log("🔄 Order items updated event received:", event.detail);
      // Refresh orders after a short delay to allow for database updates
      setTimeout(() => {
        refreshOrders();
      }, 1000);
    };

    window.addEventListener('orderUpdated', handleOrderUpdated as EventListener);
    window.addEventListener('orderItemsUpdated', handleOrderItemsUpdated as EventListener);

    return () => {
      window.removeEventListener('orderUpdated', handleOrderUpdated as EventListener);
      window.removeEventListener('orderItemsUpdated', handleOrderItemsUpdated as EventListener);
    };
  }, []);

  // Refresh orders from server
  const refreshOrders = async () => {
    try {
      console.log("🔄 Refreshing orders from server...");
      const loadedOrders = await orderService.getAll();
      setOrders(loadedOrders);
      setLastRefresh(new Date());
      console.log("✅ Orders refreshed:", loadedOrders.length);
    } catch (error) {
      console.error("Error refreshing orders:", error);
    }
  };

  // Generate next order code
  const generateNextCode = async (): Promise<number> => {
    try {
      return await orderService.generateNextCode();
    } catch (error) {
      console.error('Error generating order code:', error);
      return orders.length > 0 ? Math.max(...orders.map(o => o.code || 0)) + 1 : 1;
    }
  };

  // Get order by ID with caching
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      // First check if order is in local state
      const localOrder = orders.find(order => order.id === id);
      if (localOrder && (new Date().getTime() - lastRefresh.getTime()) < 30000) { // 30 seconds cache
        console.log("📋 Using cached order:", id);
        return localOrder;
      }
      
      // If not found locally or cache is old, fetch from service
      console.log("🔍 Fetching order from server:", id);
      const serverOrder = await orderService.getById(id);
      
      // Update local cache if found
      if (serverOrder) {
        setOrders(prevOrders => {
          const existingIndex = prevOrders.findIndex(o => o.id === id);
          if (existingIndex !== -1) {
            const updated = [...prevOrders];
            updated[existingIndex] = serverOrder;
            return updated;
          } else {
            return [...prevOrders, serverOrder];
          }
        });
      }
      
      return serverOrder;
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return null;
    }
  };

  // Add a new order
  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      // Generate order code if not provided
      const orderCode = order.code || await generateNextCode();
      
      const orderWithCode = {
        ...order,
        code: orderCode
      };
      
      const id = await orderService.addWithItems(orderWithCode);
      
      const newOrder: Order = {
        ...orderWithCode,
        id,
        createdAt: order.createdAt || new Date(),
        updatedAt: order.updatedAt || new Date()
      };
      
      // Update local state immediately
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
      // Dispatch global event
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { action: 'add', orderId: id } 
      }));
      
      toast({
        title: "Pedido adicionado",
        description: `Pedido #${orderCode} adicionado com sucesso!`
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar pedido:", error);
      toast({
        title: "Erro ao adicionar pedido",
        description: "Houve um problema ao adicionar o pedido.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing order
  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      await orderService.update(id, order);
      
      // Update local state immediately
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === id ? { ...o, ...order, updatedAt: new Date() } : o
        )
      );
      
      // Dispatch global event
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { action: 'update', orderId: id } 
      }));
      
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
      
      // Refresh after a delay to ensure consistency
      setTimeout(() => {
        refreshOrders();
      }, 2000);
      
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: "Houve um problema ao atualizar o pedido.",
        variant: "destructive"
      });
    }
  };

  // Delete an order
  const deleteOrder = async (id: string): Promise<void> => {
    try {
      await orderService.delete(id);
      
      // Update local state immediately
      setOrders(prevOrders => prevOrders.filter(o => o.id !== id));
      
      // Dispatch global event
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { action: 'delete', orderId: id } 
      }));
      
      toast({
        title: "Pedido excluído",
        description: "Pedido excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir pedido:", error);
      toast({
        title: "Erro ao excluir pedido",
        description: "Houve um problema ao excluir o pedido.",
        variant: "destructive"
      });
    }
  };

  return {
    orders,
    isLoading,
    addOrder,
    updateOrder,
    deleteOrder,
    setOrders,
    generateNextCode,
    getOrderById,
    refreshOrders,
    lastRefresh
  };
};

// Export function for backward compatibility
export const loadOrders = async (): Promise<Order[]> => {
  try {
    return await orderService.getAll();
  } catch (error) {
    console.error('Error loading orders:', error);
    return [];
  }
};
