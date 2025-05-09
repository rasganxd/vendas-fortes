
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { mockSalesReps } from '@/data/mock';

export const loadSalesReps = async (): Promise<SalesRep[]> => {
  try {
    const { data, error } = await supabase
      .from('sales_reps')
      .select('*')
      .order('name');
      
    if (error) {
      throw error;
    }
    
    return data.map(rep => ({
      id: rep.id,
      code: rep.code || 0,
      name: rep.name,
      email: rep.email || '',
      phone: rep.phone || '',
      document: rep.document || '',
      notes: rep.notes || '',
      address: rep.address || '',
      city: rep.city || '',
      state: rep.state || '',
      zip: rep.zip || '',
      createdAt: new Date(rep.created_at || new Date()),
      updatedAt: new Date(rep.updated_at || new Date()),
      role: rep.role || 'sales',
      active: rep.active || true
    })) as SalesRep[];
  } catch (error) {
    console.error("Error loading sales reps:", error);
    // If Supabase fails, return mock data
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
      
      // Transform to Supabase format
      const supabaseSalesRep = {
        code: salesRep.code,
        name: salesRep.name,
        email: salesRep.email,
        phone: salesRep.phone,
        document: salesRep.document,
        notes: salesRep.notes,
        address: salesRep.address,
        city: salesRep.city,
        state: salesRep.state,
        zip: salesRep.zip,
        role: salesRep.role,
        active: salesRep.active
      };
      
      // Add to Supabase
      const { data, error } = await supabase
        .from('sales_reps')
        .insert(supabaseSalesRep)
        .select();
        
      if (error) {
        throw error;
      }
      
      const newSalesRepData = data[0];
      
      // Transform to our app format
      const newSalesRep: SalesRep = {
        id: newSalesRepData.id,
        code: newSalesRepData.code || 0,
        name: newSalesRepData.name,
        email: newSalesRepData.email || '',
        phone: newSalesRepData.phone || '',
        document: newSalesRepData.document || '',
        notes: newSalesRepData.notes || '',
        address: newSalesRepData.address || '',
        city: newSalesRepData.city || '',
        state: newSalesRepData.state || '',
        zip: newSalesRepData.zip || '',
        createdAt: new Date(newSalesRepData.created_at || new Date()),
        updatedAt: new Date(newSalesRepData.updated_at || new Date()),
        role: newSalesRepData.role || 'sales',
        active: newSalesRepData.active || true
      };
      
      // Update local state
      setSalesReps([...salesReps, newSalesRep]);
      toast({
        title: "Representante adicionado",
        description: "Representante adicionado com sucesso!"
      });
      return newSalesRep.id;
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
      // Transform to Supabase format
      const supabaseUpdate: Record<string, any> = {};
      
      if (salesRep.name !== undefined) supabaseUpdate.name = salesRep.name;
      if (salesRep.code !== undefined) supabaseUpdate.code = salesRep.code;
      if (salesRep.email !== undefined) supabaseUpdate.email = salesRep.email;
      if (salesRep.phone !== undefined) supabaseUpdate.phone = salesRep.phone;
      if (salesRep.document !== undefined) supabaseUpdate.document = salesRep.document;
      if (salesRep.notes !== undefined) supabaseUpdate.notes = salesRep.notes;
      if (salesRep.address !== undefined) supabaseUpdate.address = salesRep.address;
      if (salesRep.city !== undefined) supabaseUpdate.city = salesRep.city;
      if (salesRep.state !== undefined) supabaseUpdate.state = salesRep.state;
      if (salesRep.zip !== undefined) supabaseUpdate.zip = salesRep.zip;
      if (salesRep.role !== undefined) supabaseUpdate.role = salesRep.role;
      if (salesRep.active !== undefined) supabaseUpdate.active = salesRep.active;
      
      // Update in Supabase
      const { error } = await supabase
        .from('sales_reps')
        .update(supabaseUpdate)
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
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
      // Delete from Supabase
      const { error } = await supabase
        .from('sales_reps')
        .delete()
        .eq('id', id);
      
      if (error) {
        throw error;
      }
      
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
