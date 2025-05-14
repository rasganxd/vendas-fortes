
import { useState, useEffect, useCallback } from 'react';
import { Order, OrderStatus } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { orderService } from '@/services/supabase';
import { addOrderItems, updateOrderItems } from '@/services/supabase/orderItemService';
import { loadOrderItems } from '@/services/supabase/loadOrderService';

export const loadOrders = async (): Promise<Order[]> => {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
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
        const items = await loadOrderItems(order.id);
        order.items = items;
      } catch (itemError) {
        console.error(`Error loading items for order ${order.id}:`, itemError);
        // Continue with empty items array rather than failing completely
      }
    }
    
    return transformedOrders;
  } catch (error) {
    console.error("Error loading orders:", error);
    return [];
  }
};

export const useOrders = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);

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

  const getOrderById = useCallback((id: string) => {
    return orders.find(order => order.id === id);
  }, [orders]);

  const addOrder = async (order: Omit<Order, 'id'>) => {
    try {
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
        throw error;
      }

      const newOrderFromDb = data[0];
      const newOrderId = newOrderFromDb.id;

      // Save order items
      if (order.items && order.items.length > 0) {
        await addOrderItems(newOrderId, order.items);
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

      // Update in Supabase
      const { error } = await supabase
        .from('orders')
        .update(supabaseOrderUpdate)
        .eq('id', id);

      if (error) {
        throw error;
      }

      // Update order items if they are included in the update
      if (orderUpdate.items) {
        await updateOrderItems(id, orderUpdate.items);
      }

      // Update local state
      setOrders(orders.map(o =>
        o.id === id ? { ...o, ...orderUpdate } : o
      ));
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

  const deleteOrder = async (id: string): Promise<void> => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('orders')
        .delete()
        .eq('id', id);

      if (error) {
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
