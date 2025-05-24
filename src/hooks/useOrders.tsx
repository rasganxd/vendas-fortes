
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/services/supabase/orderService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load orders on initial render
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const loadedOrders = await orderService.getAll();
        setOrders(loadedOrders);
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

  // Generate next order code
  const generateNextCode = async (): Promise<number> => {
    try {
      return await orderService.generateNextCode();
    } catch (error) {
      console.error('Error generating order code:', error);
      return orders.length > 0 ? Math.max(...orders.map(o => o.code || 0)) + 1 : 1;
    }
  };

  // Get order by ID
  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      // First check if order is in local state
      const localOrder = orders.find(order => order.id === id);
      if (localOrder) {
        return localOrder;
      }
      
      // If not found locally, fetch from service
      return await orderService.getById(id);
    } catch (error) {
      console.error('Error getting order by ID:', error);
      return null;
    }
  };

  // Add a new order
  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const id = await orderService.add(order);
      
      const newOrder: Order = {
        ...order,
        id,
        createdAt: order.createdAt || new Date(),
        updatedAt: order.updatedAt || new Date()
      };
      
      setOrders([...orders, newOrder]);
      
      toast({
        title: "Pedido adicionado",
        description: "Pedido adicionado com sucesso!"
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
      
      // Update local state
      setOrders(orders.map(o => 
        o.id === id ? { ...o, ...order } : o
      ));
      
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
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
      
      // Update local state
      setOrders(orders.filter(o => o.id !== id));
      
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
    getOrderById
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
