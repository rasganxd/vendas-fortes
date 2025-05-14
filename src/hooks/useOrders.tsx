import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services/supabase/orderService';
import { toast } from '@/components/ui/use-toast';
import { transformOrderData, transformArray } from '@/utils/dataTransformers';
import { orderItemService } from '@/services/supabase/orderItemService';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoading(true);
        const data = await orderService.getAll();
        const transformedOrders = transformArray(data, transformOrderData) as Order[];
        setOrders(transformedOrders);
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
      const orderData = await orderService.getById(id);
      if (orderData) {
        return transformOrderData(orderData);
      }
      return null;
    } catch (error) {
      console.error("Error fetching order by ID:", error);
      toast({
        title: "Erro ao carregar pedido",
        description: "Houve um problema ao carregar o pedido.",
        variant: "destructive"
      });
      return null;
    }
  };

  const addOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
    try {
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
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>): Promise<void> => {
    try {
      await orderService.update(id, order);
      setOrders(prev =>
        prev.map(o => (o.id === id ? { ...o, ...order } : o))
      );
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: "Houve um problema ao atualizar o pedido.",
        variant: "destructive"
      });
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      await orderService.delete(id);
      setOrders(prev => prev.filter(o => o.id !== id));
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
    }
  };

  return {
    orders,
    isLoading,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    setOrders
  };
};
