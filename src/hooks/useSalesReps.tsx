
import { useState, useEffect } from 'react';
import { SalesRep } from '@/types';
import { salesRepService } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';

export const useSalesReps = () => {
  const [salesReps, setSalesReps] = useState<SalesRep[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchSalesReps = async () => {
      try {
        setIsLoading(true);
        const data = await salesRepService.getAll();
        // Transform the data to ensure it matches SalesRep type
        const formattedData: SalesRep[] = data.map(item => ({
          id: item.id,
          code: item.code || 0,
          name: item.name || '',
          phone: item.phone || '',
          email: item.email || '',
          address: item.address || '',
          city: item.city || '',
          state: item.state || '',
          zip: item.zip || '',
          region: item.region || '',
          document: item.document || '',
          role: item.role || '',
          active: item.active || false,
          notes: item.notes || '',
          createdAt: new Date(item.created_at),
          updatedAt: new Date(item.updated_at)
        }));
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
      const supabaseData = {
        code: salesRepWithCode.code,
        name: salesRepWithCode.name,
        phone: salesRepWithCode.phone,
        email: salesRepWithCode.email,
        address: salesRepWithCode.address,
        city: salesRepWithCode.city,
        state: salesRepWithCode.state,
        zip: salesRepWithCode.zip,
        region: salesRepWithCode.region,
        document: salesRepWithCode.document,
        role: salesRepWithCode.role,
        active: salesRepWithCode.active,
        notes: salesRepWithCode.notes
      };
      
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
      const supabaseData: Record<string, any> = {};
      if (salesRep.code !== undefined) supabaseData.code = salesRep.code;
      if (salesRep.name !== undefined) supabaseData.name = salesRep.name;
      if (salesRep.phone !== undefined) supabaseData.phone = salesRep.phone;
      if (salesRep.email !== undefined) supabaseData.email = salesRep.email;
      if (salesRep.address !== undefined) supabaseData.address = salesRep.address;
      if (salesRep.city !== undefined) supabaseData.city = salesRep.city;
      if (salesRep.state !== undefined) supabaseData.state = salesRep.state;
      if (salesRep.zip !== undefined) supabaseData.zip = salesRep.zip;
      if (salesRep.region !== undefined) supabaseData.region = salesRep.region;
      if (salesRep.document !== undefined) supabaseData.document = salesRep.document;
      if (salesRep.role !== undefined) supabaseData.role = salesRep.role;
      if (salesRep.active !== undefined) supabaseData.active = salesRep.active;
      if (salesRep.notes !== undefined) supabaseData.notes = salesRep.notes;
      
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
