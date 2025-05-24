
import { useState, useEffect } from 'react';
import { ProductBrand } from '@/types';
import { productBrandService } from '@/services/supabase/productBrandService';
import { toast } from '@/components/ui/use-toast';

// Cache keys
const BRANDS_CACHE_KEY = 'app_product_brands_cache';
const BRANDS_CACHE_TIMESTAMP_KEY = 'app_product_brands_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const useProductBrands = () => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Function to force reload brands from Supabase
  const forceRefreshBrands = async () => {
    console.log("Force refreshing product brands from Supabase");
    setIsLoading(true);
    
    try {
      // Clear cache
      localStorage.removeItem(BRANDS_CACHE_KEY);
      localStorage.removeItem(BRANDS_CACHE_TIMESTAMP_KEY);
      
      // Clear local state
      setHasAttemptedLoad(false);
      
      // Fetch from Supabase
      const brands = await productBrandService.getAll();
      console.log(`Forcefully loaded ${brands.length} product brands from Supabase`);
      
      if (brands && brands.length > 0) {
        setProductBrands(brands);
        
        // Update cache
        localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(brands));
        localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      } else {
        console.log("No product brands found in Supabase during force refresh");
        setProductBrands([]);
      }
      
      toast({
        title: 'Marcas atualizadas',
        description: `${brands.length} marcas carregadas com sucesso!`,
      });
      
      setIsLoading(false);
      return true;
    } catch (error) {
      console.error('Error during force refresh of product brands:', error);
      setIsLoading(false);
      
      toast({
        title: 'Erro',
        description: 'Não foi possível atualizar as marcas de produtos.',
        variant: 'destructive',
      });
      
      return false;
    }
  };

  useEffect(() => {
    // Prevent multiple load attempts
    if (hasAttemptedLoad) return;
    
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        setHasAttemptedLoad(true);
        
        console.log("Fetching product brands from Supabase");
        // Always try Supabase first
        const brands = await productBrandService.getAll();
        console.log(`Loaded ${brands.length} product brands from Supabase`);
        console.log("Sample brand data:", brands.length > 0 ? brands[0] : "No brands found");
        
        if (brands && brands.length > 0) {
          setProductBrands(brands);
          console.log("Updated product brands state with Supabase data");
          
          // Update cache
          localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(brands));
          localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } else {
          console.log("No product brands found in Supabase");
          setProductBrands([]);
        }
      } catch (error) {
        console.error('Error fetching product brands:', error);
        
        // Try to use cached data as fallback
        try {
          console.log("Supabase fetch failed, trying cached data");
          const cachedData = localStorage.getItem(BRANDS_CACHE_KEY);
          const cachedTimestamp = localStorage.getItem(BRANDS_CACHE_TIMESTAMP_KEY);
          
          if (cachedData && cachedTimestamp) {
            const age = Date.now() - parseInt(cachedTimestamp);
            if (age < CACHE_MAX_AGE) {
              console.log("Using cached product brands data");
              setProductBrands(JSON.parse(cachedData));
            } else {
              console.log("Cached product brands data is too old");
              setProductBrands([]);
            }
          } else {
            console.log("No product brands found in cache");
            setProductBrands([]);
          }
        } catch (localError) {
          console.error('Error fetching brands from cache:', localError);
          setProductBrands([]);
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
      
      // Delete from Supabase first
      await productBrandService.delete(id);
      
      // Update local state
      setProductBrands((prev) => prev.filter((item) => item.id !== id));
      
      // Update cache
      const updatedBrands = productBrands.filter((item) => item.id !== id);
      localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(updatedBrands));
      localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      
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
    forceRefreshBrands,
  };
};
