
import { useState } from 'react';
import { ProductGroup } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useProductGroups = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([
    { id: '1', name: 'Bebidas', description: 'Bebidas em geral' },
    { id: '2', name: 'Alimentos', description: 'Alimentos em geral' },
    { id: '3', name: 'Limpeza', description: 'Produtos de limpeza' },
    { id: '4', name: 'Higiene', description: 'Produtos de higiene pessoal' }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addProductGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 9);
      const newGroup = { ...group, id: newId };
      setProductGroups([...productGroups, newGroup]);
      toast({
        title: "Grupo adicionado",
        description: "Grupo de produto adicionado com sucesso!"
      });
      return newId;
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
      setProductGroups(
        productGroups.map(pg => (pg.id === id ? { ...pg, ...group } : pg))
      );
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
      setProductGroups(productGroups.filter(pg => pg.id !== id));
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
