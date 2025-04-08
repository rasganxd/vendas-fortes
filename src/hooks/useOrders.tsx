
import { Order } from '@/types';
import { orderService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadOrders = async (): Promise<Order[]> => {
  try {
    return await orderService.getAll();
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    return [];
  }
};

export const useOrders = () => {
  const { orders, setOrders } = useAppContext();

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      const id = await orderService.add(order);
      const newOrder = { ...order, id };
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

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      await orderService.update(id, order);
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

  const updateOrderPaymentMethod = async (id: string, paymentMethod: string, paymentStatus: 'pending' | 'partial' | 'paid' = 'paid') => {
    try {
      await orderService.update(id, { paymentMethod, paymentStatus });
      setOrders(orders.map(o => 
        o.id === id ? { ...o, paymentMethod, paymentStatus } : o
      ));
      toast({
        title: "Forma de pagamento atualizada",
        description: "Forma de pagamento atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar forma de pagamento:", error);
      toast({
        title: "Erro ao atualizar forma de pagamento",
        description: "Houve um problema ao atualizar a forma de pagamento.",
        variant: "destructive"
      });
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      await orderService.delete(id);
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
    addOrder,
    updateOrder,
    updateOrderPaymentMethod,
    deleteOrder
  };
};
