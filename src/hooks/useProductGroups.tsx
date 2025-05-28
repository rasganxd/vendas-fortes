
import { useState, useEffect } from 'react';
import { ProductGroup } from '@/types';
import { productGroupService } from '@/services/supabase/productGroupService';
import { toast } from '@/components/ui/use-toast';

export const useProductGroups = () => {
  console.log("=== useProductGroups iniciado ===");
  
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    if (hasAttemptedLoad) return;
    
    const fetchGroups = async () => {
      try {
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        console.log("Fetching product groups from Supabase");
        const groups = await productGroupService.getAll();
        console.log(`Loaded ${groups.length} product groups from Supabase:`, groups);
        
        setProductGroups(groups);
      } catch (error) {
        console.error('Error fetching product groups:', error);
        setProductGroups([]);
      } finally {
        setIsLoading(false);
        console.log("useProductGroups - loading finished");
      }
    };

    fetchGroups();
  }, [hasAttemptedLoad]);

  const addProductGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      console.log("addProductGroup - adding:", group);
      const id = await productGroupService.add(group);
      
      const newGroup = { ...group, id } as ProductGroup;
      setProductGroups((prev) => {
        const updated = [...prev, newGroup];
        console.log("addProductGroup - updated groups:", updated);
        return updated;
      });
      
      toast({
        title: 'Grupo adicionado',
        description: 'Grupo adicionado com sucesso!',
      });
      
      return id;
    } catch (error) {
      console.error('Error adding product group:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar o grupo.',
        variant: 'destructive',
      });
      return "";
    }
  };

  const updateProductGroup = async (id: string, group: Partial<ProductGroup>) => {
    try {
      console.log("updateProductGroup - updating:", id, group);
      await productGroupService.update(id, group);
      
      setProductGroups((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...group } : item))
      );
      
      toast({
        title: 'Grupo atualizado',
        description: 'Grupo atualizado com sucesso!',
      });
    } catch (error) {
      console.error('Error updating product group:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar o grupo.',
        variant: 'destructive',
      });
    }
  };

  const deleteProductGroup = async (id: string) => {
    try {
      console.log("deleteProductGroup - deleting:", id);
      await productGroupService.delete(id);
      
      setProductGroups((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: 'Grupo excluído',
        description: 'Grupo excluído com sucesso!',
      });
    } catch (error) {
      console.error('Error deleting product group:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir o grupo.',
        variant: 'destructive',
      });
    }
  };

  console.log("useProductGroups - current state:", {
    groupsCount: productGroups.length,
    isLoading,
    hasAttemptedLoad
  });

  return {
    productGroups,
    isLoading,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
  };
};
