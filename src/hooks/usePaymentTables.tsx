
import { useState, useEffect } from 'react';
import { PaymentTable, PaymentTableInstallment, PaymentTableTerm } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';
import { paymentTableService } from '@/services/supabase';

export const loadPaymentTables = async (): Promise<PaymentTable[]> => {
  try {
    console.log("Loading payment tables from Supabase");
    const { data, error } = await supabase
      .from('payment_tables')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) {
      console.error("Error loading payment tables:", error);
      throw error;
    }
    
    console.log("Available payment tables:", data);
    
    // Load payment table terms for each table
    const tables = await Promise.all(data.map(async (table) => {
      // Load terms
      const { data: termsData, error: termsError } = await supabase
        .from('payment_table_terms')
        .select('*')
        .eq('payment_table_id', table.id)
        .order('installment', { ascending: true });
      
      if (termsError) {
        console.error("Error loading terms for table:", table.id, termsError);
      }

      // Load installments (if separate from terms)
      const { data: installmentsData, error: installmentsError } = await supabase
        .from('payment_table_installments')
        .select('*')
        .eq('payment_table_id', table.id)
        .order('installment', { ascending: true });
      
      if (installmentsError) {
        console.error("Error loading installments for table:", table.id, installmentsError);
      }
      
      // Transform data to match PaymentTable type
      return {
        id: table.id,
        name: table.name,
        description: table.description || '',
        payableTo: table.payable_to || '',
        paymentLocation: table.payment_location || '',
        type: table.type || '',
        notes: table.notes || '',
        active: table.active,
        // Convert terms from database format to application format
        terms: termsData ? termsData.map(term => ({
          id: term.id,
          days: term.days,
          percentage: term.percentage,
          description: term.description || '',
          installment: term.installment
        })) : [],
        // Convert installments from database format to application format
        installments: installmentsData ? installmentsData.map(inst => ({
          installment: inst.installment,
          percentage: inst.percentage,
          days: inst.days,
          id: inst.id,
          description: inst.description || ''
        })) : [],
        createdAt: new Date(table.created_at),
        updatedAt: new Date(table.updated_at)
      };
    }));
    
    console.log("Loaded payment tables with terms:", tables);
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
      console.log("Adding payment table:", paymentTable);
      
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
        terms: [], // Terms will be added separately
        installments: [], // Installments will be added separately
        createdAt: new Date(newPaymentTableFromDb.created_at),
        updatedAt: new Date(newPaymentTableFromDb.updated_at)
      };
      
      console.log("Payment table created:", newPaymentTable);
      
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
      console.log("Updating payment table:", id, paymentTable);
      
      // Transform PaymentTable to match Supabase schema for base table data
      const supabaseData: Record<string, any> = {};
      
      if (paymentTable.name !== undefined) supabaseData.name = paymentTable.name;
      if (paymentTable.description !== undefined) supabaseData.description = paymentTable.description;
      if (paymentTable.payableTo !== undefined) supabaseData.payable_to = paymentTable.payableTo;
      if (paymentTable.paymentLocation !== undefined) supabaseData.payment_location = paymentTable.paymentLocation;
      if (paymentTable.type !== undefined) supabaseData.type = paymentTable.type;
      if (paymentTable.notes !== undefined) supabaseData.notes = paymentTable.notes;
      if (paymentTable.active !== undefined) supabaseData.active = paymentTable.active;

      // Only update table data if there are changes to base fields
      if (Object.keys(supabaseData).length > 0) {
        const { error } = await supabase
          .from('payment_tables')
          .update(supabaseData)
          .eq('id', id);
        
        if (error) {
          throw error;
        }
      }
      
      // Handle terms update if provided
      if (paymentTable.terms && Array.isArray(paymentTable.terms)) {
        // First delete existing terms
        const { error: deleteError } = await supabase
          .from('payment_table_terms')
          .delete()
          .eq('payment_table_id', id);
        
        if (deleteError) {
          throw deleteError;
        }
        
        // Then insert new terms if there are any
        if (paymentTable.terms.length > 0) {
          const termsToInsert = paymentTable.terms.map(term => ({
            payment_table_id: id,
            days: term.days,
            percentage: term.percentage,
            description: term.description || '',
            installment: term.installment
          }));
          
          const { error: insertError } = await supabase
            .from('payment_table_terms')
            .insert(termsToInsert);
          
          if (insertError) {
            throw insertError;
          }
        }

        // Update installments table as well to keep them in sync
        if (paymentTable.installments && Array.isArray(paymentTable.installments)) {
          // Delete existing installments
          const { error: deleteInstError } = await supabase
            .from('payment_table_installments')
            .delete()
            .eq('payment_table_id', id);
          
          if (deleteInstError) {
            throw deleteInstError;
          }
          
          // Insert new installments
          if (paymentTable.installments.length > 0) {
            const installmentsToInsert = paymentTable.installments.map(inst => ({
              payment_table_id: id,
              days: inst.days,
              percentage: inst.percentage,
              description: inst.description || '',
              installment: inst.installment
            }));
            
            const { error: insertInstError } = await supabase
              .from('payment_table_installments')
              .insert(installmentsToInsert);
            
            if (insertInstError) {
              throw insertInstError;
            }
          }
        }
      }
      
      console.log("Payment table updated successfully");
      
      // Update local state
      const currentTable = paymentTables.find(p => p.id === id);
      if (currentTable) {
        const updatedTable = { ...currentTable, ...paymentTable };
        
        // Update both local and context state
        const updatedTables = paymentTables.map(p => 
          p.id === id ? updatedTable : p
        );
        
        setLocalPaymentTables(updatedTables);
        setPaymentTables(updatedTables);
      } else {
        // If the table wasn't found locally, reload all tables
        const tables = await loadPaymentTables();
        setLocalPaymentTables(tables);
        setPaymentTables(tables);
      }
    } catch (error) {
      console.error("Erro ao atualizar tabela de pagamento:", error);
      toast({
        title: "Erro ao atualizar tabela de pagamento",
        description: "Houve um problema ao atualizar a tabela de pagamento.",
        variant: "destructive"
      });
      throw error; // Re-throw for the caller to handle
    }
  };

  const deletePaymentTable = async (id: string): Promise<void> => {
    try {
      // First delete all related terms
      const { error: termsError } = await supabase
        .from('payment_table_terms')
        .delete()
        .eq('payment_table_id', id);
      
      if (termsError) {
        console.error("Error deleting terms:", termsError);
        // Continue anyway to try to delete the table
      }
      
      // Delete all related installments
      const { error: installmentsError } = await supabase
        .from('payment_table_installments')
        .delete()
        .eq('payment_table_id', id);
      
      if (installmentsError) {
        console.error("Error deleting installments:", installmentsError);
        // Continue anyway to try to delete the table
      }
      
      // Now delete the payment table
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
      throw error; // Re-throw for the caller to handle
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
