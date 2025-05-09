
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load sales reps when the hook is first used
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('sales_reps')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        // Transform the data to match SalesRep type
        const loadedSalesReps: SalesRep[] = data.map(rep => ({
          id: rep.id,
          code: rep.code || 0,
          name: rep.name,
          phone: rep.phone || '',
          email: rep.email || '',
          address: rep.address || '',
          city: rep.city || '',
          state: rep.state || '',
          zip: rep.zip || '',
          region: rep.region || '',
          document: rep.document || '',
          role: rep.role || '',
          active: rep.active !== false, // Default to true if not specified
          notes: rep.notes || '',
          createdAt: new Date(rep.created_at),
          updatedAt: new Date(rep.updated_at)
        }));
        
        setSalesReps(loadedSalesReps);
      } catch (error) {
        console.error("Error loading sales reps:", error);
        toast({
          title: "Erro ao carregar representantes",
          description: "Houve um problema ao carregar os representantes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchSalesReps();
  }, []);

  const addSalesRep = async (salesRep: Omit<SalesRep, 'id'>) => {
    try {
      // Transform SalesRep to match Supabase schema
      const supabaseRep = {
        code: salesRep.code,
        name: salesRep.name,
        phone: salesRep.phone || '',
        email: salesRep.email || '',
        address: salesRep.address || '',
        city: salesRep.city || '',
        state: salesRep.state || '',
        zip: salesRep.zip || '',
        region: salesRep.region || '',
        document: salesRep.document || '',
        role: salesRep.role || '',
        active: salesRep.active !== false,
        notes: salesRep.notes || ''
      };

      // Add to Supabase
      const { data, error } = await supabase
        .from('sales_reps')
        .insert(supabaseRep)
        .select();
        
      if (error) {
        throw error;
      }
      
      const newRepFromDb = data[0];
      
      // Transform back to SalesRep type
      const newRep: SalesRep = {
        id: newRepFromDb.id,
        code: newRepFromDb.code || 0,
        name: newRepFromDb.name,
        phone: newRepFromDb.phone || '',
        email: newRepFromDb.email || '',
        address: newRepFromDb.address || '',
        city: newRepFromDb.city || '',
        state: newRepFromDb.state || '',
        zip: newRepFromDb.zip || '',
        region: newRepFromDb.region || '',
        document: newRepFromDb.document || '',
        role: newRepFromDb.role || '',
        active: newRepFromDb.active !== false,
        notes: newRepFromDb.notes || '',
        createdAt: new Date(newRepFromDb.created_at),
        updatedAt: new Date(newRepFromDb.updated_at)
      };
      
      // Update local state
      setSalesReps([...salesReps, newRep]);
      toast({
        title: "Representante adicionado",
        description: "Representante adicionado com sucesso!"
      });
      return newRep.id;
    } catch (error) {
      console.error("Error adding sales rep:", error);
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
      // Transform SalesRep to match Supabase schema
      const supabaseRep: Record<string, any> = {};
      
      if (salesRep.code !== undefined) supabaseRep.code = salesRep.code;
      if (salesRep.name !== undefined) supabaseRep.name = salesRep.name;
      if (salesRep.phone !== undefined) supabaseRep.phone = salesRep.phone;
      if (salesRep.email !== undefined) supabaseRep.email = salesRep.email;
      if (salesRep.address !== undefined) supabaseRep.address = salesRep.address;
      if (salesRep.city !== undefined) supabaseRep.city = salesRep.city;
      if (salesRep.state !== undefined) supabaseRep.state = salesRep.state;
      if (salesRep.zip !== undefined) supabaseRep.zip = salesRep.zip;
      if (salesRep.region !== undefined) supabaseRep.region = salesRep.region;
      if (salesRep.document !== undefined) supabaseRep.document = salesRep.document;
      if (salesRep.role !== undefined) supabaseRep.role = salesRep.role;
      if (salesRep.active !== undefined) supabaseRep.active = salesRep.active;
      if (salesRep.notes !== undefined) supabaseRep.notes = salesRep.notes;
      
      // Update in Supabase
      const { error } = await supabase
        .from('sales_reps')
        .update(supabaseRep)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setSalesReps(salesReps.map(rep => 
        rep.id === id ? { ...rep, ...salesRep } : rep
      ));
      toast({
        title: "Representante atualizado",
        description: "Representante atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating sales rep:", error);
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
      setSalesReps(salesReps.filter(rep => rep.id !== id));
      toast({
        title: "Representante excluído",
        description: "Representante excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting sales rep:", error);
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
    setSalesReps
  };
};
