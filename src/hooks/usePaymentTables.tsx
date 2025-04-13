
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
  const { paymentTables, setPaymentTables } = useAppContext();
  const [isLoading, setIsLoading] = useState(false);
  
  // Load payment tables when the hook is first used
  useEffect(() => {
    if (paymentTables.length === 0) {
      console.log("Initial load of payment tables");
      setIsLoading(true);
      loadPaymentTables().then(tables => {
        if (tables.length > 0) {
          console.log("Setting payment tables:", tables);
          setPaymentTables(tables);
        }
        setIsLoading(false);
      });
    }
  }, []);

  const addPaymentTable = async (paymentTable: Omit<PaymentTable, 'id'>) => {
    try {
      const id = await paymentTableService.add(paymentTable);
      const newPaymentTable = { ...paymentTable, id };
      setPaymentTables([...paymentTables, newPaymentTable]);
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
      await paymentTableService.update(id, paymentTable);
      setPaymentTables(paymentTables.map(p => 
        p.id === id ? { ...p, ...paymentTable } : p
      ));
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
      setPaymentTables(paymentTables.filter(p => p.id !== id));
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
