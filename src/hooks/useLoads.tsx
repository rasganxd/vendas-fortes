
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
    
    return load.items.map(item => {
      // Cria um array de OrderItems com os tipos corretos
      const orderItems: OrderItem[] = item.orderItems.map(orderItem => ({
        id: orderItem.id,
        productId: orderItem.productId,
        productName: orderItem.productName,
        quantity: orderItem.quantity,
        unitPrice: orderItem.unitPrice || 0,
        total: orderItem.quantity * (orderItem.unitPrice || 0)
      }));
      
      // Retorna um objeto Order completo
      return {
        id: item.orderId,
        customerName: "Cliente não especificado", // LoadItem não tem customerName
        customerId: "",  // Campo obrigatório para Order
        createdAt: new Date(), // LoadItem não tem orderDate
        total: 0, // LoadItem não tem orderTotal
        items: orderItems,
        salesRepId: "",
        salesRepName: "",
        status: "delivered" as const,
        paymentStatus: "paid" as const,
        paymentMethod: "" // Add default empty paymentMethod
      };
    });
  };

  return {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    getOrdersFromLoad
  };
};
