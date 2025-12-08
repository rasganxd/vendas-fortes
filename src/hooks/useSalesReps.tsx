import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { externalSupabase as supabase } from '@/integrations/supabase/externalClient';
import { toast } from '@/components/ui/use-toast';
import { transformSalesRepData } from '@/utils/dataTransformers';

export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadSalesReps();
  }, []);

  const loadSalesReps = async () => {
    try {
      setIsLoading(true);
      console.log("=== LOADING SALES REPS ===");
      
      // Não incluir senha na consulta por segurança
      const { data, error } = await supabase
        .from('sales_reps')
        .select('id, code, name, phone, email, active, created_at, updated_at')
        .eq('active', true)
        .order('name');

      if (error) {
        console.error('❌ Error loading sales reps:', error);
        throw error;
      }

      console.log("✅ Successfully loaded sales reps:", data?.length || 0, "items");
      
      // Transform the data to match SalesRep interface
      const transformedData = (data || []).map(transformSalesRepData).filter(Boolean) as SalesRep[];
      setSalesReps(transformedData);
    } catch (error) {
      console.error('❌ Error loading sales reps:', error);
      toast({
        title: "Erro ao carregar vendedores",
        description: "Houve um problema ao carregar os vendedores.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>): Promise<string> => {
    try {
      console.log("=== ADDING NEW SALES REP ===");
      console.log("Input data:", salesRep);
      
      // Validate required fields
      if (!salesRep.name || salesRep.name.trim() === '') {
        console.error("❌ Validation failed: Name is required");
        toast({
          title: "Erro de validação",
          description: "Nome é obrigatório",
          variant: "destructive"
        });
        return "";
      }
      
      if (!salesRep.code) {
        console.error("❌ Validation failed: Code is required");
        toast({
          title: "Erro de validação", 
          description: "Código é obrigatório",
          variant: "destructive"
        });
        return "";
      }

      if (!salesRep.password) {
        console.error("❌ Validation failed: Password is required for new sales rep");
        toast({
          title: "Erro de validação",
          description: "Senha é obrigatória para novos vendedores",
          variant: "destructive"
        });
        return "";
      }
      
      // Check for duplicate code
      const existingWithSameCode = salesReps.find(sr => sr.code === salesRep.code);
      if (existingWithSameCode) {
        console.error("❌ Validation failed: Code already exists");
        toast({
          title: "Erro de validação",
          description: `Código ${salesRep.code} já existe`,
          variant: "destructive"
        });
        return "";
      }

      // Hash da senha usando a função do banco
      const { data: hashedPassword, error: hashError } = await supabase
        .rpc('hash_password', { password: salesRep.password });

      if (hashError) {
        console.error('❌ Error hashing password:', hashError);
        throw hashError;
      }
      
      const { data, error } = await supabase
        .from('sales_reps')
        .insert({
          name: salesRep.name,
          code: salesRep.code,
          phone: salesRep.phone || '',
          email: salesRep.email || '', // Email opcional
          password: hashedPassword,
          active: salesRep.active,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('id, code, name, phone, email, active, created_at, updated_at')
        .single();

      if (error) {
        console.error('❌ Error adding sales rep:', error);
        throw error;
      }

      const newSalesRep = transformSalesRepData(data);
      if (newSalesRep) {
        setSalesReps([...salesReps, newSalesRep]);
        
        toast({
          title: "✅ Vendedor adicionado",
          description: `${newSalesRep.name} foi adicionado com sucesso!`
        });
        
        console.log("=== SALES REP ADDITION COMPLETED SUCCESSFULLY ===");
        return newSalesRep.id;
      }
      
      return "";
    } catch (error) {
      console.error("❌ CRITICAL ERROR adding sales rep:", error);
      
      toast({
        title: "❌ Erro ao adicionar vendedor",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return "";
    }
  };

  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>): Promise<void> => {
    try {
      console.log("=== UPDATING SALES REP ===");
      console.log("ID:", id, "Data:", salesRep);

      let updateData: any = {
        name: salesRep.name,
        code: salesRep.code,
        phone: salesRep.phone,
        email: salesRep.email || '', // Email opcional
        active: salesRep.active,
        updated_at: new Date().toISOString()
      };

      // Se senha foi fornecida, fazer hash
      if (salesRep.password) {
        const { data: hashedPassword, error: hashError } = await supabase
          .rpc('hash_password', { password: salesRep.password });

        if (hashError) {
          console.error('❌ Error hashing password:', hashError);
          throw hashError;
        }

        updateData.password = hashedPassword;
      }
      
      const { error } = await supabase
        .from('sales_reps')
        .update(updateData)
        .eq('id', id);

      if (error) {
        console.error('❌ Error updating sales rep:', error);
        throw error;
      }
      
      // Update local state (sem senha)
      const { password, ...salesRepWithoutPassword } = salesRep;
      setSalesReps(salesReps.map(sr => sr.id === id ? { ...sr, ...salesRepWithoutPassword } : sr));
      
      toast({
        title: "✅ Vendedor atualizado",
        description: "Vendedor atualizado com sucesso!"
      });
      
      console.log("=== SALES REP UPDATE COMPLETED ===");
    } catch (error) {
      console.error("❌ Error updating sales rep:", error);
      toast({
        title: "❌ Erro ao atualizar vendedor",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const deleteSalesRep = async (id: string) => {
    try {
      console.log("=== DELETING SALES REP ===");
      console.log("ID:", id);
      
      const { error } = await supabase
        .from('sales_reps')
        .update({ active: false, updated_at: new Date().toISOString() })
        .eq('id', id);

      if (error) {
        console.error('❌ Error deleting sales rep:', error);
        throw error;
      }
      
      // Update local state
      setSalesReps(salesReps.filter(sr => sr.id !== id));
      
      toast({
        title: "✅ Vendedor excluído",
        description: "Vendedor excluído com sucesso!"
      });
      
      console.log("=== SALES REP DELETION COMPLETED ===");
    } catch (error) {
      console.error("❌ Error deleting sales rep:", error);
      toast({
        title: "❌ Erro ao excluir vendedor",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const generateNextSalesRepCode = async (): Promise<number> => {
    try {
      const { data, error } = await supabase.rpc('get_next_sales_rep_code');
      
      if (error) {
        console.error('Error calling get_next_sales_rep_code RPC:', error);
        // Fallback: get max code and add 1
        const maxCode = salesReps.length > 0 ? Math.max(...salesReps.map(sr => sr.code || 0)) : 0;
        return maxCode + 1;
      }
      
      return data || 1;
    } catch (error) {
      console.error('Error generating sales rep code:', error);
      return salesReps.length > 0 ? Math.max(...salesReps.map(sr => sr.code || 0)) + 1 : 1;
    }
  };

  return {
    salesReps,
    isLoading,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep,
    generateNextSalesRepCode,
    refreshSalesReps: loadSalesReps
  };
};
