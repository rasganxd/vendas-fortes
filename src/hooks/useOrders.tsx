import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { orderService, getOrderWithItems } from '@/services/supabase/orderService';
import { addOrderItems, updateOrderItems, getOrderItems } from '@/services/supabase/orderItemService';

// Cache keys for localStorage
const ORDERS_CACHE_KEY = 'app_orders_cache';
const ORDERS_CACHE_TIMESTAMP_KEY = 'app_orders_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

export const loadOrders = async (forceRefresh = false): Promise<Order[]> => {
  try {
    console.log('Loading all orders with forceRefresh =', forceRefresh);
    
    // Try to get from cache if not forcing refresh
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(ORDERS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(ORDERS_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        // If cache is still fresh, use it
        if (now - timestamp < CACHE_MAX_AGE) {
          console.log("Using cached order data");
          return JSON.parse(cachedData) as Order[];
        }
      }
    }
    
    console.log('Fetching orders data from Supabase');
    
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      console.error("Error loading orders:", error);
      toast({
        title: "Erro ao carregar pedidos",
        description: `${error.message}`,
        variant: "destructive"
      });
      throw error;
    }
    
    if (!data || data.length === 0) {
      console.log('No orders found');
      return [];
    }
    
    console.log(`Found ${data.length} orders`);
    
    // Transform data to match Order type
    const transformedOrders = data.map(order => ({
      id: order.id,
      code: order.code,
      customerId: order.customer_id || '',
      customerName: order.customer_name,
      date: new Date(order.date || new Date()),
      salesRepId: order.sales_rep_id || '',
      salesRepName: order.sales_rep_name,
      total: order.total,
      status: (order.status || 'pending') as OrderStatus,
      paymentStatus: (order.payment_status || 'pending') as 'pending' | 'partial' | 'paid',
      paymentMethod: order.payment_method || '',
      paymentMethodId: order.payment_method_id || '',
      paymentTableId: order.payment_table_id || '',
      discount: order.discount || 0,
      dueDate: order.due_date ? new Date(order.due_date) : new Date(),
      deliveryAddress: order.delivery_address || '',
      deliveryCity: order.delivery_city || '',
      deliveryState: order.delivery_state || '',
      deliveryZip: order.delivery_zip || '',
      notes: order.notes || '',
      createdAt: new Date(order.created_at || new Date()),
      updatedAt: new Date(order.updated_at || new Date()),
      archived: order.archived || false,
      items: [], // Items will be loaded separately
      payments: [], // Initialize with empty payments array
    }));

    // Load order items for each order
    for (const order of transformedOrders) {
      try {
        console.log(`Loading items for order ${order.id}`);
        const items = await getOrderItems(order.id);
        order.items = items;
        console.log(`Loaded ${items.length} items for order ${order.id}`);
      } catch (itemError) {
        console.error(`Error loading items for order ${order.id}:`, itemError);
        // Continue with empty items array rather than failing completely
      }
    }
    
    // Store in localStorage cache
    localStorage.setItem(ORDERS_CACHE_KEY, JSON.stringify(transformedOrders));
    localStorage.setItem(ORDERS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    return transformedOrders;
  } catch (error) {
    console.error("Error in loadOrders:", error);
    
    // Try to use cached data even if expired as fallback
    const cachedData = localStorage.getItem(ORDERS_CACHE_KEY);
    if (cachedData) {
      console.log("Using expired cache as fallback due to error");
      return JSON.parse(cachedData) as Order[];
    }
    
    return [];
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);

  // Monitor online/offline status
  useEffect(() => {
    const handleOnlineStatus = () => {
      const online = navigator.onLine;
      console.log("Connection status changed:", online ? "ONLINE" : "OFFLINE");
      setIsOnline(online);
      
      if (online) {
        // Refresh data when coming back online
        console.log("Coming back online - refreshing orders data");
        refreshOrders();
      }
    };
    
    window.addEventListener('online', handleOnlineStatus);
    window.addEventListener('offline', handleOnlineStatus);
    
    return () => {
      window.removeEventListener('online', handleOnlineStatus);
      window.removeEventListener('offline', handleOnlineStatus);
    };
  }, []);
  
  // Set up Realtime subscription
  useEffect(() => {
    console.log("Setting up Realtime subscription for orders table");
    
    const channel = supabase
      .channel('order-changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'orders'
        },
        (payload) => {
          console.log("Realtime order change detected:", payload);
          // Refresh orders when changes are detected
          refreshOrders();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status for orders:", status);
      });
      
    // Set up Realtime subscription for order items
    const itemsChannel = supabase
      .channel('order-items-changes')
      .on(
        'postgres_changes',
        {
          event: '*', 
          schema: 'public',
          table: 'order_items'
        },
        (payload) => {
          console.log("Realtime order items change detected:", payload);
          // Refresh orders when changes are detected
          refreshOrders();
        }
      )
      .subscribe((status) => {
        console.log("Realtime subscription status for order items:", status);
      });
      
    return () => {
      console.log("Cleaning up Realtime subscriptions");
      supabase.removeChannel(channel);
      supabase.removeChannel(itemsChannel);
    };
  }, []);
  
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

  const getOrderById = useCallback(async (id: string): Promise<Order | null> => {
    console.log(`Getting order by ID: ${id}`);
    
    // First check if it's in the local state with items
    const cachedOrder = orders.find(order => order.id === id);
    if (cachedOrder && cachedOrder.items && cachedOrder.items.length > 0) {
      console.log('Found order in local cache with items:', cachedOrder);
      return cachedOrder;
    }
    
    // If not in local state or items are missing, fetch from API
    try {
      console.log('Fetching order with items from database...');
      const order = await getOrderWithItems(id);
      
      if (!order) {
        console.warn(`Order with ID ${id} not found`);
        return null;
      }
      
      console.log('Order fetched successfully:', order);
      
      // Update the local cache with the fetched order
      setOrders(prevOrders => {
        const orderIndex = prevOrders.findIndex(o => o.id === id);
        if (orderIndex >= 0) {
          // Replace the existing order
          const updatedOrders = [...prevOrders];
          updatedOrders[orderIndex] = order;
          return updatedOrders;
        } else {
          // Add the new order to the array
          return [...prevOrders, order];
        }
      });
      
      return order;
    } catch (error) {
      console.error(`Error fetching order with ID ${id}:`, error);
      return null;
    }
  }, [orders]);

  const addOrder = async (order: Omit<Order, 'id'>): Promise<string> => {
    try {
      console.log('Adding new order:', order);
      
      // Transform Order to match Supabase schema
      const supabaseOrder = {
        code: order.code,
        customer_id: order.customerId,
        customer_name: order.customerName,
        date: order.date.toISOString(),
        sales_rep_id: order.salesRepId,
        sales_rep_name: order.salesRepName,
        total: order.total,
        status: order.status,
        payment_status: order.paymentStatus,
        payment_method: order.paymentMethod,
        payment_method_id: order.paymentMethodId,
        payment_table_id: order.paymentTableId,
        discount: order.discount,
        due_date: order.dueDate ? order.dueDate.toISOString() : null,
        delivery_address: order.deliveryAddress,
        delivery_city: order.deliveryCity,
        delivery_state: order.deliveryState,
        delivery_zip: order.deliveryZip,
        notes: order.notes,
        archived: order.archived
      };

      // Add to Supabase
      const { data, error } = await supabase
        .from('orders')
        .insert(supabaseOrder)
        .select();

      if (error) {
        console.error('Error adding order to database:', error);
        toast({
          title: "Erro ao adicionar pedido",
          description: `${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

      if (!data || data.length === 0) {
        throw new Error('No data returned from database after adding order');
      }

      const newOrderFromDb = data[0];
      const newOrderId = newOrderFromDb.id;
      
      console.log('Order added with ID:', newOrderId);

      // Save order items
      if (order.items && order.items.length > 0) {
        console.log(`Adding ${order.items.length} items to new order ${newOrderId}`);
        await addOrderItems(newOrderId, order.items);
      } else {
        console.warn('No items to add to the new order');
      }

      // Transform back to Order type
      const newOrder: Order = {
        id: newOrderFromDb.id,
        code: newOrderFromDb.code,
        customerId: newOrderFromDb.customer_id || '',
        customerName: newOrderFromDb.customer_name,
        date: new Date(newOrderFromDb.date || new Date()),
        salesRepId: newOrderFromDb.sales_rep_id || '',
        salesRepName: newOrderFromDb.sales_rep_name,
        total: newOrderFromDb.total,
        status: (newOrderFromDb.status || 'pending') as OrderStatus,
        paymentStatus: (newOrderFromDb.payment_status || 'pending') as 'pending' | 'partial' | 'paid',
        paymentMethod: newOrderFromDb.payment_method || '',
        paymentMethodId: newOrderFromDb.payment_method_id || '',
        paymentTableId: newOrderFromDb.payment_table_id || '',
        discount: newOrderFromDb.discount || 0,
        dueDate: newOrderFromDb.due_date ? new Date(newOrderFromDb.due_date) : new Date(),
        deliveryAddress: newOrderFromDb.delivery_address || '',
        deliveryCity: newOrderFromDb.delivery_city || '',
        deliveryState: newOrderFromDb.delivery_state || '',
        deliveryZip: newOrderFromDb.delivery_zip || '',
        notes: newOrderFromDb.notes || '',
        createdAt: new Date(newOrderFromDb.created_at || new Date()),
        updatedAt: new Date(newOrderFromDb.updated_at || new Date()),
        archived: newOrderFromDb.archived || false,
        items: order.items || [], // Store the items in memory
        payments: []
      };

      // Update local state
      setOrders([...orders, newOrder]);
      toast({
        title: "Pedido adicionado",
        description: "Pedido adicionado com sucesso!"
      });
      return newOrder.id;
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

  const updateOrder = async (id: string, orderUpdate: Partial<Order>): Promise<string> => {
    try {
      console.log(`Updating order ${id}:`, orderUpdate);
      
      // Transform Order to match Supabase schema
      const supabaseOrderUpdate: Record<string, any> = {};

      if (orderUpdate.code !== undefined) supabaseOrderUpdate.code = orderUpdate.code;
      if (orderUpdate.customerId !== undefined) supabaseOrderUpdate.customer_id = orderUpdate.customerId;
      if (orderUpdate.customerName !== undefined) supabaseOrderUpdate.customer_name = orderUpdate.customerName;
      if (orderUpdate.date !== undefined) supabaseOrderUpdate.date = orderUpdate.date.toISOString();
      if (orderUpdate.salesRepId !== undefined) supabaseOrderUpdate.sales_rep_id = orderUpdate.salesRepId;
      if (orderUpdate.salesRepName !== undefined) supabaseOrderUpdate.sales_rep_name = orderUpdate.salesRepName;
      if (orderUpdate.total !== undefined) supabaseOrderUpdate.total = orderUpdate.total;
      if (orderUpdate.status !== undefined) supabaseOrderUpdate.status = orderUpdate.status;
      if (orderUpdate.paymentStatus !== undefined) supabaseOrderUpdate.payment_status = orderUpdate.paymentStatus;
      if (orderUpdate.paymentMethod !== undefined) supabaseOrderUpdate.payment_method = orderUpdate.paymentMethod;
      if (orderUpdate.paymentMethodId !== undefined) supabaseOrderUpdate.payment_method_id = orderUpdate.paymentMethodId;
      if (orderUpdate.paymentTableId !== undefined) supabaseOrderUpdate.payment_table_id = orderUpdate.paymentTableId;
      if (orderUpdate.discount !== undefined) supabaseOrderUpdate.discount = orderUpdate.discount;
      if (orderUpdate.dueDate !== undefined) supabaseOrderUpdate.due_date = orderUpdate.dueDate.toISOString();
      if (orderUpdate.deliveryAddress !== undefined) supabaseOrderUpdate.delivery_address = orderUpdate.deliveryAddress;
      if (orderUpdate.deliveryCity !== undefined) supabaseOrderUpdate.delivery_city = orderUpdate.deliveryCity;
      if (orderUpdate.deliveryState !== undefined) supabaseOrderUpdate.delivery_state = orderUpdate.deliveryState;
      if (orderUpdate.deliveryZip !== undefined) supabaseOrderUpdate.delivery_zip = orderUpdate.deliveryZip;
      if (orderUpdate.notes !== undefined) supabaseOrderUpdate.notes = orderUpdate.notes;
      if (orderUpdate.archived !== undefined) supabaseOrderUpdate.archived = orderUpdate.archived;

      console.log('Updating order in database with data:', supabaseOrderUpdate);
      
      // Update in Supabase
      const { error } = await supabase
        .from('orders')
        .update(supabaseOrderUpdate)
        .eq('id', id);

      if (error) {
        console.error('Error updating order in database:', error);
        toast({
          title: "Erro ao atualizar pedido",
          description: `${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

      // Update order items if they are included in the update
      if (orderUpdate.items) {
        console.log(`Updating ${orderUpdate.items.length} items for order ${id}`);
        await updateOrderItems(id, orderUpdate.items);
      }

      // Update local state
      setOrders(prevOrders => {
        return prevOrders.map(o => {
          if (o.id === id) {
            return { ...o, ...orderUpdate };
          }
          return o;
        });
      });
      
      toast({
        title: "Pedido atualizado",
        description: "Pedido atualizado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao atualizar pedido:", error);
      toast({
        title: "Erro ao atualizar pedido",
        description: `Houve um problema ao atualizar o pedido: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return "";
    }
  };

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      console.log(`Deleting order ${id}`);
      
      // First delete order items
      const { error: itemsError } = await supabase
        .from('order_items')
        .delete()
        .eq('order_id', id);
        
      if (itemsError) {
        console.error('Error deleting order items:', itemsError);
        // Continue with order deletion even if items deletion fails
      }
      
      // Then delete the order
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
        console.error('Error deleting order:', error);
        toast({
          title: "Erro ao excluir pedido",
          description: `${error.message}`,
          variant: "destructive"
        });
        throw error;
      }

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

  const refreshOrders = async (): Promise<void> => {
    try {
      setIsLoading(true);
      console.log('Refreshing orders list...');
      const loadedOrders = await loadOrders(true);
      setOrders(loadedOrders);
      console.log(`Refreshed orders list, found ${loadedOrders.length} orders`);
    } catch (error) {
      console.error("Error refreshing orders:", error);
      toast({
        title: "Erro ao atualizar pedidos",
        description: "Houve um problema ao carregar os pedidos atualizados.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    orders,
    isLoading,
    isOnline,
    getOrderById,
    addOrder,
    updateOrder,
    deleteOrder,
    setOrders,
    refreshOrders
  };
};
