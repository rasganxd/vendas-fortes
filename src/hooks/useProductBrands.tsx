
import { useState, useEffect } from 'react';
import { ProductBrand } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productBrandService } from '@/services/supabase';
import { transformArray } from '@/utils/dataTransformers';
import { supabase } from '@/integrations/supabase/client';

// Helper function to transform product brand data
const transformProductBrandData = (data: any): ProductBrand => {
  if (!data) return null;
  
  return {
    id: data.id || "",
    name: data.name || "",
    description: data.description || "",
    notes: data.notes || "",
    createdAt: data.created_at ? new Date(data.created_at) : new Date(),
    updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
  };
};

export const useProductBrands = () => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load product brands from Supabase
  useEffect(() => {
    const fetchProductBrands = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('product_brands')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching product brands:', error);
          toast({
            title: "Erro ao carregar marcas",
            description: "Não foi possível carregar as marcas de produtos.",
            variant: "destructive"
          });
        } else if (data) {
          const transformedBrands = data.map(brand => transformProductBrandData(brand));
          setProductBrands(transformedBrands);
          console.log(`Loaded ${transformedBrands.length} product brands from Supabase`);
        }
      } catch (error) {
        console.error('Error in fetchProductBrands:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductBrands();
  }, []);

  const addProductBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('product_brands')
        .insert([{
          name: brand.name,
          description: brand.description || '',
          notes: brand.notes || ''
        }])
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar marca:", error);
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar a marca de produtos.",
          variant: "destructive"
        });
        return "";
      }

      const newBrand = transformProductBrandData(data);
      setProductBrands([...productBrands, newBrand]);
      
      toast({
        title: "Marca adicionada",
        description: "Marca de produto adicionada com sucesso!"
      });
      
      return newBrand.id;
    } catch (error) {
      console.error("Erro ao adicionar marca:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a marca de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductBrand = async (id: string, brand: Partial<ProductBrand>) => {
    try {
      const { error } = await supabase
        .from('product_brands')
        .update({
          name: brand.name,
          description: brand.description,
          notes: brand.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar marca:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar a marca de produtos.",
          variant: "destructive"
        });
        return;
      }

      setProductBrands(
        productBrands.map(pb => (pb.id === id ? { 
          ...pb, 
          ...brand,
          updatedAt: new Date()
        } : pb))
      );
      
      toast({
        title: "Marca atualizada",
        description: "Marca de produto atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar marca:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a marca de produtos.",
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

      if (error) {
        console.error("Erro ao excluir marca:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir a marca de produtos.",
          variant: "destructive"
        });
        return;
      }

      setProductBrands(productBrands.filter(pb => pb.id !== id));
      
      toast({
        title: "Marca excluída",
        description: "Marca de produto excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a marca de produtos.",
        variant: "destructive"
      });
    }
  };

  return {
    productBrands,
    isLoading,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    setProductBrands
  };
};
