
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { orderService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadOrders = async (): Promise<Order[]> => {
  try {
    console.log("Loading orders from Firebase");
    const orders = await orderService.getAll();
    console.log("Loaded orders:", orders);
    return orders;
  } catch (error) {
    console.error("Erro ao carregar pedidos:", error);
    return [];
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        console.log("Fetching orders...");
        setIsLoading(true);
        const loadedOrders = await loadOrders();
        console.log(`Fetched ${loadedOrders.length} orders`);
        setOrders(loadedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

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

  const updateOrder = async (id: string, orderData: Partial<Order>) => {
    try {
      console.log("Updating order with ID:", id);
      console.log("New order data:", orderData);
      
      // Get the current order from the local state
      const currentOrder = getOrderById(id);
      if (!currentOrder) {
        throw new Error(`Pedido com ID ${id} não encontrado`);
      }
      
      // Log details about the items for debugging
      if (orderData.items) {
        console.log("Items being updated - item count:", orderData.items.length);
        console.log("First few items:", orderData.items.slice(0, 3));
      }
      
      // Create a complete merged order with all data, ensuring items are properly processed
      const updatedOrderData = { 
        ...currentOrder, 
        ...orderData,
      };
      
      // Specifically handle items to ensure consistency
      if (orderData.items && orderData.items.length > 0) {
        // Normalize item data for consistency
        updatedOrderData.items = orderData.items.map(item => ({
          id: item.id || undefined, // Keep id if exists
          productId: item.productId,
          productName: item.productName,
          productCode: item.productCode || 0,
          quantity: item.quantity,
          unitPrice: item.unitPrice || item.price || 0,
          price: item.price || item.unitPrice || 0, // Ensure price is set
          discount: item.discount || 0,
          total: (item.unitPrice || item.price || 0) * item.quantity
        }));
      }
      
      console.log("Complete order data being sent to Firebase:", updatedOrderData);
      
      // Send the complete order to Firebase
      await orderService.update(id, updatedOrderData);
      
      // Update the local state with the complete order
      setOrders(orders.map(o => 
        o.id === id ? updatedOrderData as Order : o
      ));
      
      console.log("Order updated successfully");
      
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: "Houve um problema ao atualizar o pedido.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateOrderPaymentMethod = async (id: string, paymentTableId: string, paymentStatus: 'pending' | 'partial' | 'paid' = 'paid') => {
    try {
      await orderService.update(id, { paymentTableId, paymentStatus });
      setOrders(orders.map(o => 
        o.id === id ? { ...o, paymentTableId, paymentStatus } : o
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

  const deleteOrder = async (id: string): Promise<void> => {
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
    deleteOrder,
    isLoading,
    setOrders
  };
};
