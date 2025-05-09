
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/supabase';
import { toast } from '@/components/ui/use-toast';
import { transformSalesRepData, transformArray, prepareForSupabase } from '@/utils/dataTransformers';

export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setIsLoading(true);
        const data = await salesRepService.getAll();
        // Transform the data to ensure it matches SalesRep type
        const formattedData = transformArray(data, transformSalesRepData) as SalesRep[];
        setSalesReps(formattedData);
      } catch (error) {
        console.error("Error loading sales reps:", error);
        toast({
          title: "Erro ao carregar vendedores",
          description: "Houve um problema ao carregar os vendedores.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalesReps();
  }, []);
  
  // Add generateNextCode function for sales reps
  const generateNextCode = (): number => {
    if (salesReps.length === 0) return 1;
    
    const highestCode = salesReps.reduce(
      (max, rep) => (rep.code && rep.code > max ? rep.code : max), 
      0
    );
    
    return highestCode + 1;
  };
  
  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    try {
      console.log("Adding sales rep to Supabase:", salesRep);
      
      const salesRepCode = salesRep.code || generateNextCode();
      const salesRepWithCode = { ...salesRep, code: salesRepCode };
      
      // Transform to Supabase format (snake_case)
      const supabaseData = prepareForSupabase(salesRepWithCode);
      
      const id = await salesRepService.add(supabaseData);
      const newSalesRep = { ...salesRepWithCode, id } as SalesRep;
      
      setSalesReps(prev => [...prev, newSalesRep]);
      toast({
        title: "Vendedor adicionado",
        description: "Vendedor adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error adding sales rep:", error);
      toast({
        title: "Erro ao adicionar vendedor",
        description: "Houve um problema ao adicionar o vendedor.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>) => {
    try {
      console.log("Updating sales rep in Supabase:", id, salesRep);
      
      // Transform to Supabase format (snake_case)
      const supabaseData = prepareForSupabase(salesRep);
      
      await salesRepService.update(id, supabaseData);
      
      setSalesReps(salesReps.map(s => 
        s.id === id ? { ...s, ...salesRep } : s
      ));
      toast({
        title: "Vendedor atualizado",
        description: "Vendedor atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating sales rep:", error);
      toast({
        title: "Erro ao atualizar vendedor",
        description: "Houve um problema ao atualizar o vendedor.",
        variant: "destructive"
      });
    }
  };

  const deleteSalesRep = async (id: string) => {
    try {
      console.log("Deleting sales rep from Supabase:", id);
      
      await salesRepService.delete(id);
      
      setSalesReps(salesReps.filter(s => s.id !== id));
      toast({
        title: "Vendedor excluído",
        description: "Vendedor excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting sales rep:", error);
      toast({
        title: "Erro ao excluir vendedor",
        description: "Houve um problema ao excluir o vendedor.",
        variant: "destructive"
      });
    }
  };
  
  return {
    salesReps,
    isLoading,
    addSalesRep,
    updateSalesRep, 
    deleteSalesRep,
    setSalesReps,
    generateNextCode
  };
};
