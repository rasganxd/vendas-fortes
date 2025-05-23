import { useState, useEffect } from 'react';
import { ProductBrand } from '@/types';
import { productBrandService } from '@/services/firebase/productBrandService';
import { productBrandLocalService } from '@/services/local/productBrandLocalService';
import { toast } from '@/components/ui/use-toast';

// Cache keys
const BRANDS_CACHE_KEY = 'app_product_brands_cache';
const BRANDS_CACHE_TIMESTAMP_KEY = 'app_product_brands_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const useProductBrands = () => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Helper function to clear cache for specific item
  const clearItemCache = async (itemType: string) => {
    if (itemType === 'products') {
      localStorage.removeItem(BRANDS_CACHE_KEY);
      localStorage.removeItem(BRANDS_CACHE_TIMESTAMP_KEY);
    }
    return true;
  };

  useEffect(() => {
    // Prevent multiple load attempts
    if (hasAttemptedLoad) return;
    
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        console.log("Fetching product brands from Firebase");
        // Always try Firebase first
        const brands = await productBrandService.getAll();
        console.log(`Loaded ${brands.length} product brands from Firebase`);
        
        if (brands && brands.length > 0) {
          setProductBrands(brands);
          
          // Update local storage service
          await productBrandLocalService.setAll(brands);
          
          // Update cache
          localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(brands));
          localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } else {
          console.log("No product brands found in Firebase, creating default brands");
          
          // Create default brands if none exist
          const currentDate = new Date();
          const defaultBrands = [
            { 
              id: 'brand-1', 
              name: 'Coca-Cola', 
              description: 'Bebidas da marca Coca-Cola',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'brand-2', 
              name: 'Nestlé', 
              description: 'Produtos alimentícios Nestlé',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'brand-3', 
              name: 'Omo', 
              description: 'Produtos de limpeza Omo',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            }
          ];
          
          // Add default brands to Firebase
          for (const brand of defaultBrands) {
            try {
              await productBrandService.add(brand);
            } catch (error) {
              console.error(`Error adding default brand ${brand.name}:`, error);
            }
          }
          
          // Set default brands in state
          setProductBrands(defaultBrands);
          
          // Update local storage with default brands
          try {
            await productBrandLocalService.setAll(defaultBrands);
            
            // Update cache
            localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(defaultBrands));
            localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
          } catch (localError) {
            console.error("Error saving default brands to local storage:", localError);
          }
        }
      } catch (error) {
        console.error('Error fetching product brands:', error);
        
        // Try local storage service as fallback
        try {
          console.log("Firebase fetch failed, trying local storage");
          const localBrands = await productBrandLocalService.getAll();
          console.log(`Found ${localBrands.length} product brands in local storage`);
          
          if (localBrands && localBrands.length > 0) {
            setProductBrands(localBrands);
          } else {
            // Try to use cached data as second fallback
            const cachedData = localStorage.getItem(BRANDS_CACHE_KEY);
            if (cachedData) {
              console.log("Using cached product brands data");
              setProductBrands(JSON.parse(cachedData));
            } else {
              // If nothing worked, create default brands
              console.log("No product brands found in cache, creating default brands");
              const currentDate = new Date();
              const defaultBrands = [
                { 
                  id: 'brand-1', 
                  name: 'Coca-Cola', 
                  description: 'Bebidas da marca Coca-Cola',
                  notes: '',
                  createdAt: currentDate,
                  updatedAt: currentDate
                },
                { 
                  id: 'brand-2', 
                  name: 'Nestlé', 
                  description: 'Produtos alimentícios Nestlé',
                  notes: '',
                  createdAt: currentDate,
                  updatedAt: currentDate
                },
                { 
                  id: 'brand-3', 
                  name: 'Omo', 
                  description: 'Produtos de limpeza Omo',
                  notes: '',
                  createdAt: currentDate,
                  updatedAt: currentDate
                }
              ];
              setProductBrands(defaultBrands);
              
              toast({
                title: 'Marcas padrão criadas',
                description: 'Foram criadas marcas de produtos padrão.',
              });
            }
          }
        } catch (localError) {
          console.error('Error fetching brands from local storage:', localError);
          toast({
            title: 'Erro',
            description: 'Não foi possível carregar as marcas de produtos.',
            variant: 'destructive',
          });
          
          // Last resort - create default brands in memory only
          const currentDate = new Date();
          const defaultBrands = [
            { 
              id: 'brand-1', 
              name: 'Coca-Cola', 
              description: 'Bebidas da marca Coca-Cola',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'brand-2', 
              name: 'Nestlé', 
              description: 'Produtos alimentícios Nestlé',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'brand-3', 
              name: 'Omo', 
              description: 'Produtos de limpeza Omo',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            }
          ];
          setProductBrands(defaultBrands);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, [hasAttemptedLoad]);

  const addProductBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    try {
      const id = await productBrandService.add(brand);
      
      const newBrand = { ...brand, id } as ProductBrand;
      setProductBrands((prev) => [...prev, newBrand]);
      
      // Update local storage service
      await productBrandLocalService.add(newBrand);
      
      // Update cache
      const updatedBrands = [...productBrands, newBrand];
      localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(updatedBrands));
      localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: 'Marca adicionada',
        description: 'Marca adicionada com sucesso!',
      });
      
      return id;
    } catch (error) {
      console.error('Error adding product brand:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível adicionar a marca.',
        variant: 'destructive',
      });
      return "";
    }
  };

  const updateProductBrand = async (id: string, brand: Partial<ProductBrand>) => {
    try {
      await productBrandService.update(id, brand);
      
      setProductBrands((prev) =>
        prev.map((item) => (item.id === id ? { ...item, ...brand } : item))
      );
      
      // Update local storage service
      await productBrandLocalService.update(id, brand);
      
      // Update cache
      const updatedBrands = productBrands.map((item) => 
        item.id === id ? { ...item, ...brand } : item
      );
      localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(updatedBrands));
      localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      toast({
        title: 'Marca atualizada',
        description: 'Marca atualizada com sucesso!',
      });
    } catch (error) {
      console.error('Error updating product brand:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar a marca.',
        variant: 'destructive',
      });
    }
  };

  const deleteProductBrand = async (id: string) => {
    try {
      console.log(`Deleting brand ${id}`);
      
      // Delete from Firebase first
      await productBrandService.delete(id);
      
      // Update local state
      setProductBrands((prev) => prev.filter((item) => item.id !== id));
      
      // Update local storage service
      await productBrandLocalService.delete(id);
      
      // Update cache
      const updatedBrands = productBrands.filter((item) => item.id !== id);
      localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(updatedBrands));
      localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
      // Ensure cache consistency
      await clearItemCache('products');
      
      toast({
        title: 'Marca excluída',
        description: 'Marca excluída com sucesso!',
      });
    } catch (error) {
      console.error('Error deleting product brand:', error);
      toast({
        title: 'Erro',
        description: 'Não foi possível excluir a marca.',
        variant: 'destructive',
      });
    }
  };

  return {
    productBrands,
    isLoading,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
  };
};
