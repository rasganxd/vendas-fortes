
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

  // Helper function to clear cache for specific item
  const clearItemCache = async (itemType: string) => {
    if (itemType === 'products') {
      localStorage.removeItem(BRANDS_CACHE_KEY);
      localStorage.removeItem(BRANDS_CACHE_TIMESTAMP_KEY);
    }
    return true;
  };

  useEffect(() => {
    const fetchBrands = async () => {
      try {
        setIsLoading(true);
        // Always try Firebase first
        const brands = await productBrandService.getAll();
        setProductBrands(brands);
        
        // Update local storage service
        await productBrandLocalService.setAll(brands);
        
        // Update cache
        localStorage.setItem(BRANDS_CACHE_KEY, JSON.stringify(brands));
        localStorage.setItem(BRANDS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (error) {
        console.error('Error fetching product brands:', error);
        
        // Try local storage service as fallback
        try {
          const localBrands = await productBrandLocalService.getAll();
          setProductBrands(localBrands);
        } catch (localError) {
          console.error('Error fetching brands from local storage:', localError);
          
          // Try to use cached data as last resort
          const cachedData = localStorage.getItem(BRANDS_CACHE_KEY);
          if (cachedData) {
            setProductBrands(JSON.parse(cachedData));
          } else {
            toast({
              title: 'Erro',
              description: 'Não foi possível carregar as marcas de produtos.',
              variant: 'destructive',
            });
          }
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchBrands();
  }, []);

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
