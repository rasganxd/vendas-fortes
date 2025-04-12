
import { useState, useEffect } from 'react';
import { ProductGroup } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useProductGroups = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for product groups
    const initialProductGroups: ProductGroup[] = [
      { id: '1', name: 'Alimentos', description: 'Produtos alimentícios' },
      { id: '2', name: 'Bebidas', description: 'Bebidas diversas' },
      { id: '3', name: 'Limpeza', description: 'Produtos de limpeza' },
    ];
    
    setProductGroups(initialProductGroups);
    setIsLoading(false);
  }, []);

  const addProductGroup = async (productGroup: Omit<ProductGroup, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 11);
      const newProductGroup = { ...productGroup, id: newId };
      setProductGroups([...productGroups, newProductGroup]);
      toast({
        title: "Grupo de produto adicionado",
        description: "Grupo de produto adicionado com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar grupo de produto:", error);
      toast({
        title: "Erro ao adicionar grupo de produto",
        description: "Houve um problema ao adicionar o grupo de produto.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductGroup = async (id: string, productGroup: Partial<ProductGroup>) => {
    try {
      setProductGroups(productGroups.map(pg => 
        pg.id === id ? { ...pg, ...productGroup } : pg
      ));
      toast({
        title: "Grupo de produto atualizado",
        description: "Grupo de produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar grupo de produto:", error);
      toast({
        title: "Erro ao atualizar grupo de produto",
        description: "Houve um problema ao atualizar o grupo de produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProductGroup = async (id: string) => {
    try {
      setProductGroups(productGroups.filter(pg => pg.id !== id));
      toast({
        title: "Grupo de produto excluído",
        description: "Grupo de produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir grupo de produto:", error);
      toast({
        title: "Erro ao excluir grupo de produto",
        description: "Houve um problema ao excluir o grupo de produto.",
        variant: "destructive"
      });
    }
  };

  return {
    productGroups,
    isLoading,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  };
};
