import { useState, useEffect } from 'react';
import { PaymentTable } from '@/types';
import { paymentTableService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadPaymentTables = async (): Promise<PaymentTable[]> => {
  try {
    console.log("Loading payment tables from Firebase");
    const tables = await paymentTableService.getAll();
    console.log("Loaded payment tables:", tables);
    return tables;
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
      // Add creation timestamp if not present
      const paymentTableWithTimestamp = {
        ...paymentTable,
        createdAt: paymentTable.createdAt || new Date()
      };

      const id = await paymentTableService.add(paymentTableWithTimestamp);
      const newPaymentTable = { ...paymentTableWithTimestamp, id };
      
      console.log("Added payment table:", newPaymentTable);
      
      // Update both local and context state with the new table
      const updatedTables = [...paymentTables, newPaymentTable];
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
      // Add update timestamp
      const updateData = {
        ...paymentTable,
        updatedAt: new Date()
      };
      
      await paymentTableService.update(id, updateData);
      
      // Update both local and context state
      const updatedTables = paymentTables.map(p => 
        p.id === id ? { ...p, ...updateData } : p
      );
      
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
