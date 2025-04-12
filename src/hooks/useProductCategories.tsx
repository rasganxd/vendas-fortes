
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for product categories
    const initialProductCategories: ProductCategory[] = [
      { id: '1', name: 'Laticínios', groupId: '1', description: 'Produtos derivados do leite' },
      { id: '2', name: 'Refrigerantes', groupId: '2', description: 'Bebidas gaseificadas' },
      { id: '3', name: 'Detergentes', groupId: '3', description: 'Produtos para limpeza geral' },
    ];
    
    setProductCategories(initialProductCategories);
    setIsLoading(false);
  }, []);

  const addProductCategory = async (productCategory: Omit<ProductCategory, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 11);
      const newProductCategory = { ...productCategory, id: newId };
      setProductCategories([...productCategories, newProductCategory]);
      toast({
        title: "Categoria de produto adicionada",
        description: "Categoria de produto adicionada com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar categoria de produto:", error);
      toast({
        title: "Erro ao adicionar categoria de produto",
        description: "Houve um problema ao adicionar a categoria de produto.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductCategory = async (id: string, productCategory: Partial<ProductCategory>) => {
    try {
      setProductCategories(productCategories.map(pc => 
        pc.id === id ? { ...pc, ...productCategory } : pc
      ));
      toast({
        title: "Categoria de produto atualizada",
        description: "Categoria de produto atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar categoria de produto:", error);
      toast({
        title: "Erro ao atualizar categoria de produto",
        description: "Houve um problema ao atualizar a categoria de produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProductCategory = async (id: string) => {
    try {
      setProductCategories(productCategories.filter(pc => pc.id !== id));
      toast({
        title: "Categoria de produto excluída",
        description: "Categoria de produto excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir categoria de produto:", error);
      toast({
        title: "Erro ao excluir categoria de produto",
        description: "Houve um problema ao excluir a categoria de produto.",
        variant: "destructive"
      });
    }
  };

  return {
    productCategories,
    isLoading,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  };
};
