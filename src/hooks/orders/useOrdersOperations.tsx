
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/services/supabase/orderService';
import { Order } from '@/types';

export const useOrdersOperations = (
  setOrders: React.Dispatch<React.SetStateAction<Order[]>>,
  unmarkOrderAsBeingEdited: (orderId: string) => void,
  refreshOrders: () => Promise<void>
) => {
  // Generate next order code
  const generateNextCode = async (): Promise<number> => {
    try {
      return await orderService.generateNextCode();
    } catch (error) {
      console.error('Error generating order code:', error);
      return 1;
    }
  };

  // Add a new order
  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
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
      
      setOrders(prevOrders => [...prevOrders, newOrder]);
      
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

  // Update an existing order - now returns Promise<string>
  const updateOrder = async (id: string, order: Partial<Order>): Promise<string> => {
    try {
      await orderService.update(id, order);
      
      setOrders(prevOrders => 
        prevOrders.map(o => 
          o.id === id ? { ...o, ...order, updatedAt: new Date() } : o
        )
      );
      
      unmarkOrderAsBeingEdited(id);
      
      window.dispatchEvent(new CustomEvent('orderUpdated', { 
        detail: { action: 'update', orderId: id } 
      }));
      
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
      
      setTimeout(() => {
        refreshOrders();
      }, 2000);
      
      return id; // Return the id instead of void
      
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: "Houve um problema ao atualizar o pedido.",
        variant: "destructive"
      });
      return ""; // Return empty string on error
    }
  };

  // Delete an order
  const deleteOrder = async (id: string): Promise<void> => {
    try {
      await orderService.delete(id);
      
      setOrders(prevOrders => prevOrders.filter(o => o.id !== id));
      unmarkOrderAsBeingEdited(id);
      
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
    generateNextCode,
    addOrder,
    updateOrder,
    deleteOrder
  };
};
