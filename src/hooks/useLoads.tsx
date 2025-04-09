import { Load, Order, OrderItem } from '@/types';
import { loadService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadLoads = async (): Promise<Load[]> => {
  try {
    return await loadService.getAll();
  } catch (error) {
    console.error("Erro ao carregar carregamentos:", error);
    return [];
  }
};

export const useLoads = () => {
  const { loads, setLoads } = useAppContext();

  const addLoad = async (load: Omit<Load, 'id'>) => {
    try {
      // Clean the load object to remove undefined values before sending to Firestore
      const cleanedLoad = {
        ...load,
        // Convert empty strings or undefined to null since Firestore accepts null values
        vehicleName: load.vehicleName || null,
        notes: load.notes || null,
        // Garantir que o orderIds seja um array único
        orderIds: load.orderIds ? Array.from(new Set(load.orderIds)) : [],
        status: load.status || 'planning',
        date: load.date || new Date(),
        locked: load.locked || false // Default to unlocked
      };
      
      // Add to Firebase
      const id = await loadService.add(cleanedLoad);
      const newLoad = { ...cleanedLoad, id } as Load;
      
      // Update local state
      setLoads([...loads, newLoad]);
      toast({
        title: "Carregamento adicionado",
        description: "Carregamento adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar carregamento:", error);
      toast({
        title: "Erro ao adicionar carregamento",
        description: "Houve um problema ao adicionar o carregamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateLoad = async (id: string, load: Partial<Load>) => {
    try {
      // Clean the load object to remove undefined values before sending to Firestore
      const cleanedLoad = {
        ...load,
        // Convert empty strings or undefined to null since Firestore accepts null values
        vehicleName: load.vehicleName === undefined ? undefined : (load.vehicleName || null),
        notes: load.notes === undefined ? undefined : (load.notes || null),
      };
      
      // Update in Firebase
      await loadService.update(id, cleanedLoad);
      
      // Update local state
      setLoads(loads.map(l => 
        l.id === id ? { ...l, ...cleanedLoad } : l
      ));
      toast({
        title: "Carregamento atualizado",
        description: "Carregamento atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar carregamento:", error);
      toast({
        title: "Erro ao atualizar carregamento",
        description: "Houve um problema ao atualizar o carregamento.",
        variant: "destructive"
      });
    }
  };

  const toggleLoadLock = async (id: string, locked: boolean) => {
    try {
      // Update in Firebase
      await loadService.update(id, { locked });
      
      // Update local state
      setLoads(loads.map(l => 
        l.id === id ? { ...l, locked } : l
      ));
      
      toast({
        title: locked ? "Carga bloqueada" : "Carga desbloqueada",
        description: locked 
          ? "Os pedidos desta carga não podem ser adicionados a outras cargas." 
          : "Os pedidos desta carga agora podem ser adicionados a outras cargas."
      });
    } catch (error) {
      console.error("Erro ao atualizar status de bloqueio da carga:", error);
      toast({
        title: "Erro ao atualizar carga",
        description: "Houve um problema ao atualizar o status de bloqueio da carga.",
        variant: "destructive"
      });
    }
  };

  const deleteLoad = async (id: string) => {
    try {
      // Delete from Firebase
      await loadService.delete(id);
      
      // Update local state
      setLoads(loads.filter(l => l.id !== id));
      toast({
        title: "Carregamento excluído",
        description: "Carregamento excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir carregamento:", error);
      toast({
        title: "Erro ao excluir carregamento",
        description: "Houve um problema ao excluir o carregamento.",
        variant: "destructive"
      });
    }
  };

  // Função auxiliar para extrair ordens de uma carga
  const getOrdersFromLoad = (load: Load): Order[] => {
    if (!load.items) return [];
    
    // Agrupar itens por orderId para evitar duplicações
    const orderItemsMap = new Map<string, OrderItem[]>();
    
    load.items.forEach(item => {
      if (item.orderId) {
        if (!orderItemsMap.has(item.orderId)) {
          orderItemsMap.set(item.orderId, []);
        }
        
        const orderItem: OrderItem = {
          id: item.id || `item-${Math.random().toString(36).substr(2, 9)}`,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          unitPrice: (item.orderItems && item.orderItems[0]?.unitPrice) || 0,
          total: (item.orderItems && item.orderItems[0]?.unitPrice) 
            ? item.quantity * item.orderItems[0].unitPrice
            : 0
        };
        
        orderItemsMap.get(item.orderId)?.push(orderItem);
      }
    });
    
    // Converter o mapa em array de pedidos
    return Array.from(orderItemsMap.entries()).map(([orderId, items]) => ({
      id: orderId,
      customerName: "Cliente não especificado",
      customerId: "",
      createdAt: new Date(),
      total: items.reduce((sum, item) => sum + item.total, 0),
      items: items,
      salesRepId: "",
      salesRepName: "",
      status: "delivered" as const,
      paymentStatus: "paid" as const,
      paymentMethod: ""
    }));
  };

  // Nova função para obter todos os IDs de pedidos em cargas bloqueadas
  const getLockedOrderIds = (): string[] => {
    const lockedLoads = loads.filter(load => load.locked);
    const lockedOrderIds = new Set<string>();
    
    lockedLoads.forEach(load => {
      if (load.orderIds) {
        load.orderIds.forEach(orderId => lockedOrderIds.add(orderId));
      }
    });
    
    return Array.from(lockedOrderIds);
  };

  return {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    toggleLoadLock,
    getOrdersFromLoad,
    getLockedOrderIds
  };
};
