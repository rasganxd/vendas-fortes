
import { useState, useEffect } from 'react';
import { ProductGroup } from '@/types';
import { productGroupService } from '@/services/supabase/productGroupService';
import { toast } from '@/components/ui/use-toast';

export const useProductGroups = () => {
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
        console.log(`Loaded ${groups.length} product groups from Supabase`);
        
        setProductGroups(groups);
      } catch (error) {
        console.error('Error fetching product groups:', error);
        setProductGroups([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchGroups();
  }, [hasAttemptedLoad]);

  const addProductGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      const id = await productGroupService.add(group);
      
      const newGroup = { ...group, id } as ProductGroup;
      setProductGroups((prev) => [...prev, newGroup]);
      
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

  return {
    productGroups,
    isLoading,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
  };
};
