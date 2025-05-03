import { useState, useEffect } from 'react';
import { Load, LoadItem, Order, OrderItem, Customer, SalesRep } from '@/types';
import { loadService } from '@/firebase/firestoreService';
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
        const fetchedLoads = await loadService.getAll();
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
        status: 'completed', // Using 'completed' instead of 'delivered'
        paymentStatus: 'paid',
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
      await loadService.update(id, { locked: isLocked });
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
      const id = await loadService.add(load);
      const newLoad: Load = { ...load, id };
      setLocalLoads([...loads, newLoad]);
      setLoads([...loads, newLoad]);
      toast({
        title: "Carga adicionada",
        description: "Carga adicionada com sucesso!"
      });
      return id;
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
      await loadService.update(id, load);
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
      await loadService.delete(id);
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
