
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
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadClassifications = async () => {
      if (hasLoaded) return; // Prevent multiple loads
      
      try {
        setIsLoading(true);
        console.log("🔄 Loading product classifications from database...");
        
        const [groups, categories, brands] = await Promise.all([
          productGroupService.getAll(),
          productCategoryService.getAll(),
          productBrandService.getAll()
        ]);
        
        console.log("✅ Classifications loaded successfully:");
        console.log("📦 Groups:", groups.length, groups);
        console.log("📂 Categories:", categories.length, categories);
        console.log("🏷️ Brands:", brands.length, brands);
        
        setProductGroups(groups);
        setProductCategories(categories);
        setProductBrands(brands);
        setHasLoaded(true);
      } catch (error) {
        console.error('❌ Error loading product classifications:', error);
        toast({
          title: "Erro ao carregar classificações",
          description: "Houve um problema ao carregar as classificações dos produtos.",
          variant: "destructive"
        });
        
        // Set empty arrays as fallback
        setProductGroups([]);
        setProductCategories([]);
        setProductBrands([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadClassifications();
  }, [hasLoaded]);

  const forceRefresh = async () => {
    setHasLoaded(false);
    setIsLoading(true);
  };

  return {
    productGroups,
    productCategories,
    productBrands,
    isLoading,
    setProductGroups,
    setProductCategories,
    setProductBrands,
    forceRefresh
  };
};
