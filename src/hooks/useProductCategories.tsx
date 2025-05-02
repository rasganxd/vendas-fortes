
import { useState } from 'react';
import { ProductCategory } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useProductCategories = () => {
  const currentDate = new Date();
  
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([
    { 
      id: '1', 
      name: 'Refrigerantes', 
      groupId: '1', 
      description: 'Refrigerantes em lata e garrafa',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    },
    { 
      id: '2', 
      name: 'Cervejas', 
      groupId: '1', 
      description: 'Cervejas em lata e garrafa',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    },
    { 
      id: '3', 
      name: 'Biscoitos', 
      groupId: '2', 
      description: 'Biscoitos e bolachas',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    },
    { 
      id: '4', 
      name: 'Detergentes', 
      groupId: '3', 
      description: 'Detergentes líquidos e em pó',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addProductCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 9);
      const newCategory: ProductCategory = { 
        ...category, 
        id: newId,
        notes: category.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProductCategories([...productCategories, newCategory]);
      toast({
        title: "Categoria adicionada",
        description: "Categoria de produto adicionada com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a categoria de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductCategory = async (id: string, category: Partial<ProductCategory>) => {
    try {
      setProductCategories(
        productCategories.map(pc => (pc.id === id ? { 
          ...pc, 
          ...category,
          updatedAt: new Date()
        } : pc))
      );
      toast({
        title: "Categoria atualizada",
        description: "Categoria de produto atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a categoria de produtos.",
        variant: "destructive"
      });
    }
  };

  const deleteProductCategory = async (id: string) => {
    try {
      setProductCategories(productCategories.filter(pc => pc.id !== id));
      toast({
        title: "Categoria excluída",
        description: "Categoria de produto excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a categoria de produtos.",
        variant: "destructive"
      });
    }
  };

  return {
    productCategories,
    isLoading,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    setProductCategories
  };
};
