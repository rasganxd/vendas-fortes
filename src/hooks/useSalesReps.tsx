
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadSalesReps = async (): Promise<SalesRep[]> => {
  try {
    console.log("Loading sales reps from Supabase");
    const { data, error } = await supabase
      .from('sales_reps')
      .select('*')
      .order('name', { ascending: true });
      
    if (error) {
      throw error;
    }
    
    // Transform data to match SalesRep type
    return data.map(salesRep => ({
      id: salesRep.id,
      name: salesRep.name,
      email: salesRep.email || '',
      phone: salesRep.phone || '',
      document: salesRep.document || '',
      code: salesRep.code || 0,
      address: salesRep.address || '',
      city: salesRep.city || '',
      state: salesRep.state || '',
      zip: salesRep.zip || '',
      region: salesRep.region || '',
      notes: salesRep.notes || '',
      role: salesRep.role || '',
      active: salesRep.active !== undefined ? salesRep.active : true,
      createdAt: new Date(salesRep.created_at),
      updatedAt: new Date(salesRep.updated_at)
    }));
  } catch (error) {
    console.error("Error loading sales reps:", error);
    return [];
  }
};

export const useSalesReps = () => {
  const { salesReps: contextSalesReps, setSalesReps: setContextSalesReps } = useAppContext();
  const [salesReps, setLocalSalesReps] = useState<SalesRep[]>(contextSalesReps || []);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setIsLoading(true);
        const loadedSalesReps = await loadSalesReps();
        setLocalSalesReps(loadedSalesReps);
        setContextSalesReps(loadedSalesReps);
      } catch (error) {
        console.error("Error loading sales reps:", error);
      } finally {
        setIsLoading(false);
      }
    };

    if (!contextSalesReps || contextSalesReps.length === 0) {
      fetchSalesReps();
    } else {
      setLocalSalesReps(contextSalesReps);
      setIsLoading(false);
    }
  }, [contextSalesReps, setContextSalesReps]);

  // Generate a new code for a sales rep
  const generateNextCode = (): number => {
    if (salesReps.length === 0) return 1;
    
    const highestCode = salesReps.reduce(
      (max, salesRep) => (salesRep.code && salesRep.code > max ? salesRep.code : max), 
      0
    );
    
    return highestCode + 1;
  };

  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    try {
      // If no code is provided, generate one
      if (!salesRep.code) {
        salesRep.code = generateNextCode();
      }
      
      // Prepare data for Supabase
      const supabaseData = {
        name: salesRep.name,
        email: salesRep.email || '',
        phone: salesRep.phone || '',
        document: salesRep.document || '',
        code: salesRep.code || 0,
        address: salesRep.address || '',
        city: salesRep.city || '',
        state: salesRep.state || '',
        zip: salesRep.zip || '',
        region: salesRep.region || '',
        notes: salesRep.notes || '',
        role: salesRep.role || '',
        active: salesRep.active !== undefined ? salesRep.active : true
      };

      // Add to Supabase
      const { data, error } = await supabase
        .from('sales_reps')
        .insert(supabaseData)
        .select('*');

      if (error) {
        throw error;
      }

      const newSalesRepFromDb = data[0];

      // Transform data to match SalesRep type
      const newSalesRep: SalesRep = {
        id: newSalesRepFromDb.id,
        name: newSalesRepFromDb.name,
        email: newSalesRepFromDb.email || '',
        phone: newSalesRepFromDb.phone || '',
        document: newSalesRepFromDb.document || '',
        code: newSalesRepFromDb.code || 0,
        address: newSalesRepFromDb.address || '',
        city: newSalesRepFromDb.city || '',
        state: newSalesRepFromDb.state || '',
        zip: newSalesRepFromDb.zip || '',
        region: newSalesRepFromDb.region || '',
        notes: newSalesRepFromDb.notes || '',
        role: newSalesRepFromDb.role || '',
        active: newSalesRepFromDb.active !== undefined ? newSalesRepFromDb.active : true,
        createdAt: new Date(newSalesRepFromDb.created_at),
        updatedAt: new Date(newSalesRepFromDb.updated_at)
      };

      // Update local and context state
      const updatedSalesReps = [...salesReps, newSalesRep];
      setLocalSalesReps(updatedSalesReps);
      setContextSalesReps(updatedSalesReps);

      toast({
        title: "Representante adicionado",
        description: "Representante de vendas adicionado com sucesso!"
      });

      return newSalesRep.id;
    } catch (error) {
      console.error("Erro ao adicionar representante:", error);
      toast({
        title: "Erro ao adicionar representante",
        description: "Houve um problema ao adicionar o representante de vendas.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateSalesRep = async (id: string, salesRep: Partial<SalesRep>): Promise<void> => {
    try {
      // Prepare data for Supabase
      const supabaseData: Record<string, any> = {};
      
      if (salesRep.name !== undefined) supabaseData.name = salesRep.name;
      if (salesRep.email !== undefined) supabaseData.email = salesRep.email;
      if (salesRep.phone !== undefined) supabaseData.phone = salesRep.phone;
      if (salesRep.document !== undefined) supabaseData.document = salesRep.document;
      if (salesRep.code !== undefined) supabaseData.code = salesRep.code;
      if (salesRep.address !== undefined) supabaseData.address = salesRep.address;
      if (salesRep.city !== undefined) supabaseData.city = salesRep.city;
      if (salesRep.state !== undefined) supabaseData.state = salesRep.state;
      if (salesRep.zip !== undefined) supabaseData.zip = salesRep.zip;
      if (salesRep.region !== undefined) supabaseData.region = salesRep.region;
      if (salesRep.notes !== undefined) supabaseData.notes = salesRep.notes;
      if (salesRep.role !== undefined) supabaseData.role = salesRep.role;
      if (salesRep.active !== undefined) supabaseData.active = salesRep.active;
      
      // Update in Supabase
      const { error } = await supabase
        .from('sales_reps')
        .update(supabaseData)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local and context state
      const updatedSalesReps = salesReps.map(sr => 
        sr.id === id ? { ...sr, ...salesRep } : sr
      );
      setLocalSalesReps(updatedSalesReps);
      setContextSalesReps(updatedSalesReps);
      
      toast({
        title: "Representante atualizado",
        description: "Representante de vendas atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar representante:", error);
      toast({
        title: "Erro ao atualizar representante",
        description: "Houve um problema ao atualizar o representante de vendas.",
        variant: "destructive"
      });
    }
  };

  const deleteSalesRep = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('sales_reps')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local and context state
      const updatedSalesReps = salesReps.filter(sr => sr.id !== id);
      setLocalSalesReps(updatedSalesReps);
      setContextSalesReps(updatedSalesReps);
      
      toast({
        title: "Representante excluído",
        description: "Representante de vendas excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir representante:", error);
      toast({
        title: "Erro ao excluir representante",
        description: "Houve um problema ao excluir o representante de vendas.",
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
    setSalesReps: setLocalSalesReps,
    generateNextCode
  };
};
