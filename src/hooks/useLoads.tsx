
import { useState, useEffect } from 'react';
import { Load, LoadItem, Order, OrderItem, Customer, SalesRep } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';
import { generateId, generateOrderCode } from '@/lib/utils';

export const useLoads = () => {
  const { 
    customers, 
    salesReps, 
    orders, 
    setOrders, 
    loads: contextLoads, 
    setLoads, 
    isLoadingLoads 
  } = useAppContext();
  const [loads, setLocalLoads] = useState<Load[]>(contextLoads || []);
  const [isLoading, setIsLoading] = useState(isLoadingLoads);

  useEffect(() => {
    const fetchLoads = async () => {
      try {
        setIsLoading(true);
        
        // Fetch loads from Supabase
        const { data, error } = await supabase
          .from('loads')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        // Transform data to match Load type
        const fetchedLoads: Load[] = data.map(load => ({
          id: load.id,
          name: load.name,
          date: new Date(load.date),
          salesRepId: load.sales_rep_id || '',
          vehicleId: load.vehicle_id || '',
          vehicleName: load.vehicle_name || '',
          status: load.status || 'pending',
          notes: load.notes || '',
          locked: load.locked || false,
          items: [], // Items will be loaded separately
          total: load.total || 0,
          createdAt: new Date(load.created_at),
          updatedAt: new Date(load.updated_at)
        }));
        
        // Fetch load items for each load
        for (const load of fetchedLoads) {
          const { data: itemsData, error: itemsError } = await supabase
            .from('load_items')
            .select('*')
            .eq('load_id', load.id);
            
          if (!itemsError && itemsData) {
            load.items = itemsData.map(item => ({
              id: item.id,
              productId: item.product_id || '',
              productName: item.product_name,
              productCode: item.product_code || 0,
              quantity: item.quantity,
              price: item.price || 0,
              customerId: item.customer_id || '',
              loadId: item.load_id,
              orderId: item.order_id || '',
              total: item.total || 0
            }));
          }
        }
        
        setLocalLoads(fetchedLoads);
        setLoads(fetchedLoads);
      } catch (error) {
        console.error("Erro ao carregar cargas:", error);
        toast({
          title: "Erro ao carregar cargas",
          description: "Houve um problema ao carregar as cargas.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoads();
  }, []);

  useEffect(() => {
    if (contextLoads) {
      setLocalLoads(contextLoads);
    }
  }, [contextLoads]);

  // Calculate total from items using price
  const calculateItemsTotal = (items: LoadItem[]) => {
    return items.reduce((total, item) => {
      return total + (item.price * item.quantity);
    }, 0);
  };

  // Get orders from a specific load
  const getOrdersFromLoad = (load: Load): Order[] => {
    // Group the items by customer
    const itemsByCustomer: { [customerId: string]: LoadItem[] } = {};
    
    load.items.forEach(item => {
      if (!item.customerId) return; // Skip items without customerId
      
      if (!itemsByCustomer[item.customerId]) {
        itemsByCustomer[item.customerId] = [];
      }
      itemsByCustomer[item.customerId].push(item);
    });
    
    // Create orders
    return Object.entries(itemsByCustomer).map(([customerId, items]) => {
      const customer = customers.find(c => c.id === customerId);
      
      // Convert LoadItems to OrderItems
      const orderItems: OrderItem[] = items.map(item => ({
        id: generateId(),
        productId: item.productId,
        productName: item.productName,
        productCode: item.productCode || 0,
        quantity: item.quantity,
        price: item.price,
        unitPrice: item.price, // For compatibility
        discount: 0,
        total: item.price * item.quantity
      }));
      
      return {
        id: generateId(),
        code: generateOrderCode(),
        customerId,
        customerName: customer?.name || 'Cliente não encontrado',
        salesRepId: load.salesRepId || '',
        salesRepName: salesReps.find(sr => sr.id === load.salesRepId)?.name || '',
        date: load.date,
        dueDate: load.date,
        items: orderItems,
        total: calculateItemsTotal(items),
        discount: 0,
        status: 'completed' as 'completed', // Using 'completed' as OrderStatus
        paymentStatus: 'paid' as 'paid', // Using 'paid' as PaymentStatus
        paymentMethod: 'auto-generated',
        paymentMethodId: '',
        paymentTableId: '',
        payments: [],
        notes: `Pedido gerado automaticamente a partir da carga ${load.name}.`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
    });
  };

  // Toggle lock status on a load
  const toggleLoadLock = async (id: string, isLocked: boolean) => {
    try {
      const { error } = await supabase
        .from('loads')
        .update({ locked: isLocked })
        .eq('id', id);
        
      if (error) throw error;
      
      const updatedLoads = loads.map(l => (l.id === id ? { ...l, locked: isLocked } : l));
      setLocalLoads(updatedLoads);
      setLoads(updatedLoads);
      
      toast({
        title: isLocked ? "Carga bloqueada" : "Carga desbloqueada",
        description: isLocked ? "A carga foi bloqueada com sucesso!" : "A carga foi desbloqueada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao alterar status de bloqueio da carga:", error);
      toast({
        title: "Erro ao alterar status",
        description: "Houve um problema ao alterar o status de bloqueio da carga.",
        variant: "destructive"
      });
    }
  };

  const addLoad = async (load: Omit<Load, 'id'>) => {
    try {
      // Transform load to match Supabase schema
      const supabaseLoad = {
        name: load.name,
        date: load.date.toISOString(),
        sales_rep_id: load.salesRepId || null,
        vehicle_id: load.vehicleId || null,
        vehicle_name: load.vehicleName || null,
        status: load.status || 'pending',
        notes: load.notes || '',
        locked: load.locked || false,
        total: load.total || 0
      };
      
      // Add to Supabase
      const { data, error } = await supabase
        .from('loads')
        .insert(supabaseLoad)
        .select();
        
      if (error) throw error;
      
      const newLoadFromDb = data[0];
      
      // Transform back to Load type
      const newLoad: Load = {
        id: newLoadFromDb.id,
        name: newLoadFromDb.name,
        date: new Date(newLoadFromDb.date),
        salesRepId: newLoadFromDb.sales_rep_id || '',
        vehicleId: newLoadFromDb.vehicle_id || '',
        vehicleName: newLoadFromDb.vehicle_name || '',
        status: newLoadFromDb.status || 'pending',
        notes: newLoadFromDb.notes || '',
        locked: newLoadFromDb.locked || false,
        items: [],
        total: newLoadFromDb.total || 0,
        createdAt: new Date(newLoadFromDb.created_at),
        updatedAt: new Date(newLoadFromDb.updated_at)
      };
      
      // Add items if any
      if (load.items && load.items.length > 0) {
        const supabaseItems = load.items.map(item => ({
          product_id: item.productId,
          product_name: item.productName,
          product_code: item.productCode || 0,
          quantity: item.quantity,
          price: item.price || 0,
          customer_id: item.customerId || null,
          load_id: newLoad.id,
          order_id: item.orderId || null,
          total: item.total || item.price * item.quantity
        }));
        
        const { data: itemsData, error: itemsError } = await supabase
          .from('load_items')
          .insert(supabaseItems)
          .select();
          
        if (itemsError) {
          console.error("Error adding load items:", itemsError);
        } else if (itemsData) {
          newLoad.items = itemsData.map(item => ({
            id: item.id,
            productId: item.product_id || '',
            productName: item.product_name,
            productCode: item.product_code || 0,
            quantity: item.quantity,
            price: item.price || 0,
            customerId: item.customer_id || '',
            loadId: item.load_id,
            orderId: item.order_id || '',
            total: item.total || 0
          }));
        }
      }
      
      setLocalLoads([...loads, newLoad]);
      setLoads([...loads, newLoad]);
      
      toast({
        title: "Carga adicionada",
        description: "Carga adicionada com sucesso!"
      });
      
      return newLoad.id;
    } catch (error) {
      console.error("Erro ao adicionar carga:", error);
      toast({
        title: "Erro ao adicionar carga",
        description: "Houve um problema ao adicionar a carga.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateLoad = async (id: string, load: Partial<Load>) => {
    try {
      // Transform load to match Supabase schema
      const supabaseLoad: Record<string, any> = {};
      
      if (load.name !== undefined) supabaseLoad.name = load.name;
      if (load.date !== undefined) supabaseLoad.date = load.date.toISOString();
      if (load.salesRepId !== undefined) supabaseLoad.sales_rep_id = load.salesRepId;
      if (load.vehicleId !== undefined) supabaseLoad.vehicle_id = load.vehicleId;
      if (load.vehicleName !== undefined) supabaseLoad.vehicle_name = load.vehicleName;
      if (load.status !== undefined) supabaseLoad.status = load.status;
      if (load.notes !== undefined) supabaseLoad.notes = load.notes;
      if (load.locked !== undefined) supabaseLoad.locked = load.locked;
      if (load.total !== undefined) supabaseLoad.total = load.total;
      
      // Update in Supabase
      const { error } = await supabase
        .from('loads')
        .update(supabaseLoad)
        .eq('id', id);
        
      if (error) throw error;
      
      // Update items if provided
      if (load.items && load.items.length > 0) {
        // First delete existing items
        const { error: deleteError } = await supabase
          .from('load_items')
          .delete()
          .eq('load_id', id);
          
        if (deleteError) {
          console.error("Error deleting existing load items:", deleteError);
        } else {
          // Then add new items
          const supabaseItems = load.items.map(item => ({
            product_id: item.productId,
            product_name: item.productName,
            product_code: item.productCode || 0,
            quantity: item.quantity,
            price: item.price || 0,
            customer_id: item.customerId || null,
            load_id: id,
            order_id: item.orderId || null,
            total: item.total || item.price * item.quantity
          }));
          
          const { error: insertError } = await supabase
            .from('load_items')
            .insert(supabaseItems);
            
          if (insertError) {
            console.error("Error inserting new load items:", insertError);
          }
        }
      }
      
      // Update local state
      const updatedLoads = loads.map(l => (l.id === id ? { ...l, ...load } : l));
      setLocalLoads(updatedLoads);
      setLoads(updatedLoads);
      
      toast({
        title: "Carga atualizada",
        description: "Carga atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar carga:", error);
      toast({
        title: "Erro ao atualizar carga",
        description: "Houve um problema ao atualizar a carga.",
        variant: "destructive"
      });
    }
  };

  const deleteLoad = async (id: string) => {
    try {
      // First delete related items
      const { error: itemsError } = await supabase
        .from('load_items')
        .delete()
        .eq('load_id', id);
        
      if (itemsError) {
        console.error("Error deleting load items:", itemsError);
      }
      
      // Then delete the load
      const { error } = await supabase
        .from('loads')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      // Update local state
      const updatedLoads = loads.filter(l => l.id !== id);
      setLocalLoads(updatedLoads);
      setLoads(updatedLoads);
      
      toast({
        title: "Carga excluída",
        description: "Carga excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir carga:", error);
      toast({
        title: "Erro ao excluir carga",
        description: "Houve um problema ao excluir a carga.",
        variant: "destructive"
      });
    }
  };

  const generateOrders = async (loadId: string) => {
    try {
      setIsLoading(true);
      const load = loads.find(l => l.id === loadId);
      if (!load) {
        throw new Error("Carga não encontrada.");
      }

      const newOrders = getOrdersFromLoad(load);
      setOrders([...orders, ...newOrders]);

      toast({
        title: "Pedidos gerados",
        description: `${newOrders.length} pedidos gerados a partir da carga ${load.name}.`
      });
    } catch (error: any) {
      console.error("Erro ao gerar pedidos:", error);
      toast({
        title: "Erro ao gerar pedidos",
        description: error.message || "Houve um problema ao gerar os pedidos.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    loads,
    isLoading,
    addLoad,
    updateLoad,
    deleteLoad,
    generateOrders,
    setLoads,
    getOrdersFromLoad,
    toggleLoadLock
  };
};
