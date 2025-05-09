import { useState, useEffect } from 'react';
import { PaymentTable } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadPaymentTables = async (): Promise<PaymentTable[]> => {
  try {
    console.log("Loading payment tables from Supabase");
    const { data, error } = await supabase
      .from('payment_tables')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      throw error;
    }
    
    // Transform data to match PaymentTable type
    return data.map(table => ({
      id: table.id,
      name: table.name,
      description: table.description || '',
      payableTo: table.payable_to || '',
      paymentLocation: table.payment_location || '',
      type: table.type || '',
      notes: table.notes || '',
      active: table.active,
      terms: [], // Terms will need to be loaded separately
      installments: [], // Add the required property
      createdAt: new Date(table.created_at),
      updatedAt: new Date(table.updated_at)
    }));
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
        name: paymentTable.name,
        description: paymentTable.description || '',
        payable_to: paymentTable.payableTo || '',
        payment_location: paymentTable.paymentLocation || '',
        type: paymentTable.type || '',
        notes: paymentTable.notes || '',
        active: paymentTable.active !== undefined ? paymentTable.active : true
      };

      const { data, error } = await supabase
        .from('payment_tables')
        .insert(paymentTableWithTimestamp)
        .select();

      if (error) {
        throw error;
      }
      
      const newPaymentTableFromDb = data[0];
      
      const newPaymentTable: PaymentTable = {
        id: newPaymentTableFromDb.id,
        name: newPaymentTableFromDb.name,
        description: newPaymentTableFromDb.description || '',
        payableTo: newPaymentTableFromDb.payable_to || '',
        paymentLocation: newPaymentTableFromDb.payment_location || '',
        type: newPaymentTableFromDb.type || '',
        notes: newPaymentTableFromDb.notes || '',
        active: newPaymentTableFromDb.active,
        terms: [], // Terms will need to be handled separately
        installments: [], // Add the required property
        createdAt: new Date(newPaymentTableFromDb.created_at),
        updatedAt: new Date(newPaymentTableFromDb.updated_at)
      };
      
      // Update both local and context state with the new table
      const updatedTables = [...paymentTables, newPaymentTable];
      setLocalPaymentTables(updatedTables);
      setPaymentTables(updatedTables);
      
      toast({
        title: "Tabela de pagamento adicionada",
        description: "Tabela de pagamento adicionada com sucesso!"
      });
      return newPaymentTable.id;
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
      // Transform PaymentTable to match Supabase schema
      const supabaseData: Record<string, any> = {};
      
      if (paymentTable.name !== undefined) supabaseData.name = paymentTable.name;
      if (paymentTable.description !== undefined) supabaseData.description = paymentTable.description;
      if (paymentTable.payableTo !== undefined) supabaseData.payable_to = paymentTable.payableTo;
      if (paymentTable.paymentLocation !== undefined) supabaseData.payment_location = paymentTable.paymentLocation;
      if (paymentTable.type !== undefined) supabaseData.type = paymentTable.type;
      if (paymentTable.notes !== undefined) supabaseData.notes = paymentTable.notes;
      if (paymentTable.active !== undefined) supabaseData.active = paymentTable.active;
      
      const { error } = await supabase
        .from('payment_tables')
        .update(supabaseData)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
      // Update both local and context state
      const updatedTables = paymentTables.map(p => 
        p.id === id ? { ...p, ...paymentTable } : p
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
      const { error } = await supabase
        .from('payment_tables')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
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
