
import { useState, useEffect } from 'react';
import { ProductGroup } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productGroupService } from '@/services/firebase/productGroupService';

export const useProductGroups = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load product groups from Firebase
  useEffect(() => {
    const fetchProductGroups = async () => {
      setIsLoading(true);
      try {
        // Fetch the list
        const groups = await productGroupService.getAll();
        setProductGroups(groups);
        console.log(`Loaded ${groups.length} product groups from Firebase`);
      } catch (error) {
        console.error('Error fetching product groups:', error);
        toast({
          title: "Erro ao carregar grupos",
          description: "Não foi possível carregar os grupos de produtos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductGroups();
  }, []);

  const addProductGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      const id = await productGroupService.add(group);

      // Refresh groups after adding to ensure we have the latest data without duplicates
      const updatedGroups = await productGroupService.getAll();
      setProductGroups(updatedGroups);
      
      toast({
        title: "Grupo adicionado",
        description: "Grupo de produto adicionado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar grupo:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o grupo de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductGroup = async (id: string, group: Partial<ProductGroup>) => {
    try {
      await productGroupService.update(id, group);

      // Refresh the list to ensure consistency
      const groupToUpdate = productGroups.find(g => g.id === id);
      if (groupToUpdate) {
        const updatedGroup = { ...groupToUpdate, ...group, updatedAt: new Date() };
        
        setProductGroups(
          productGroups.map(pg => (pg.id === id ? updatedGroup : pg))
        );
      }
      
      toast({
        title: "Grupo atualizado",
        description: "Grupo de produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o grupo de produtos.",
        variant: "destructive"
      });
    }
  };

  const deleteProductGroup = async (id: string) => {
    try {
      // Get the name of the group before deleting
      const groupToDelete = productGroups.find(g => g.id === id);
      if (groupToDelete) {
        // Delete all groups with this name to ensure no duplicates remain
        await productGroupService.deleteAllByName(groupToDelete.name);
        
        // Refresh the list from the server
        const updatedGroups = await productGroupService.getAll();
        setProductGroups(updatedGroups);
      } else {
        // If not found in local state, just delete by ID
        await productGroupService.delete(id);
        setProductGroups(productGroups.filter(pg => pg.id !== id));
      }
      
      toast({
        title: "Grupo excluído",
        description: "Grupo de produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o grupo de produtos.",
        variant: "destructive"
      });
    }
  };

  return {
    productGroups,
    isLoading,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    setProductGroups
  };
};
