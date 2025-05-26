
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/supabase/salesRepService';
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
        console.log("=== LOADING SALES REPS ===");
        const data = await loadSalesReps();
        console.log("✅ Successfully loaded sales reps:", data?.length || 0, "items");
        console.log("Sales reps data:", data);
        setSalesReps(data || []);
      } catch (error) {
        console.error("❌ Error loading sales reps:", error);
        toast({
          title: "Erro ao carregar vendedores",
          description: "Houve um problema ao carregar os vendedores.",
          variant: "destructive"
        });
        setSalesReps([]);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchSalesReps();
  }, []);
  
  // Generate next available code for sales reps
  const generateNextCode = (): number => {
    const nextCode = generateNextCodeService(salesReps);
    console.log("Generated next code:", nextCode);
    return nextCode;
  };
  
  // Add a new sales rep
  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
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

      if (!salesRep.email || salesRep.email.trim() === '') {
        console.error("❌ Validation failed: Email is required");
        toast({
          title: "Erro de validação",
          description: "Email é obrigatório",
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
      
      // Check for duplicate code
      const existingWithSameCode = salesReps.find(rep => rep.code === salesRep.code);
      if (existingWithSameCode) {
        console.error("❌ Validation failed: Code already exists");
        toast({
          title: "Erro de validação",
          description: `Código ${salesRep.code} já existe`,
          variant: "destructive"
        });
        return "";
      }

      // Check for duplicate email
      const existingWithSameEmail = salesReps.find(rep => rep.email === salesRep.email.trim());
      if (existingWithSameEmail) {
        console.error("❌ Validation failed: Email already exists");
        toast({
          title: "Erro de validação",
          description: `Email ${salesRep.email} já está em uso`,
          variant: "destructive"
        });
        return "";
      }
      
      // Prepare clean data for insertion with all required fields
      const cleanSalesRep: Omit<SalesRep, 'id'> = {
        code: typeof salesRep.code === 'string' ? parseInt(salesRep.code, 10) : salesRep.code,
        name: salesRep.name.trim(),
        phone: salesRep.phone || '',
        email: salesRep.email.trim(),
        active: salesRep.active ?? true,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("📝 Clean sales rep data for insertion:", cleanSalesRep);
      console.log("🚀 Calling salesRepService.add...");
      
      const id = await salesRepService.add(cleanSalesRep);
      console.log("✅ Sales rep added to Supabase with ID:", id);
      
      // Create the new sales rep object for local state
      const newSalesRep = { 
        ...cleanSalesRep, 
        id
      } as SalesRep;
      
      // Update local state
      const updatedSalesReps = [...salesReps, newSalesRep];
      console.log("📊 Updating local state with", updatedSalesReps.length, "sales reps");
      setSalesReps(updatedSalesReps);
      
      // Update local cache
      console.log("💾 Updating local cache...");
      await salesRepLocalService.setAll(updatedSalesReps);
      console.log("✅ Local cache updated successfully");
      
      toast({
        title: "✅ Vendedor adicionado",
        description: `${newSalesRep.name} foi adicionado com sucesso!`
      });
      
      console.log("=== SALES REP ADDITION COMPLETED SUCCESSFULLY ===");
      return id;
    } catch (error) {
      console.error("❌ CRITICAL ERROR adding sales rep:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        salesRep
      });
      
      toast({
        title: "❌ Erro ao adicionar vendedor",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing sales rep
  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>) => {
    try {
      console.log("=== UPDATING SALES REP ===");
      console.log("ID:", id, "Data:", salesRep);
      
      // Validation for updates
      if (salesRep.name !== undefined && (!salesRep.name || salesRep.name.trim() === '')) {
        toast({
          title: "Erro de validação",
          description: "Nome é obrigatório",
          variant: "destructive"
        });
        return;
      }

      if (salesRep.email !== undefined && (!salesRep.email || salesRep.email.trim() === '')) {
        toast({
          title: "Erro de validação",
          description: "Email é obrigatório",
          variant: "destructive"
        });
        return;
      }
      
      // Ensure code is a number if present
      if (salesRep.code && typeof salesRep.code === 'string') {
        salesRep.code = parseInt(salesRep.code, 10);
      }

      // Trim email if present
      if (salesRep.email) {
        salesRep.email = salesRep.email.trim();
      }

      // Trim name if present
      if (salesRep.name) {
        salesRep.name = salesRep.name.trim();
      }
      
      console.log("🚀 Calling salesRepService.update...");
      await salesRepService.update(id, salesRep);
      console.log("✅ Sales rep updated in Supabase");
      
      // Update local state
      const updatedSalesReps = salesReps.map(s => 
        s.id === id ? { ...s, ...salesRep } : s
      );
      setSalesReps(updatedSalesReps);
      
      // Update local cache
      await salesRepLocalService.setAll(updatedSalesReps);
      
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

  // Delete a sales rep
  const deleteSalesRep = async (id: string) => {
    try {
      console.log("=== DELETING SALES REP ===");
      console.log("ID:", id);
      
      console.log("🚀 Calling salesRepService.delete...");
      await salesRepService.delete(id);
      console.log("✅ Sales rep deleted from Supabase");
      
      // Update local state
      const updatedSalesReps = salesReps.filter(s => s.id !== id);
      setSalesReps(updatedSalesReps);
      
      // Update local cache
      await salesRepLocalService.setAll(updatedSalesReps);
      
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
  
  // Refresh sales reps from API
  const refreshSalesReps = async () => {
    setIsLoading(true);
    try {
      console.log("=== REFRESHING SALES REPS ===");
      const refreshedSalesReps = await loadSalesReps(true);
      console.log("✅ Refreshed sales reps:", refreshedSalesReps?.length || 0, "items");
      setSalesReps(refreshedSalesReps || []);
      toast({
        title: "✅ Dados atualizados",
        description: "Os dados dos vendedores foram atualizados com sucesso!"
      });
    } catch (error) {
      console.error("❌ Error refreshing sales reps:", error);
      toast({
        title: "❌ Erro ao atualizar dados",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
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
