
import { useState, useEffect } from 'react';
import { ProductGroup, ProductCategory, ProductBrand } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productGroupService } from '@/services/supabase/productGroupService';
import { productCategoryService } from '@/services/supabase/productCategoryService';
import { productBrandService } from '@/services/supabase/productBrandService';

export const useProductClassifications = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadClassifications = async () => {
      try {
        setIsLoading(true);
        
        const [groups, categories, brands] = await Promise.all([
          productGroupService.getAll(),
          productCategoryService.getAll(),
          productBrandService.getAll()
        ]);
        
        setProductGroups(groups);
        setProductCategories(categories);
        setProductBrands(brands);
      } catch (error) {
        console.error('Error loading product classifications:', error);
        toast({
          title: "Erro ao carregar classificações",
          description: "Houve um problema ao carregar as classificações dos produtos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadClassifications();
  }, []);

  return {
    productGroups,
    productCategories,
    productBrands,
    isLoading,
    setProductGroups,
    setProductCategories,
    setProductBrands
  };
};
