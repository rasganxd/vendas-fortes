
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/supabase/salesRepService';
import { toast } from '@/components/ui/use-toast';
import { transformSalesRepData, transformArray } from '@/utils/dataTransformers';

// Cache key for localStorage
const SALES_REPS_CACHE_KEY = 'app_sales_reps_cache';
const SALES_REPS_CACHE_TIMESTAMP_KEY = 'app_sales_reps_cache_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes in milliseconds

// Load sales reps with caching
const loadSalesReps = async (forceRefresh = false): Promise<SalesRep[]> => {
  try {
    // Try to get from cache if not forcing refresh
    if (!forceRefresh) {
      const cachedData = localStorage.getItem(SALES_REPS_CACHE_KEY);
      const cachedTimestamp = localStorage.getItem(SALES_REPS_CACHE_TIMESTAMP_KEY);
      
      if (cachedData && cachedTimestamp) {
        const timestamp = parseInt(cachedTimestamp, 10);
        const now = Date.now();
        
        // If cache is still fresh, use it
        if (now - timestamp < CACHE_MAX_AGE) {
          return JSON.parse(cachedData) as SalesRep[];
        }
      }
    }
    
    // If not in cache or cache is stale, fetch from API
    const data = await salesRepService.getAll();
    const salesReps = transformArray(data, transformSalesRepData) as SalesRep[];
    
    // Store in localStorage cache
    localStorage.setItem(SALES_REPS_CACHE_KEY, JSON.stringify(salesReps));
    localStorage.setItem(SALES_REPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
    
    return salesReps;
  } catch (error) {
    console.error("Error loading sales reps:", error);
    
    // Try to use cached data even if expired as fallback
    const cachedData = localStorage.getItem(SALES_REPS_CACHE_KEY);
    if (cachedData) {
      return JSON.parse(cachedData) as SalesRep[];
    }
    
    throw error;
  }
};

export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setIsLoading(true);
        const data = await loadSalesReps();
        setSalesReps(data);
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
      const salesRepCode = salesRep.code || generateNextCode();
      const salesRepWithCode = { 
        ...salesRep, 
        code: typeof salesRepCode === 'string' ? parseInt(salesRepCode, 10) : salesRepCode
      };
      
      const id = await salesRepService.add(salesRepWithCode);
      const newSalesRep = { ...salesRepWithCode, id } as SalesRep;
      
      // Update local state
      setSalesReps(prev => [...prev, newSalesRep]);
      
      // Update cache
      const cachedData = localStorage.getItem(SALES_REPS_CACHE_KEY);
      if (cachedData) {
        const cached = JSON.parse(cachedData) as SalesRep[];
        cached.push(newSalesRep);
        localStorage.setItem(SALES_REPS_CACHE_KEY, JSON.stringify(cached));
        localStorage.setItem(SALES_REPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      }
      
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
      // Ensure code is a number if present
      if (salesRep.code && typeof salesRep.code === 'string') {
        salesRep.code = parseInt(salesRep.code, 10);
      }
      
      await salesRepService.update(id, salesRep);
      
      // Update local state
      const updatedSalesReps = salesReps.map(s => 
        s.id === id ? { ...s, ...salesRep } : s
      );
      setSalesReps(updatedSalesReps);
      
      // Update cache
      localStorage.setItem(SALES_REPS_CACHE_KEY, JSON.stringify(updatedSalesReps));
      localStorage.setItem(SALES_REPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
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
      await salesRepService.delete(id);
      
      // Update local state
      const updatedSalesReps = salesReps.filter(s => s.id !== id);
      setSalesReps(updatedSalesReps);
      
      // Update cache
      localStorage.setItem(SALES_REPS_CACHE_KEY, JSON.stringify(updatedSalesReps));
      localStorage.setItem(SALES_REPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
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
    generateNextCode,
    refreshSalesReps: async () => {
      setIsLoading(true);
      try {
        const refreshedSalesReps = await loadSalesReps(true);
        setSalesReps(refreshedSalesReps);
      } catch (error) {
        console.error("Error refreshing sales reps:", error);
      } finally {
        setIsLoading(false);
      }
    }
  };
};
