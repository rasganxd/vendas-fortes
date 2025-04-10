
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

  const getOrderById = (id: string): Order | undefined => {
    return orders.find(order => order.id === id);
  };

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      console.log("Adding order to database:", order);
      const id = await orderService.add(order);
      console.log("Order added successfully, received ID:", id);
      
      if (!id) {
        throw new Error("Failed to add order: No ID returned");
      }
      
      const newOrder = { ...order, id } as Order;
      setOrders([...orders, newOrder]);
      
      console.log("State updated with new order");
      
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
      console.log("Updating order with ID:", id);
      console.log("New order data:", order);
      
      // Ensure we're sending the complete order items array to Firebase
      await orderService.update(id, order);
      
      // Update the order in the local state
      setOrders(orders.map(o => 
        o.id === id ? { ...o, ...order } : o
      ));
      
      console.log("Order updated successfully");
      
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
    getOrderById,
    addOrder,
    updateOrder,
    updateOrderPaymentMethod,
    deleteOrder
  };
};
