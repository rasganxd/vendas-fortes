import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { orderService } from '@/services/firebase/orderService';
import { useConnection } from '@/context/providers/ConnectionProvider';

// Load orders directly from Firebase
export const loadOrders = async (forceRefresh = false): Promise<Order[]> => {
  try {
    console.log("Loading orders from Firebase");
    const orders = await orderService.getAll();
    console.log(`Loaded ${orders.length} orders from Firebase`);
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
  const { connectionStatus } = useConnection();

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const loadedOrders = await loadOrders();
        setOrders(loadedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
        toast.error("Erro ao carregar pedidos", {
          description: "Houve um problema ao carregar os pedidos."
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
      const order = await orderService.getById(id);
      if (!order) {
        console.warn(`Order with ID ${id} not found`);
      }
      return order;
    } catch (error) {
      console.error(`Error getting order by ID ${id}:`, error);
      toast.error("Erro ao carregar pedido", {
        description: `Não foi possível carregar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return null;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      setIsProcessing(true);
      console.log("Connection status when adding order:", connectionStatus);
      
      // Show warning if offline but proceed with adding order to local storage
      if (connectionStatus === 'offline') {
        toast.warning("Modo offline", {
          description: "O pedido será sincronizado quando estiver online"
        });
      }
      
      // Generate a new order code if not provided
      if (!order.code) {
        const nextCode = await orderService.generateNextOrderCode();
        order = { ...order, code: nextCode };
      }
      
      const id = await orderService.add(order);
      const newOrder = { ...order, id } as Order;
      setOrders(prev => [...prev, newOrder]);
      
      toast("Pedido adicionado", {
        description: "Pedido adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error adding order:", error);
      toast.error("Erro ao adicionar pedido", {
        description: `Houve um problema ao adicionar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      setIsProcessing(true);
      console.log("Connection status when updating order:", connectionStatus);
      
      // Show warning if offline but proceed with updating order in local storage
      if (connectionStatus === 'offline') {
        toast.warning("Modo offline", {
          description: "As alterações serão sincronizadas quando estiver online"
        });
      }
      
      await orderService.update(id, order);
      const updatedOrders = orders.map(o =>
        o.id === id ? { ...o, ...order } : o
      );
      setOrders(updatedOrders);
      
      toast("Pedido atualizado", {
        description: "Pedido atualizado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error updating order:", error);
      toast.error("Erro ao atualizar pedido", {
        description: `Houve um problema ao atualizar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return "";
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
      toast("Pedido excluído", {
        description: "Pedido excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast.error("Erro ao excluir pedido", {
        description: "Houve um problema ao excluir o pedido."
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
