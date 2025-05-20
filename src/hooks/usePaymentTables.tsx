import { useState, useEffect } from 'react';
import { PaymentTable, PaymentTableInstallment, PaymentTableTerm } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';
import { paymentTableService } from '@/services/firebase/paymentTableService';

export const loadPaymentTables = async (): Promise<PaymentTable[]> => {
  try {
    console.log("Loading payment tables from Firebase");
    return await paymentTableService.getAll();
  } catch (error) {
    console.error("Erro ao carregar tabelas de pagamento:", error);
    return [];
  }
};

export const usePaymentTables = () => {
  const { paymentTables: contextTables, setPaymentTables, isLoadingPaymentTables } = useAppContext();
  const [paymentTables, setLocalPaymentTables] = useState<PaymentTable[]>(contextTables || []);
  const [isLoading, setIsLoading] = useState(isLoadingPaymentTables);
  
  // Load payment tables when the hook is first used
  useEffect(() => {
    const fetchPaymentTables = async () => {
      try {
        console.log("Initial load of payment tables");
        setIsLoading(true);
        const tables = await loadPaymentTables();
        if (tables.length > 0) {
          console.log("Setting payment tables:", tables);
          setLocalPaymentTables(tables);
          setPaymentTables(tables);
        }
      } catch (error) {
        console.error("Erro ao carregar tabelas de pagamento:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentTables();
  }, []);

  // Keep local state synchronized with context
  useEffect(() => {
    if (contextTables && contextTables.length > 0) {
      setLocalPaymentTables(contextTables);
    }
  }, [contextTables]);

  const addPaymentTable = async (paymentTable: Omit<PaymentTable, 'id'>) => {
    try {
      console.log("Adding payment table:", paymentTable);
      
      const id = await paymentTableService.add(paymentTable);
      
      if (!id) {
        throw new Error("Failed to add payment table");
      }
      
      // Get the full table with the ID
      const newTable = await paymentTableService.getById(id);
      
      if (!newTable) {
        throw new Error("Failed to retrieve added payment table");
      }
      
      // Update both local and context state with the new table
      const updatedTables = [...paymentTables, newTable];
      setLocalPaymentTables(updatedTables);
      setPaymentTables(updatedTables);
      
      toast({
        title: "Tabela de pagamento adicionada",
        description: "Tabela de pagamento adicionada com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar tabela de pagamento:", error);
      toast({
        title: "Erro ao adicionar tabela de pagamento",
        description: "Houve um problema ao adicionar a tabela de pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updatePaymentTable = async (id: string, paymentTable: Partial<PaymentTable>): Promise<void> => {
    try {
      console.log("Updating payment table:", id, paymentTable);
      
      await paymentTableService.update(id, paymentTable);
      
      // Get updated table data
      const updatedTable = await paymentTableService.getById(id);
      
      if (!updatedTable) {
        throw new Error("Failed to retrieve updated payment table");
      }
      
      // Update local state
      const updatedTables = paymentTables.map(p => p.id === id ? updatedTable : p);
      setLocalPaymentTables(updatedTables);
      setPaymentTables(updatedTables);
      
      toast({
        title: "Tabela de pagamento atualizada",
        description: "Tabela de pagamento atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar tabela de pagamento:", error);
      toast({
        title: "Erro ao atualizar tabela de pagamento",
        description: "Houve um problema ao atualizar a tabela de pagamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  const deletePaymentTable = async (id: string): Promise<void> => {
    try {
      await paymentTableService.delete(id);
      
      // Update both local and context state
      const updatedTables = paymentTables.filter(p => p.id !== id);
      setLocalPaymentTables(updatedTables);
      setPaymentTables(updatedTables);
      
      toast({
        title: "Tabela de pagamento excluída",
        description: "Tabela de pagamento excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir tabela de pagamento:", error);
      toast({
        title: "Erro ao excluir tabela de pagamento",
        description: "Houve um problema ao excluir a tabela de pagamento.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    paymentTables,
    addPaymentTable,
    updatePaymentTable,
    deletePaymentTable,
    isLoading,
    setPaymentTables
  };
};
