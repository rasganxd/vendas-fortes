
import { useState, useEffect } from 'react';
import { ProductGroup, ProductCategory, ProductBrand } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productGroupService } from '@/services/firebase/productGroupService';
import { productCategoryService } from '@/services/firebase/productCategoryService';
import { productBrandService } from '@/services/firebase/productBrandService';

export const useProductGroups = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProductGroups = async () => {
      try {
        setIsLoading(true);
        
        const groups = await productGroupService.getAll();
        setProductGroups(groups);
        console.log(`Loaded ${groups.length} product groups from Firebase`);
      } catch (error) {
        console.error("Error loading product groups:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductGroups();
  }, []);
  
  const addProductGroup = async (productGroup: Omit<ProductGroup, 'id'>) => {
    try {
      const id = await productGroupService.add(productGroup);

      const newGroup: ProductGroup = {
        ...productGroup,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProductGroups([...productGroups, newGroup]);
      
      toast({
        title: "Grupo adicionado",
        description: "Grupo adicionado com sucesso!"
      });
      
      return newGroup.id;
    } catch (error) {
      console.error("Error adding product group:", error);
      toast({
        title: "Erro ao adicionar grupo",
        description: "Não foi possível adicionar o grupo.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateProductGroup = async (id: string, productGroup: Partial<ProductGroup>) => {
    try {
      await productGroupService.update(id, productGroup);
      
      setProductGroups(productGroups.map(pg => 
        pg.id === id ? { ...pg, ...productGroup, updatedAt: new Date() } : pg
      ));
      
      toast({
        title: "Grupo atualizado",
        description: "Grupo atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product group:", error);
      toast({
        title: "Erro ao atualizar grupo",
        description: "Não foi possível atualizar o grupo.",
        variant: "destructive"
      });
    }
  };
  
  const deleteProductGroup = async (id: string) => {
    try {
      await productGroupService.delete(id);
      
      setProductGroups(productGroups.filter(pg => pg.id !== id));
      
      toast({
        title: "Grupo excluído",
        description: "Grupo excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product group:", error);
      toast({
        title: "Erro ao excluir grupo",
        description: "Não foi possível excluir o grupo.",
        variant: "destructive"
      });
    }
  };
  
  return {
    productGroups,
    isLoading,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  };
};

export const useProductCategories = () => {
  const [productCategories, setProductCategories] = useState<ProductCategory[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProductCategories = async () => {
      try {
        setIsLoading(true);
        
        const categories = await productCategoryService.getAll();
        setProductCategories(categories);
      } catch (error) {
        console.error("Error loading product categories:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductCategories();
  }, []);
  
  const addProductCategory = async (productCategory: Omit<ProductCategory, 'id'>) => {
    try {
      const id = await productCategoryService.add(productCategory);
      
      const newCategory: ProductCategory = {
        ...productCategory,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProductCategories([...productCategories, newCategory]);
      
      toast({
        title: "Categoria adicionada",
        description: "Categoria adicionada com sucesso!"
      });
      
      return newCategory.id;
    } catch (error) {
      console.error("Error adding product category:", error);
      toast({
        title: "Erro ao adicionar categoria",
        description: "Não foi possível adicionar a categoria.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateProductCategory = async (id: string, productCategory: Partial<ProductCategory>) => {
    try {
      await productCategoryService.update(id, productCategory);
      
      setProductCategories(productCategories.map(category => 
        category.id === id ? { ...category, ...productCategory, updatedAt: new Date() } : category
      ));
      
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product category:", error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Não foi possível atualizar a categoria.",
        variant: "destructive"
      });
    }
  };
  
  const deleteProductCategory = async (id: string) => {
    try {
      await productCategoryService.delete(id);
      
      setProductCategories(productCategories.filter(category => category.id !== id));
      
      toast({
        title: "Categoria excluída",
        description: "Categoria excluída com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product category:", error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Não foi possível excluir a categoria.",
        variant: "destructive"
      });
    }
  };
  
  return {
    productCategories,
    isLoading,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  };
};

export const useProductBrands = () => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProductBrands = async () => {
      try {
        setIsLoading(true);
        
        const brands = await productBrandService.getAll();
        setProductBrands(brands);
      } catch (error) {
        console.error("Error loading product brands:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductBrands();
  }, []);
  
  const addProductBrand = async (productBrand: Omit<ProductBrand, 'id'>) => {
    try {
      const id = await productBrandService.add(productBrand);
      
      const newBrand: ProductBrand = {
        ...productBrand,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setProductBrands([...productBrands, newBrand]);
      
      toast({
        title: "Marca adicionada",
        description: "Marca adicionada com sucesso!"
      });
      
      return newBrand.id;
    } catch (error) {
      console.error("Error adding product brand:", error);
      toast({
        title: "Erro ao adicionar marca",
        description: "Não foi possível adicionar a marca.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateProductBrand = async (id: string, productBrand: Partial<ProductBrand>) => {
    try {
      await productBrandService.update(id, productBrand);
      
      setProductBrands(productBrands.map(brand => 
        brand.id === id ? { ...brand, ...productBrand, updatedAt: new Date() } : brand
      ));
      
      toast({
        title: "Marca atualizada",
        description: "Marca atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product brand:", error);
      toast({
        title: "Erro ao atualizar marca",
        description: "Não foi possível atualizar a marca.",
        variant: "destructive"
      });
    }
  };
  
  const deleteProductBrand = async (id: string) => {
    try {
      await productBrandService.delete(id);
      
      setProductBrands(productBrands.filter(brand => brand.id !== id));
      
      toast({
        title: "Marca excluída",
        description: "Marca excluída com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product brand:", error);
      toast({
        title: "Erro ao excluir marca",
        description: "Não foi possível excluir a marca.",
        variant: "destructive"
      });
    }
  };
  
  return {
    productBrands,
    isLoading,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  };
};
