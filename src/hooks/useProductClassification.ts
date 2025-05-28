
import { useState, useEffect } from 'react';
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';
import { toast } from 'sonner';
import { useProductCategories } from './useProductCategories';
import { useProductGroups } from './useProductGroups';
import { useProductBrands } from './useProductBrands';

export const useProductClassification = () => {
  console.log("=== useProductClassification iniciado ===");
  
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

  // Add debugging to see if data is loading correctly
  useEffect(() => {
    console.log("useProductClassification - Debug data:");
    console.log("- productCategories:", productCategories?.length || 0, "items");
    console.log("- productGroups:", productGroups?.length || 0, "items");
    console.log("- productBrands:", productBrands?.length || 0, "items");
    console.log("- isLoadingCategories:", isLoadingCategories);
    console.log("- isLoadingGroups:", isLoadingGroups);
    console.log("- isLoadingBrands:", isLoadingBrands);
  }, [productCategories, productGroups, productBrands, isLoadingCategories, isLoadingGroups, isLoadingBrands]);

  // Category operations with toast notifications
  const handleAddCategory = async (category: Omit<ProductCategory, 'id'>) => {
    try {
      console.log("Adicionando categoria:", category);
      const id = await addProductCategory(category);
      toast("Categoria adicionada com sucesso");
      return id;
    } catch (error) {
      console.error("Erro ao adicionar categoria:", error);
      toast("Erro ao adicionar categoria", {
        description: "Houve um problema ao adicionar a categoria."
      });
      return "";
    }
  };

  const handleUpdateCategory = async (id: string, category: Partial<ProductCategory>) => {
    try {
      console.log("Atualizando categoria:", id, category);
      await updateProductCategory(id, category);
      toast("Categoria atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar categoria:", error);
      toast("Erro ao atualizar categoria", {
        description: "Houve um problema ao atualizar a categoria."
      });
    }
  };

  const handleDeleteCategory = async (id: string) => {
    try {
      console.log("Excluindo categoria:", id);
      await deleteProductCategory(id);
      toast("Categoria excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir categoria:", error);
      toast("Erro ao excluir categoria", {
        description: "Houve um problema ao excluir a categoria."
      });
    }
  };

  // Group operations with toast notifications
  const handleAddGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      console.log("Adicionando grupo:", group);
      const id = await addProductGroup(group);
      toast("Grupo adicionado com sucesso");
      return id;
    } catch (error) {
      console.error("Erro ao adicionar grupo:", error);
      toast("Erro ao adicionar grupo", {
        description: "Houve um problema ao adicionar o grupo."
      });
      return "";
    }
  };

  const handleUpdateGroup = async (id: string, group: Partial<ProductGroup>) => {
    try {
      console.log("Atualizando grupo:", id, group);
      await updateProductGroup(id, group);
      toast("Grupo atualizado com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      toast("Erro ao atualizar grupo", {
        description: "Houve um problema ao atualizar o grupo."
      });
    }
  };

  const handleDeleteGroup = async (id: string) => {
    try {
      console.log("Excluindo grupo:", id);
      await deleteProductGroup(id);
      toast("Grupo excluído com sucesso");
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      toast("Erro ao excluir grupo", {
        description: "Houve um problema ao excluir o grupo."
      });
    }
  };

  // Brand operations with toast notifications
  const handleAddBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    try {
      console.log("Adicionando marca:", brand);
      const id = await addProductBrand(brand);
      toast("Marca adicionada com sucesso");
      return id;
    } catch (error) {
      console.error("Erro ao adicionar marca:", error);
      toast("Erro ao adicionar marca", {
        description: "Houve um problema ao adicionar a marca."
      });
      return "";
    }
  };

  const handleUpdateBrand = async (id: string, brand: Partial<ProductBrand>) => {
    try {
      console.log("Atualizando marca:", id, brand);
      await updateProductBrand(id, brand);
      toast("Marca atualizada com sucesso");
    } catch (error) {
      console.error("Erro ao atualizar marca:", error);
      toast("Erro ao atualizar marca", {
        description: "Houve um problema ao atualizar a marca."
      });
    }
  };

  const handleDeleteBrand = async (id: string) => {
    try {
      console.log("Excluindo marca:", id);
      await deleteProductBrand(id);
      toast("Marca excluída com sucesso");
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
      toast("Erro ao excluir marca", {
        description: "Houve um problema ao excluir a marca."
      });
    }
  };

  console.log("useProductClassification - retornando dados:", {
    categoriesCount: productCategories?.length || 0,
    groupsCount: productGroups?.length || 0,
    brandsCount: productBrands?.length || 0
  });

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
