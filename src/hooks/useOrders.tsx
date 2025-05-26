
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { orderService } from '@/services/supabase/orderService';
import { toast } from '@/components/ui/use-toast';

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadOrders = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log("=== LOADING ORDERS ===");
      const data = await orderService.getAll();
      console.log("✅ Successfully loaded orders:", data?.length || 0, "items");
      setOrders(data);
    } catch (error) {
      console.error('❌ Error loading orders:', error);
      toast({
        title: "Erro ao carregar pedidos",
        description: "Houve um problema ao carregar os pedidos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const refreshOrders = async (): Promise<void> => {
    await loadOrders();
  };

  useEffect(() => {
    loadOrders();
  }, []);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      console.log("=== ADDING NEW ORDER ===");
      console.log("Input data:", order);
      
      const id = await orderService.add(order);
      console.log("✅ Order added to Supabase with ID:", id);
      
      // Create the new order object for local state
      const newOrder = { 
        ...order, 
        id
      } as Order;
      
      // Update local state
      const updatedOrders = [...orders, newOrder];
      console.log("📊 Updating local state with", updatedOrders.length, "orders");
      setOrders(updatedOrders);
      
      toast({
        title: "✅ Pedido adicionado",
        description: `Pedido ${newOrder.code} foi adicionado com sucesso!`
      });
      
      console.log("=== ORDER ADDITION COMPLETED SUCCESSFULLY ===");
      return id;
    } catch (error) {
      console.error("❌ CRITICAL ERROR adding order:", error);
      
      toast({
        title: "❌ Erro ao adicionar pedido",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return "";
    }
  };

  const updateOrder = async (id: string, order: Partial<Order>) => {
    try {
      console.log("=== UPDATING ORDER ===");
      console.log("ID:", id, "Data:", order);
      
      console.log("🚀 Calling orderService.update...");
      await orderService.update(id, order);
      console.log("✅ Order updated in Supabase");
      
      // Update local state
      setOrders(orders.map(o => o.id === id ? { ...o, ...order } : o));
      
      toast({
        title: "✅ Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
      
      console.log("=== ORDER UPDATE COMPLETED ===");
    } catch (error) {
      console.error("❌ Error updating order:", error);
      toast({
        title: "❌ Erro ao atualizar pedido",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const deleteOrder = async (id: string) => {
    try {
      console.log("=== DELETING ORDER ===");
      console.log("ID:", id);
      
      console.log("🚀 Calling orderService.delete...");
      await orderService.delete(id);
      console.log("✅ Order deleted from Supabase");
      
      // Update local state
      setOrders(orders.filter(o => o.id !== id));
      
      toast({
        title: "✅ Pedido excluído",
        description: "Pedido excluído com sucesso!"
      });
      
      console.log("=== ORDER DELETION COMPLETED ===");
    } catch (error) {
      console.error("❌ Error deleting order:", error);
      toast({
        title: "❌ Erro ao excluir pedido",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
    refreshOrders
  };
};
