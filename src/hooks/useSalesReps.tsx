import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { salesRepService } from '@/firebase/firestoreService'; 
import { toast } from '@/components/ui/use-toast';
import { mockSalesReps } from '@/data/mock';

export const loadSalesReps = async (): Promise<SalesRep[]> => {
  try {
    const salesReps = await salesRepService.getAll();
    return salesReps;
  } catch (error) {
    console.error("Error loading sales reps:", error);
    // If Firebase fails, return mock data
    return mockSalesReps;
  }
};

export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize sales reps when component mounts
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setIsLoading(true);
        const loadedSalesReps = await loadSalesReps();
        setSalesReps(loadedSalesReps);
      } catch (error) {
        console.error("Error loading sales reps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesReps();
  }, []);
  
  // Function to generate next available code
  const generateNextCode = (): number => {
    if (salesReps.length === 0) return 1;
    
    // Find the highest existing code
    const highestCode = salesReps.reduce(
      (max, salesRep) => (salesRep.code && salesRep.code > max ? salesRep.code : max), 
      0
    );
    
    // Return the next code in sequence
    return highestCode + 1;
  };

  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    try {
      // If no code is provided, generate one
      if (!salesRep.code) {
        salesRep.code = generateNextCode();
      }
      
      // Add to Firebase
      const id = await salesRepService.add(salesRep);
      const newSalesRep = { ...salesRep, id } as SalesRep;
      
      // Update local state
      setSalesReps([...salesReps, newSalesRep]);
      toast({
        title: "Representante adicionado",
        description: "Representante adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar representante:", error);
      toast({
        title: "Erro ao adicionar representante",
        description: "Houve um problema ao adicionar o representante.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>) => {
    try {
      // Update in Firebase
      await salesRepService.update(id, salesRep);
      
      // Update local state
      setSalesReps(salesReps.map(s => 
        s.id === id ? { ...s, ...salesRep } : s
      ));
      toast({
        title: "Representante atualizado",
        description: "Representante atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar representante:", error);
      toast({
        title: "Erro ao atualizar representante",
        description: "Houve um problema ao atualizar o representante.",
        variant: "destructive"
      });
    }
  };

  const deleteSalesRep = async (id: string) => {
    try {
      // Delete from Firebase
      await salesRepService.delete(id);
      
      // Update local state
      setSalesReps(salesReps.filter(s => s.id !== id));
      toast({
        title: "Representante excluído",
        description: "Representante excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir representante:", error);
      toast({
        title: "Erro ao excluir representante",
        description: "Houve um problema ao excluir o representante.",
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
    generateNextCode,
    setSalesReps
  };
};
