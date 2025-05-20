
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/firebase/salesRepService';
import { toast } from '@/components/ui/use-toast';
import { useSalesRepsService } from './useSalesRepsService';
import { salesRepLocalService } from '@/services/local/salesRepLocalService';

/**
 * Main hook for managing sales reps state and operations
 */
export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { loadSalesReps, generateNextCode: generateNextCodeService } = useSalesRepsService();
  
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching sales reps...");
        const data = await loadSalesReps();
        console.log("Loaded sales reps:", data);
        setSalesReps(data);
      } catch (error) {
        console.error("Error loading sales reps:", error);
        toast({
          title: "Erro ao carregar vendedores",
          description: "Houve um problema ao carregar os vendedores.",
          variant: "destructive"
        });
        // Set empty array instead of mock data
        setSalesReps([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalesReps();
  }, []);
  
  // Generate next available code for sales reps
  const generateNextCode = (): number => {
    return generateNextCodeService(salesReps);
  };
  
  // Add a new sales rep
  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    try {
      const salesRepCode = salesRep.code || generateNextCode();
      const salesRepWithCode = { 
        ...salesRep, 
        code: typeof salesRepCode === 'string' ? parseInt(salesRepCode, 10) : salesRepCode
      };
      
      console.log("Adding new sales rep with data:", salesRepWithCode);
      const id = await salesRepService.add(salesRepWithCode);
      const newSalesRep = { ...salesRepWithCode, id } as SalesRep;
      
      // Update local state
      const updatedSalesReps = [...salesReps, newSalesRep];
      setSalesReps(updatedSalesReps);
      
      // Update local cache
      await salesRepLocalService.setAll(updatedSalesReps);
      
      toast({
        title: "Vendedor adicionado",
        description: "Vendedor adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error adding sales rep:", error);
      toast({
        title: "Erro ao adicionar vendedor",
        description: "Houve um problema ao adicionar o vendedor. Verifique os logs para mais informações.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing sales rep
  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>) => {
    try {
      // Ensure code is a number if present
      if (salesRep.code && typeof salesRep.code === 'string') {
        salesRep.code = parseInt(salesRep.code, 10);
      }
      
      console.log("Updating sales rep:", id, salesRep);
      await salesRepService.update(id, salesRep);
      
      // Update local state
      const updatedSalesReps = salesReps.map(s => 
        s.id === id ? { ...s, ...salesRep } : s
      );
      setSalesReps(updatedSalesReps);
      
      // Update local cache
      await salesRepLocalService.setAll(updatedSalesReps);
      
      toast({
        title: "Vendedor atualizado",
        description: "Vendedor atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating sales rep:", error);
      toast({
        title: "Erro ao atualizar vendedor",
        description: "Houve um problema ao atualizar o vendedor. Verifique os logs para mais informações.",
        variant: "destructive"
      });
    }
  };

  // Delete a sales rep
  const deleteSalesRep = async (id: string) => {
    try {
      console.log("Deleting sales rep:", id);
      await salesRepService.delete(id);
      
      // Update local state
      const updatedSalesReps = salesReps.filter(s => s.id !== id);
      setSalesReps(updatedSalesReps);
      
      // Update local cache
      await salesRepLocalService.setAll(updatedSalesReps);
      
      toast({
        title: "Vendedor excluído",
        description: "Vendedor excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting sales rep:", error);
      toast({
        title: "Erro ao excluir vendedor",
        description: "Houve um problema ao excluir o vendedor. Verifique os logs para mais informações.",
        variant: "destructive"
      });
    }
  };
  
  // Refresh sales reps from API
  const refreshSalesReps = async () => {
    setIsLoading(true);
    try {
      console.log("Refreshing sales reps data...");
      const refreshedSalesReps = await loadSalesReps(true);
      setSalesReps(refreshedSalesReps);
      toast({
        title: "Dados atualizados",
        description: "Os dados dos vendedores foram atualizados com sucesso!"
      });
    } catch (error) {
      console.error("Error refreshing sales reps:", error);
      toast({
        title: "Erro ao atualizar dados",
        description: "Houve um problema ao atualizar os dados. Verifique os logs para mais informações.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return {
    salesReps,
    isLoading,
    addSalesRep,
    updateSalesRep, 
    deleteSalesRep,
    setSalesReps,
    generateNextCode,
    refreshSalesReps
  };
};
