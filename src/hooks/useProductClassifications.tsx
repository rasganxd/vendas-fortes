
import { useState, useEffect } from 'react';
import { ProductGroup, ProductCategory, ProductBrand } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const useProductGroups = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchProductGroups = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('product_groups')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        const groups: ProductGroup[] = data.map(group => ({
          id: group.id,
          name: group.name,
          description: group.description || '',
          notes: group.notes || '',
          createdAt: new Date(group.created_at),
          updatedAt: new Date(group.updated_at)
        }));
        
        setProductGroups(groups);
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
      const { data, error } = await supabase
        .from('product_groups')
        .insert({
          name: productGroup.name,
          description: productGroup.description || '',
          notes: productGroup.notes || ''
        })
        .select();
        
      if (error) throw error;
      
      const newGroup: ProductGroup = {
        id: data[0].id,
        name: data[0].name,
        description: data[0].description || '',
        notes: data[0].notes || '',
        createdAt: new Date(data[0].created_at),
        updatedAt: new Date(data[0].updated_at)
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
        description: "Houve um problema ao adicionar o grupo.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateProductGroup = async (id: string, productGroup: Partial<ProductGroup>) => {
    try {
      const { error } = await supabase
        .from('product_groups')
        .update({
          name: productGroup.name,
          description: productGroup.description,
          notes: productGroup.notes
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setProductGroups(productGroups.map(group => 
        group.id === id ? { ...group, ...productGroup } : group
      ));
      
      toast({
        title: "Grupo atualizado",
        description: "Grupo atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product group:", error);
      toast({
        title: "Erro ao atualizar grupo",
        description: "Houve um problema ao atualizar o grupo.",
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
      
      setProductGroups(productGroups.filter(group => group.id !== id));
      
      toast({
        title: "Grupo excluído",
        description: "Grupo excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product group:", error);
      toast({
        title: "Erro ao excluir grupo",
        description: "Houve um problema ao excluir o grupo.",
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
        
        const { data, error } = await supabase
          .from('product_categories')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        const categories: ProductCategory[] = data.map(category => ({
          id: category.id,
          name: category.name,
          description: category.description || '',
          notes: category.notes || '',
          createdAt: new Date(category.created_at),
          updatedAt: new Date(category.updated_at)
        }));
        
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
      const { data, error } = await supabase
        .from('product_categories')
        .insert({
          name: productCategory.name,
          description: productCategory.description || '',
          notes: productCategory.notes || ''
        })
        .select();
        
      if (error) throw error;
      
      const newCategory: ProductCategory = {
        id: data[0].id,
        name: data[0].name,
        description: data[0].description || '',
        notes: data[0].notes || '',
        createdAt: new Date(data[0].created_at),
        updatedAt: new Date(data[0].updated_at)
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
        description: "Houve um problema ao adicionar a categoria.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateProductCategory = async (id: string, productCategory: Partial<ProductCategory>) => {
    try {
      const { error } = await supabase
        .from('product_categories')
        .update({
          name: productCategory.name,
          description: productCategory.description,
          notes: productCategory.notes
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setProductCategories(productCategories.map(category => 
        category.id === id ? { ...category, ...productCategory } : category
      ));
      
      toast({
        title: "Categoria atualizada",
        description: "Categoria atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product category:", error);
      toast({
        title: "Erro ao atualizar categoria",
        description: "Houve um problema ao atualizar a categoria.",
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
      
      setProductCategories(productCategories.filter(category => category.id !== id));
      
      toast({
        title: "Categoria excluída",
        description: "Categoria excluída com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product category:", error);
      toast({
        title: "Erro ao excluir categoria",
        description: "Houve um problema ao excluir a categoria.",
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
        
        const { data, error } = await supabase
          .from('product_brands')
          .select('*')
          .order('name', { ascending: true });
          
        if (error) throw error;
        
        const brands: ProductBrand[] = data.map(brand => ({
          id: brand.id,
          name: brand.name,
          description: brand.description || '',
          notes: brand.notes || '',
          createdAt: new Date(brand.created_at),
          updatedAt: new Date(brand.updated_at)
        }));
        
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
      const { data, error } = await supabase
        .from('product_brands')
        .insert({
          name: productBrand.name,
          description: productBrand.description || '',
          notes: productBrand.notes || ''
        })
        .select();
        
      if (error) throw error;
      
      const newBrand: ProductBrand = {
        id: data[0].id,
        name: data[0].name,
        description: data[0].description || '',
        notes: data[0].notes || '',
        createdAt: new Date(data[0].created_at),
        updatedAt: new Date(data[0].updated_at)
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
        description: "Houve um problema ao adicionar a marca.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateProductBrand = async (id: string, productBrand: Partial<ProductBrand>) => {
    try {
      const { error } = await supabase
        .from('product_brands')
        .update({
          name: productBrand.name,
          description: productBrand.description,
          notes: productBrand.notes
        })
        .eq('id', id);
        
      if (error) throw error;
      
      setProductBrands(productBrands.map(brand => 
        brand.id === id ? { ...brand, ...productBrand } : brand
      ));
      
      toast({
        title: "Marca atualizada",
        description: "Marca atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product brand:", error);
      toast({
        title: "Erro ao atualizar marca",
        description: "Houve um problema ao atualizar a marca.",
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
      
      setProductBrands(productBrands.filter(brand => brand.id !== id));
      
      toast({
        title: "Marca excluída",
        description: "Marca excluída com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product brand:", error);
      toast({
        title: "Erro ao excluir marca",
        description: "Houve um problema ao excluir a marca.",
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
