
import { Load, Order } from '@/types';
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
      
      const id = await loadService.add(cleanedLoad);
      const newLoad = { ...cleanedLoad, id } as Load;
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
      
      await loadService.update(id, cleanedLoad);
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
      await loadService.delete(id);
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
    return load.items.map(item => ({
      id: item.orderId,
      customerName: item.customerName || "Cliente não especificado",
      customerId: "",  // Campo obrigatório para Order
      createdAt: item.orderDate || new Date(),
      total: item.orderTotal || 0,
      items: item.orderItems.map(orderItem => ({
        id: orderItem.id,
        productId: orderItem.id,
        productName: orderItem.productName,
        quantity: orderItem.quantity,
        price: orderItem.price || 0,
        subtotal: orderItem.quantity * (orderItem.price || 0)
      })),
      // Campos adicionais obrigatórios para Order
      salesRepId: "",
      salesRepName: "",
      status: "delivered",
      paymentStatus: "paid"
    }));
  };

  return {
    loads,
    addLoad,
    updateLoad,
    deleteLoad,
    getOrdersFromLoad
  };
};
