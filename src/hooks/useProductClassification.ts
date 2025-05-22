
import { useState } from 'react';
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';
import { toast } from 'sonner';
import { useProductCategories } from './useProductCategories';
import { useProductGroups } from './useProductGroups';
import { useProductBrands } from './useProductBrands';

export const useProductClassification = () => {
  // Use the individual hooks for categories, groups, and brands
  const {
    productCategories,
    isLoading: isLoadingCategories,
    addProductCategory,
    updateProductCategory,
    deleteProductCategory
  } = useProductCategories();

  const {
    productGroups,
    isLoading: isLoadingGroups,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup
  } = useProductGroups();

  const {
    productBrands,
    isLoading: isLoadingBrands,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  } = useProductBrands();

  // State for the active tab
  const [activeTab, setActiveTab] = useState<'categories' | 'groups' | 'brands'>('categories');

  // Category operations with toast notifications
  const handleAddCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      const id = await addProductCategory(category);
      toast("Categoria adicionada com sucesso");
      return id;
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast("Erro ao adicionar categoria", {
        description: "Houve um problema ao adicionar a categoria.",
        variant: "destructive"
      });
      return "";
    }
  };

  const handleUpdateCategory = async (id: string, category: Partial<ProductCategory>) => {
    try {
      await updateProductCategory(id, category);
      toast("Categoria atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast("Erro ao atualizar categoria", {
        description: "Houve um problema ao atualizar a categoria.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      await deleteProductCategory(id);
      toast("Categoria excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast("Erro ao excluir categoria", {
        description: "Houve um problema ao excluir a categoria.",
        variant: "destructive"
      });
    }
  };

  // Group operations with toast notifications
  const handleAddGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      const id = await addProductGroup(group);
      toast("Grupo adicionado com sucesso");
      return id;
    } catch (error) {
      console.error("Erro ao adicionar grupo:", error);
      toast("Erro ao adicionar grupo", {
        description: "Houve um problema ao adicionar o grupo.",
        variant: "destructive"
      });
      return "";
    }
  };

  const handleUpdateGroup = async (id: string, group: Partial<ProductGroup>) => {
    try {
      await updateProductGroup(id, group);
      toast("Grupo atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      toast("Erro ao atualizar grupo", {
        description: "Houve um problema ao atualizar o grupo.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      await deleteProductGroup(id);
      toast("Grupo excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      toast("Erro ao excluir grupo", {
        description: "Houve um problema ao excluir o grupo.",
        variant: "destructive"
      });
    }
  };

  // Brand operations with toast notifications
  const handleAddBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    try {
      const id = await addProductBrand(brand);
      toast("Marca adicionada com sucesso");
      return id;
    } catch (error) {
      console.error("Erro ao adicionar marca:", error);
      toast("Erro ao adicionar marca", {
        description: "Houve um problema ao adicionar a marca.",
        variant: "destructive"
      });
      return "";
    }
  };

  const handleUpdateBrand = async (id: string, brand: Partial<ProductBrand>) => {
    try {
      await updateProductBrand(id, brand);
      toast("Marca atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar marca:", error);
      toast("Erro ao atualizar marca", {
        description: "Houve um problema ao atualizar a marca.",
        variant: "destructive"
      });
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      await deleteProductBrand(id);
      toast("Marca excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
      toast("Erro ao excluir marca", {
        description: "Houve um problema ao excluir a marca.",
        variant: "destructive"
      });
    }
  };

  return {
    // Data
    productCategories,
    productGroups,
    productBrands,
    
    // Loading states
    isLoadingCategories,
    isLoadingGroups,
    isLoadingBrands,
    
    // Tab state
    activeTab,
    setActiveTab,
    
    // Category operations
    handleAddCategory,
    handleUpdateCategory,
    handleDeleteCategory,
    
    // Group operations
    handleAddGroup,
    handleUpdateGroup,
    handleDeleteGroup,
    
    // Brand operations
    handleAddBrand,
    handleUpdateBrand,
    handleDeleteBrand
  };
};
