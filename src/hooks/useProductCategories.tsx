import { useState, useEffect } from 'react';
import { ProductCategory } from '@/types';
import { toast } from 'sonner';
import { productCategoryService } from '@/services/firebase/productCategoryService';
import { transformArray, transformProductCategoryData } from '@/utils/dataTransformers';

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

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
              await addProductCategory(category);
            } catch (error) {
              console.error("Error adding default category:", error);
              // Continue with next category even if one fails
            }
          }
        }
      } catch (error) {
        console.error("Error loading product categories:", error);
        
        // Show error toast only once
        toast.error("Erro ao carregar categorias", {
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
  }, [hasAttemptedLoad]);

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
      // Keep track of whether we've already shown a toast
      let toastShown = false;
      
      await productCategoryService.delete(id);
      setProductCategories(productCategories.filter(pc => pc.id !== id));
      
      // Only show success toast if we haven't shown one yet
      if (!toastShown) {
        toast.success("Categoria excluída", {
          description: "Categoria de produto excluída com sucesso!"
        });
        toastShown = true;
      }
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      
      // Only show error toast if we haven't shown one yet
      toast.error("Erro ao excluir", {
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
