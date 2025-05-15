
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/services/supabase/orderService';
import { transformOrderData, transformArray } from '@/utils/dataTransformers';
import { orderLocalService } from '@/services/local/orderLocalService';

// Load orders with improved caching strategy
export const loadOrders = async (forceRefresh = false): Promise<Order[]> => {
  try {
    console.log("Loading orders from local storage");
    const orders = await orderLocalService.getAll();
    console.log(`Loaded ${orders.length} orders from local storage`);
    return orders;
  } catch (error) {
    console.error("Error loading orders:", error);
    throw error;
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const loadedOrders = await loadOrders();
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

  const getOrderById = async (id: string): Promise<Order | null> => {
    try {
      console.log(`Getting order by ID: ${id}`);
      const order = await orderLocalService.getById(id);
      if (!order) {
        console.warn(`Order with ID ${id} not found`);
      }
      return order;
    } catch (error) {
      console.error(`Error getting order by ID ${id}:`, error);
      toast({
        title: "Erro ao carregar pedido",
        description: `Não foi possível carregar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return null;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      setIsProcessing(true);
      const id = await orderService.add(order);
      const newOrder = { ...order, id } as Order;
      setOrders(prev => [...prev, newOrder]);
      toast({
        title: "Pedido adicionado",
        description: "Pedido adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error adding order:", error);
      toast({
        title: "Erro ao adicionar pedido",
        description: "Houve um problema ao adicionar o pedido.",
        variant: "destructive"
      });
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      setIsProcessing(true);
      await orderService.update(id, order);
      const updatedOrders = orders.map(o =>
        o.id === id ? { ...o, ...order } : o
      );
      setOrders(updatedOrders);
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: "Houve um problema ao atualizar o pedido.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      setIsProcessing(true);
      await orderService.delete(id);
      const updatedOrders = orders.filter(o => o.id !== id);
      setOrders(updatedOrders);
      toast({
        title: "Pedido excluído",
        description: "Pedido excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        title: "Erro ao excluir pedido",
        description: "Houve um problema ao excluir o pedido.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    orders,
    addOrder,
    updateOrder,
    deleteOrder,
    isLoading,
    isProcessing,
    setOrders,
    getOrderById
  };
};
