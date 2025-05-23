
import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types';
import { productCategoryService } from '@/services/firebase/productCategoryService';
import { transformArray, transformProductCategoryData } from '@/utils/dataTransformers';
import { useNotification } from '@/hooks/useNotification';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);
  const { notification } = useNotification();

  // Load categories from Firebase when component mounts
  useEffect(() => {
    // Prevent multiple load attempts in rapid succession
    if (hasAttemptedLoad) return;
    
    const loadCategories = async () => {
      try {
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        console.log('Attempting to load product categories from Firebase');
        const data = await productCategoryService.getAll();
        const transformedCategories = transformArray(data, transformProductCategoryData) as ProductCategory[];
        
        // If we got categories from Firebase, use them
        if (transformedCategories && transformedCategories.length > 0) {
          console.log(`Loaded ${transformedCategories.length} product categories from Firebase`);
          
          // Remove any duplicates that might exist
          const uniqueCategories = transformedCategories.reduce((acc: ProductCategory[], current) => {
            const existingCategory = acc.find(item => item.name === current.name);
            if (!existingCategory) {
              acc.push(current);
            } else {
              console.log(`Found duplicate category with name: ${current.name}, keeping only one instance`);
            }
            return acc;
          }, []);
          
          setProductCategories(uniqueCategories);
        } else {
          // If no categories in Firebase, show empty state
          console.log("No product categories found in Firebase");
          setProductCategories([]);
          notification.info("Nenhuma categoria encontrada", {
            description: "Você precisa criar categorias de produtos para utilizá-las."
          });
        }
      } catch (error) {
        console.error("Error loading product categories:", error);
        
        notification.error("Erro ao carregar categorias", {
          description: "Não foi possível carregar as categorias de produtos."
        });
        
        // Set empty array instead of defaults to prevent duplication
        setProductCategories([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadCategories();
  }, [hasAttemptedLoad, notification]);

  // Internal helper to add category without toast notifications
  const addProductCategoryWithoutToast = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      // Check if category with same name already exists to prevent duplicates
      const existingCategories = await productCategoryService.getAllByName(category.name);
      if (existingCategories && existingCategories.length > 0) {
        console.log(`Category with name '${category.name}' already exists, skipping...`);
        return existingCategories[0].id;
      }
      
      // Prepare data for Supabase
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
      setProductCategories(prev => {
        // Check if this category already exists in the state
        const exists = prev.some(c => c.name === newCategory.name);
        if (exists) return prev;
        return [...prev, newCategory];
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar categoria sem notificação:", error);
      return "";
    }
  };

  const addProductCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      // Prepare data for Supabase
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
      setProductCategories(prev => [...prev, newCategory]);
      
      // Show a single notification with our new system
      notification.success("Categoria adicionada", {
        description: "Categoria de produto adicionada com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      
      notification.error("Erro ao adicionar", {
        description: "Não foi possível adicionar a categoria de produtos."
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
      
      // Show a single notification with our new system
      notification.success("Categoria atualizada", {
        description: "Categoria de produto atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      
      notification.error("Erro ao atualizar", {
        description: "Não foi possível atualizar a categoria de produtos."
      });
    }
  };

  const deleteProductCategory = async (id: string) => {
    try {
      await productCategoryService.delete(id);
      setProductCategories(productCategories.filter(pc => pc.id !== id));
      
      notification.success("Categoria excluída", {
        description: "Categoria de produto excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      
      notification.error("Erro ao excluir", {
        description: "Não foi possível excluir a categoria de produtos."
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
