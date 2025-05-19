
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
          setProductCategories(transformedCategories);
          console.log(`Loaded ${transformedCategories.length} product categories from Firebase`);
        } else {
          // If no categories in Firebase, use default ones
          console.log("No product categories found in Firebase, using defaults");
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
          
          // Add the default categories to Firebase
          for (const category of defaultCategories) {
            try {
              // Don't show toast notifications for default categories
              await addProductCategoryWithoutToast(category);
            } catch (error) {
              console.error("Error adding default category:", error);
              // Continue with next category even if one fails
            }
          }
        }
      } catch (error) {
        console.error("Error loading product categories:", error);
        
        // Show error toast only once with new notification system
        notification.error("Erro ao carregar categorias", {
          description: "Não foi possível carregar as categorias de produtos. Usando padrões."
        });
        
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
  }, [hasAttemptedLoad, notification]);

  // Internal helper to add category without toast notifications
  const addProductCategoryWithoutToast = async (category: Omit<ProductCategory, 'id'>) => {
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
