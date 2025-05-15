
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productCategoryService } from '@/services/supabase';
import { transformArray, transformProductCategoryData } from '@/utils/dataTransformers';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load categories from Supabase when component mounts
  useEffect(() => {
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        const data = await productCategoryService.getAll();
        const transformedCategories = transformArray(data, transformProductCategoryData) as ProductCategory[];
        
        // If we got categories from Supabase, use them
        if (transformedCategories && transformedCategories.length > 0) {
          setProductCategories(transformedCategories);
          console.log(`Loaded ${transformedCategories.length} product categories from Supabase`);
        } else {
          // If no categories in Supabase, use default ones
          console.log("No product categories found in Supabase, using defaults");
          const currentDate = new Date();
          const defaultCategories = [
            { 
              id: '1', 
              name: 'Refrigerantes', 
              description: 'Refrigerantes em lata e garrafa',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: '2', 
              name: 'Cervejas', 
              description: 'Cervejas em lata e garrafa',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: '3', 
              name: 'Biscoitos', 
              description: 'Biscoitos e bolachas',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: '4', 
              name: 'Detergentes', 
              description: 'Detergentes líquidos e em pó',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            }
          ];
          setProductCategories(defaultCategories);
          
          // Add the default categories to Supabase
          defaultCategories.forEach(async (category) => {
            try {
              await addProductCategory(category);
            } catch (error) {
              console.error("Error adding default category:", error);
            }
          });
        }
      } catch (error) {
        console.error("Error loading product categories:", error);
        // Fallback to default categories if there's an error
        const currentDate = new Date();
        setProductCategories([
          { 
            id: '1', 
            name: 'Refrigerantes', 
            description: 'Refrigerantes em lata e garrafa',
            notes: '',
            createdAt: currentDate,
            updatedAt: currentDate
          },
          { 
            id: '2', 
            name: 'Cervejas', 
            description: 'Cervejas em lata e garrafa',
            notes: '',
            createdAt: currentDate,
            updatedAt: currentDate
          },
          { 
            id: '3', 
            name: 'Biscoitos', 
            description: 'Biscoitos e bolachas',
            notes: '',
            createdAt: currentDate,
            updatedAt: currentDate
          },
          { 
            id: '4', 
            name: 'Detergentes', 
            description: 'Detergentes líquidos e em pó',
            notes: '',
            createdAt: currentDate,
            updatedAt: currentDate
          }
        ]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, []);

  const addProductCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      // Prepare data for Supabase - FIXED: Added createdAt and updatedAt
      const supabaseData = {
        name: category.name,
        description: category.description || '',
        notes: category.notes || '',
        createdAt: category.createdAt || new Date(),
        updatedAt: category.updatedAt || new Date()
      };

      const id = await productCategoryService.add(supabaseData);
      const newCategory: ProductCategory = { 
        ...category, 
        id,
        notes: category.notes || '',
        createdAt: category.createdAt || new Date(),
        updatedAt: category.updatedAt || new Date()
      };
      setProductCategories([...productCategories, newCategory]);
      toast({
        title: "Categoria adicionada",
        description: "Categoria de produto adicionada com sucesso!"
      });
      return id;
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
      // Prepare data for Supabase
      const supabaseData = {
        name: category.name,
        description: category.description,
        notes: category.notes,
      };

      await productCategoryService.update(id, supabaseData);
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
      await productCategoryService.delete(id);
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
