
import { SalesRep } from '@/types';
import { useAppContext } from './useAppContext';
import { toast } from '@/components/ui/use-toast';

export const useSalesReps = () => {
  const { salesReps, setSalesReps } = useAppContext();

  // Função para gerar ID único
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const addSalesRep = (salesRep: Omit<SalesRep, 'id'>) => {
    try {
      const id = generateId();
      const newSalesRep = { ...salesRep, id };
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
