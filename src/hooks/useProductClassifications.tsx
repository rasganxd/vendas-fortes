import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { ProductGroup, ProductCategory, ProductBrand } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

// Load functions for product classifications
export const loadProductGroups = async (): Promise<ProductGroup[]> => {
  try {
    const { data, error } = await supabase
      .from('product_groups')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data.map(group => ({
      id: group.id,
      name: group.name,
      description: group.description || '',
      notes: group.notes || '',
      createdAt: new Date(group.created_at || new Date()),
      updatedAt: new Date(group.updated_at || new Date())
    }));
  } catch (error) {
    console.error("Erro ao carregar grupos de produtos:", error);
    return [];
  }
};

export const loadProductCategories = async (): Promise<ProductCategory[]> => {
  try {
    const { data, error } = await supabase
      .from('product_categories')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description || '',
      notes: category.notes || '',
      createdAt: new Date(category.created_at || new Date()),
      updatedAt: new Date(category.updated_at || new Date())
    }));
  } catch (error) {
    console.error("Erro ao carregar categorias de produtos:", error);
    return [];
  }
};

export const loadProductBrands = async (): Promise<ProductBrand[]> => {
  try {
    const { data, error } = await supabase
      .from('product_brands')
      .select('*')
      .order('name');
      
    if (error) throw error;
    
    return data.map(brand => ({
      id: brand.id,
      name: brand.name,
      description: brand.description || '',
      notes: brand.notes || '',
      createdAt: new Date(brand.created_at || new Date()),
      updatedAt: new Date(brand.updated_at || new Date())
    }));
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
      const supabaseGroup = {
        name: group.name,
        description: group.description,
        notes: group.notes
      };
      
      const { data, error } = await supabase
        .from('product_groups')
        .insert(supabaseGroup)
        .select();
        
      if (error) throw error;
      
      const newGroupData = data[0];
      
      const newGroup: ProductGroup = {
        id: newGroupData.id,
        name: newGroupData.name,
        description: newGroupData.description || '',
        notes: newGroupData.notes || '',
        createdAt: new Date(newGroupData.created_at || new Date()),
        updatedAt: new Date(newGroupData.updated_at || new Date())
      };
      
      setProductGroups([...productGroups, newGroup]);
      toast({
        title: "Grupo adicionado",
        description: "Grupo de produtos adicionado com sucesso!"
      });
      return newGroup.id;
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
      const supabaseUpdate: Record<string, any> = {};
      
      if (group.name !== undefined) supabaseUpdate.name = group.name;
      if (group.description !== undefined) supabaseUpdate.description = group.description;
      if (group.notes !== undefined) supabaseUpdate.notes = group.notes;
      
      const { error } = await supabase
        .from('product_groups')
        .update(supabaseUpdate)
        .eq('id', id);
        
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('product_groups')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
      const supabaseCategory = {
        name: category.name,
        description: category.description,
        notes: category.notes
      };
      
      const { data, error } = await supabase
        .from('product_categories')
        .insert(supabaseCategory)
        .select();
        
      if (error) throw error;
      
      const newCategoryData = data[0];
      
      const newCategory: ProductCategory = {
        id: newCategoryData.id,
        name: newCategoryData.name,
        description: newCategoryData.description || '',
        notes: newCategoryData.notes || '',
        createdAt: new Date(newCategoryData.created_at || new Date()),
        updatedAt: new Date(newCategoryData.updated_at || new Date())
      };
      
      setProductCategories([...productCategories, newCategory]);
      toast({
        title: "Categoria adicionada",
        description: "Categoria de produtos adicionada com sucesso!"
      });
      return newCategory.id;
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
      const supabaseUpdate: Record<string, any> = {};
      
      if (category.name !== undefined) supabaseUpdate.name = category.name;
      if (category.description !== undefined) supabaseUpdate.description = category.description;
      if (category.notes !== undefined) supabaseUpdate.notes = category.notes;
      
      const { error } = await supabase
        .from('product_categories')
        .update(supabaseUpdate)
        .eq('id', id);
        
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('product_categories')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
      const supababseBrand = {
        name: brand.name,
        description: brand.description,
        notes: brand.notes
      };
      
      const { data, error } = await supabase
        .from('product_brands')
        .insert(supababseBrand)
        .select();
        
      if (error) throw error;
      
      const newBrandData = data[0];
      
      const newBrand: ProductBrand = {
        id: newBrandData.id,
        name: newBrandData.name,
        description: newBrandData.description || '',
        notes: newBrandData.notes || '',
        createdAt: new Date(newBrandData.created_at || new Date()),
        updatedAt: new Date(newBrandData.updated_at || new Date())
      };
      
      setProductBrands([...productBrands, newBrand]);
      toast({
        title: "Marca adicionada",
        description: "Marca de produtos adicionada com sucesso!"
      });
      return newBrand.id;
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
      const supabaseUpdate: Record<string, any> = {};
      
      if (brand.name !== undefined) supabaseUpdate.name = brand.name;
      if (brand.description !== undefined) supabaseUpdate.description = brand.description;
      if (brand.notes !== undefined) supabaseUpdate.notes = brand.notes;
      
      const { error } = await supabase
        .from('product_brands')
        .update(supabaseUpdate)
        .eq('id', id);
        
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('product_brands')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
