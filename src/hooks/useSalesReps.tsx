
import { SalesRep } from '@/types';
import { useAppContext } from './useAppContext';
import { toast } from '@/components/ui/use-toast';

// Create a simple load function for consistency with other hooks
export const loadSalesReps = async (): Promise<SalesRep[]> => {
  try {
    // No salesRepService yet, so return empty array
    // In a real implementation, you would call a service here
    return [];
  } catch (error) {
    console.error("Erro ao carregar representantes:", error);
    return [];
  }
};

export const useSalesReps = () => {
  const { salesReps, setSalesReps } = useAppContext();
  
  // Function to generate next available code
  const generateNextCode = (): number => {
    if (salesReps.length === 0) return 1;
    
    // Find the highest existing code
    const highestCode = salesReps.reduce(
      (max, rep) => (rep.code && rep.code > max ? rep.code : max), 
      0
    );
    
    // Return the next code in sequence
    return highestCode + 1;
  };

  // Generate ID
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const addSalesRep = (salesRep: Omit<SalesRep, 'id' | 'code'>) => {
    try {
      const id = generateId();
      // Generate next available code
      const code = generateNextCode();
      
      const newSalesRep = { ...salesRep, id, code };
      setSalesReps([...salesReps, newSalesRep]);
      toast({
        title: "Representante adicionado",
        description: "Representante adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar representante:", error);
      toast({
        title: "Erro ao adicionar representante",
        description: "Houve um problema ao adicionar o representante.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateSalesRep = (id: string, salesRep: Partial<SalesRep>) => {
    try {
      setSalesReps(salesReps.map(s => 
        s.id === id ? { ...s, ...salesRep } : s
      ));
      toast({
        title: "Representante atualizado",
        description: "Representante atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar representante:", error);
      toast({
        title: "Erro ao atualizar representante",
        description: "Houve um problema ao atualizar o representante.",
        variant: "destructive"
      });
    }
  };

  const deleteSalesRep = (id: string) => {
    try {
      setSalesReps(salesReps.filter(s => s.id !== id));
      toast({
        title: "Representante excluído",
        description: "Representante excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir representante:", error);
      toast({
        title: "Erro ao excluir representante",
        description: "Houve um problema ao excluir o representante.",
        variant: "destructive"
      });
    }
  };

  return {
    salesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep
  };
};
