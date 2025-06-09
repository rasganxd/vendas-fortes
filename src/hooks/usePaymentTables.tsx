
import { useState, useEffect } from 'react';
import { PaymentTable, PaymentTableInstallment, PaymentTableTerm } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';
import { paymentTableService } from '@/services/supabase/paymentTableService';

export const loadPaymentTables = async (): Promise<PaymentTable[]> => {
  try {
    console.log("🔄 [usePaymentTables] Loading payment tables from Supabase");
    const tables = await paymentTableService.getAll();
    console.log("✅ [usePaymentTables] Loaded payment tables:", tables);
    return tables;
  } catch (error) {
    console.error("❌ [usePaymentTables] Error loading payment tables:", error);
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
        console.log("🔄 [usePaymentTables] Initial load of payment tables");
        setIsLoading(true);
        const tables = await loadPaymentTables();
        if (tables.length > 0) {
          console.log("✅ [usePaymentTables] Setting payment tables:", tables);
          setLocalPaymentTables(tables);
          setPaymentTables(tables);
        }
      } catch (error) {
        console.error("❌ [usePaymentTables] Error loading payment tables:", error);
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
      console.log("➕ [usePaymentTables] Adding payment table:", paymentTable);
      
      const id = await paymentTableService.add(paymentTable);
      
      if (!id) {
        throw new Error("Failed to add payment table");
      }
      
      // Get the full table with the ID
      const newTable = await paymentTableService.getById(id);
      
      if (!newTable) {
        throw new Error("Failed to retrieve added payment table");
      }
      
      console.log("✅ [usePaymentTables] Added payment table:", newTable);
      
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
      console.error("❌ [usePaymentTables] Error adding payment table:", error);
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
      console.log("🔄 [usePaymentTables] Updating payment table:", id, paymentTable);
      
      // Ensure we preserve all existing data when updating
      const existingTable = paymentTables.find(t => t.id === id);
      if (!existingTable) {
        throw new Error("Payment table not found");
      }

      // Merge the update with existing data, ensuring important fields are preserved
      const updateData = {
        ...paymentTable,
        updatedAt: new Date()
      };

      console.log("📤 [usePaymentTables] Sending update data:", updateData);
      
      await paymentTableService.update(id, updateData);
      
      // Get updated table data
      const updatedTable = await paymentTableService.getById(id);
      
      if (!updatedTable) {
        throw new Error("Failed to retrieve updated payment table");
      }
      
      console.log("✅ [usePaymentTables] Updated payment table:", updatedTable);
      
      // Update local state
      const updatedTables = paymentTables.map(p => p.id === id ? updatedTable : p);
      setLocalPaymentTables(updatedTables);
      setPaymentTables(updatedTables);
      
      toast({
        title: "Tabela de pagamento atualizada",
        description: "Tabela de pagamento atualizada com sucesso!"
      });
    } catch (error) {
      console.error("❌ [usePaymentTables] Error updating payment table:", error);
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
      console.log("🗑️ [usePaymentTables] Deleting payment table:", id);
      
      await paymentTableService.delete(id);
      
      // Update both local and context state
      const updatedTables = paymentTables.filter(p => p.id !== id);
      setLocalPaymentTables(updatedTables);
      setPaymentTables(updatedTables);
      
      console.log("✅ [usePaymentTables] Deleted payment table successfully");
      
      toast({
        title: "Tabela de pagamento excluída",
        description: "Tabela de pagamento excluída com sucesso!"
      });
    } catch (error) {
      console.error("❌ [usePaymentTables] Error deleting payment table:", error);
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
