
import { useState, useEffect } from 'react';
import { 
  productGroupService, 
  productCategoryService, 
  productBrandService 
} from '@/firebase/firestoreService';
import { ProductGroup, ProductCategory, ProductBrand } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

// Load functions for product classifications
export const loadProductGroups = async (): Promise<ProductGroup[]> => {
  try {
    return await productGroupService.getAll();
  } catch (error) {
    console.error("Erro ao carregar grupos de produtos:", error);
    return [];
  }
};

export const loadProductCategories = async (): Promise<ProductCategory[]> => {
  try {
    return await productCategoryService.getAll();
  } catch (error) {
    console.error("Erro ao carregar categorias de produtos:", error);
    return [];
  }
};

export const loadProductBrands = async (): Promise<ProductBrand[]> => {
  try {
    return await productBrandService.getAll();
  } catch (error) {
    console.error("Erro ao carregar marcas de produtos:", error);
    return [];
  }
};

export const useProductClassifications = () => {
  const { 
    productGroups, setProductGroups, 
    productCategories, setProductCategories,
    productBrands, setProductBrands
  } = useAppContext();

  // Group Management
  const addProductGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      const id = await productGroupService.add(group);
      const newGroup = { ...group, id } as ProductGroup;
      setProductGroups([...productGroups, newGroup]);
      toast({
        title: "Grupo adicionado",
        description: "Grupo de produtos adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar grupo de produtos:", error);
      toast({
        title: "Erro ao adicionar grupo",
        description: "Houve um problema ao adicionar o grupo de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductGroup = async (id: string, group: Partial<ProductGroup>) => {
    try {
      await productGroupService.update(id, group);
      setProductGroups(productGroups.map(g => 
        g.id === id ? { ...g, ...group } : g
      ));
      toast({
        title: "Grupo atualizado",
        description: "Grupo de produtos atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar grupo de produtos:", error);
      toast({
        title: "Erro ao atualizar grupo",
        description: "Houve um problema ao atualizar o grupo de produtos.",
        variant: "destructive"
      });
    }
  };

  const deleteProductGroup = async (id: string) => {
    try {
      await productGroupService.delete(id);
      setProductGroups(productGroups.filter(g => g.id !== id));
      toast({
        title: "Grupo removido",
        description: "Grupo de produtos removido com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao remover grupo de produtos:", error);
      toast({
        title: "Erro ao remover grupo",
        description: "Houve um problema ao remover o grupo de produtos.",
        variant: "destructive"
      });
    }
  };

  // Category Management
  const addProductCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      const id = await productCategoryService.add(category);
      const newCategory = { ...category, id } as ProductCategory;
      setProductCategories([...productCategories, newCategory]);
      toast({
        title: "Categoria adicionada",
        description: "Categoria de produtos adicionada com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar categoria de produtos:", error);
      toast({
        title: "Erro ao adicionar categoria",
        description: "Houve um problema ao adicionar a categoria de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductCategory = async (id: string, category: Partial<ProductCategory>) => {
    try {
      await productCategoryService.update(id, category);
      setProductCategories(productCategories.map(c => 
        c.id === id ? { ...c, ...category } : c
      ));
      toast({
        title: "Categoria atualizada",
        description: "Categoria de produtos atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar categoria de produtos:", error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Houve um problema ao atualizar a categoria de produtos.",
        variant: "destructive"
      });
    }
  };

  const deleteProductCategory = async (id: string) => {
    try {
      await productCategoryService.delete(id);
      setProductCategories(productCategories.filter(c => c.id !== id));
      toast({
        title: "Categoria removida",
        description: "Categoria de produtos removida com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao remover categoria de produtos:", error);
      toast({
        title: "Erro ao remover categoria",
        description: "Houve um problema ao remover a categoria de produtos.",
        variant: "destructive"
      });
    }
  };

  // Brand Management
  const addProductBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    try {
      const id = await productBrandService.add(brand);
      const newBrand = { ...brand, id } as ProductBrand;
      setProductBrands([...productBrands, newBrand]);
      toast({
        title: "Marca adicionada",
        description: "Marca de produtos adicionada com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar marca de produtos:", error);
      toast({
        title: "Erro ao adicionar marca",
        description: "Houve um problema ao adicionar a marca de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductBrand = async (id: string, brand: Partial<ProductBrand>) => {
    try {
      await productBrandService.update(id, brand);
      setProductBrands(productBrands.map(b => 
        b.id === id ? { ...b, ...brand } : b
      ));
      toast({
        title: "Marca atualizada",
        description: "Marca de produtos atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar marca de produtos:", error);
      toast({
        title: "Erro ao atualizar marca",
        description: "Houve um problema ao atualizar a marca de produtos.",
        variant: "destructive"
      });
    }
  };

  const deleteProductBrand = async (id: string) => {
    try {
      await productBrandService.delete(id);
      setProductBrands(productBrands.filter(b => b.id !== id));
      toast({
        title: "Marca removida",
        description: "Marca de produtos removida com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao remover marca de produtos:", error);
      toast({
        title: "Erro ao remover marca",
        description: "Houve um problema ao remover a marca de produtos.",
        variant: "destructive"
      });
    }
  };

  return {
    productGroups,
    productCategories,
    productBrands,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  };
};
