
import { useState, useEffect } from 'react';
import { Order } from '@/types';
import { toast } from '@/hooks/use-toast';
import { orderService } from '@/services/firebase/orderService';
import { useConnection } from '@/context/providers/ConnectionProvider';

// Load orders directly from Firebase with enhanced error handling
export const loadOrders = async (forceRefresh = false): Promise<Order[]> => {
  try {
    console.log("Loading orders from Firebase");
    const orders = await orderService.getAll();
    console.log(`Loaded ${orders.length} orders from Firebase`);
    
    if (orders.length === 0) {
      console.log("No orders found in Firebase");
    }
    
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

  // Enhanced logging for order loading process
  useEffect(() => {
    const fetchOrders = async () => {
      console.log("useOrders: Fetching orders - starting");
      try {
        setIsLoading(true);
        console.log("useOrders: Connection status when loading orders:", connectionStatus);
        
        const loadedOrders = await loadOrders();
        console.log("useOrders: Orders fetched successfully", loadedOrders.length);
        
        setOrders(loadedOrders);
      } catch (error) {
        console.error("useOrders: Error loading orders:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar pedidos",
          description: "Houve um problema ao carregar os pedidos."
        });
      } finally {
        setIsLoading(false);
        console.log("useOrders: Fetching orders - completed");
      }
    };

    fetchOrders();
  }, [connectionStatus]);

  // Improved getOrderById with better error handling and data validation
  const getOrderById = async (id: string): Promise<Order | null> => {
    if (!id || id.trim() === "") {
      console.error("Invalid order ID provided:", id);
      return null;
    }
    
    try {
      console.log(`Getting order by ID: ${id}`);
      
      // Validate connection status
      if (connectionStatus === 'offline') {
        console.warn("Attempting to fetch order while offline");
        toast({
          variant: "warning",
          title: "Modo offline",
          description: "Tentando carregar o pedido no modo offline"
        });
      }
      
      const order = await orderService.getById(id);
      
      if (!order) {
        console.warn(`Order with ID ${id} not found`);
        return null;
      }
      
      // Validate essential order properties
      if (!order.customerId || !order.items) {
        console.warn(`Order ${id} has missing essential data:`, {
          hasCustomerId: !!order.customerId,
          hasItems: !!order.items,
          itemsIsArray: Array.isArray(order.items)
        });
      }
      
      // Ensure order.items is always an array
      if (!Array.isArray(order.items)) {
        console.warn(`Order ${id} has non-array items:`, order.items);
        order.items = [];
      }
      
      console.log(`Successfully retrieved order ${id} with ${order.items.length} items`);
      return order;
    } catch (error) {
      console.error(`Error getting order by ID ${id}:`, error);
      toast({
        variant: "destructive",
        title: "Erro ao carregar pedido",
        description: `Não foi possível carregar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return null;
    }
  };

  // Add order function
  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
      setIsProcessing(true);
      console.log("Connection status when adding order:", connectionStatus);
      
      // Show warning if offline but proceed with adding order to local storage
      if (connectionStatus === 'offline') {
        toast({
          variant: "warning",
          title: "Modo offline",
          description: "O pedido será sincronizado quando estiver online"
        });
      }
      
      // Validate order data
      if (!order.customerId || !order.salesRepId) {
        throw new Error("Dados obrigatórios do pedido estão faltando");
      }
      
      // Generate a new order code if not provided
      if (!order.code) {
        const nextCode = await orderService.generateNextOrderCode();
        order = { ...order, code: nextCode };
      }
      
      // Ensure order.items is an array
      if (!Array.isArray(order.items)) {
        console.warn("Order items is not an array, setting to empty array");
        order.items = [];
      }
      
      const id = await orderService.add(order);
      console.log("Order added successfully with ID:", id);
      
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
        variant: "destructive",
        title: "Erro ao adicionar pedido",
        description: `Houve um problema ao adicionar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  // Update order function with enhanced validation
  const updateOrder = async (id: string, order: Partial<Order>) => {
    if (!id || id.trim() === "") {
      console.error("Invalid order ID for update:", id);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar",
        description: "ID do pedido inválido"
      });
      return "";
    }
    
    try {
      setIsProcessing(true);
      console.log("Connection status when updating order:", connectionStatus);
      console.log("Updating order:", id);
      
      // Show warning if offline but proceed with updating order in local storage
      if (connectionStatus === 'offline') {
        toast({
          variant: "warning",
          title: "Modo offline",
          description: "As alterações serão sincronizadas quando estiver online"
        });
      }
      
      // Ensure order.items is an array if present
      if (order.items && !Array.isArray(order.items)) {
        console.warn("Update data contains non-array items, fixing");
        order.items = Array.isArray(order.items) ? order.items : [];
      }
      
      // Add updated timestamp
      const updateData = {
        ...order,
        updatedAt: new Date()
      };
      
      await orderService.update(id, updateData);
      console.log("Order updated successfully");
      
      // Update orders state
      setOrders(prev => {
        const updatedOrders = prev.map(o =>
          o.id === id ? { ...o, ...updateData } : o
        );
        return updatedOrders;
      });
      
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error updating order:", error);
      toast({
        variant: "destructive",
        title: "Erro ao atualizar pedido",
        description: `Houve um problema ao atualizar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
      });
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  // Delete order function
  const deleteOrder = async (id: string) => {
    try {
      setIsProcessing(true);
      console.log("Deleting order:", id);
      
      await orderService.delete(id);
      console.log("Order deleted successfully");
      
      setOrders(prev => prev.filter(o => o.id !== id));
      
      toast({
        title: "Pedido excluído",
        description: "Pedido excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting order:", error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir pedido",
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
