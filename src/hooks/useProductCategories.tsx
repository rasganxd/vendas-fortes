
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types';
import { productCategoryService } from '@/services/supabase/productCategoryService';
import { toast } from '@/components/ui/use-toast';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  useEffect(() => {
    if (hasAttemptedLoad) return;
    
    const fetchCategories = async () => {
      try {
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        console.log("Fetching product categories from Supabase");
        const categories = await productCategoryService.getAll();
        console.log(`Loaded ${categories.length} product categories from Supabase`);
        
        setProductCategories(categories);
      } catch (error) {
        console.error('Error fetching product categories:', error);
        setProductCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCategories();
  }, [hasAttemptedLoad]);

  const addProductCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      const id = await productCategoryService.add(category);
      
      const newCategory = { ...category, id } as ProductCategory;
      setProductCategories((prev) => [...prev, newCategory]);
      
      toast({
        title: 'Categoria adicionada',
        description: 'Categoria adicionada com sucesso!',
      });
      
      return id;
    } catch (error) {
      console.error('Error adding product category:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a categoria.',
        variant: 'destructive',
      });
      return "";
    }
  };

  const updateProductCategory = async (id: string, category: Partial<ProductCategory>) => {
    try {
      await productCategoryService.update(id, category);
      
      setProductCategories((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...category } : item))
      );
      
      toast({
        title: 'Categoria atualizada',
        description: 'Categoria atualizada com sucesso!',
      });
    } catch (error) {
      console.error('Error updating product category:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a categoria.',
        variant: 'destructive',
      });
    }
  };

  const deleteProductCategory = async (id: string) => {
    try {
      await productCategoryService.delete(id);
      
      setProductCategories((prev) => prev.filter((item) => item.id !== id));
      
      toast({
        title: 'Categoria excluída',
        description: 'Categoria excluída com sucesso!',
      });
    } catch (error) {
      console.error('Error deleting product category:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a categoria.',
        variant: 'destructive',
      });
    }
  };

  return {
    productCategories,
    isLoading,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
  };
};
