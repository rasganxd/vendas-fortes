
import { useState, useEffect } from 'react';
import { ProductGroup } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productGroupService } from '@/services/supabase';
import { transformArray } from '@/utils/dataTransformers';
import { supabase } from '@/integrations/supabase/client';

// Helper function to transform product group data
const transformProductGroupData = (data: any): ProductGroup => {
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

export const useProductGroups = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load product groups from Supabase
  useEffect(() => {
    const fetchProductGroups = async () => {
      setIsLoading(true);
      try {
        const { data, error } = await supabase
          .from('product_groups')
          .select('*')
          .order('name');
        
        if (error) {
          console.error('Error fetching product groups:', error);
          toast({
            title: "Erro ao carregar grupos",
            description: "Não foi possível carregar os grupos de produtos.",
            variant: "destructive"
          });
        } else if (data) {
          const transformedGroups = data.map(group => transformProductGroupData(group));
          setProductGroups(transformedGroups);
          console.log(`Loaded ${transformedGroups.length} product groups from Supabase`);
        }
      } catch (error) {
        console.error('Error in fetchProductGroups:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductGroups();
  }, []);

  const addProductGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('product_groups')
        .insert([{
          name: group.name,
          description: group.description || '',
          notes: group.notes || ''
        }])
        .select()
        .single();

      if (error) {
        console.error("Erro ao adicionar grupo:", error);
        toast({
          title: "Erro ao adicionar",
          description: "Não foi possível adicionar o grupo de produtos.",
          variant: "destructive"
        });
        return "";
      }

      const newGroup = transformProductGroupData(data);
      setProductGroups([...productGroups, newGroup]);
      
      toast({
        title: "Grupo adicionado",
        description: "Grupo de produto adicionado com sucesso!"
      });
      
      return newGroup.id;
    } catch (error) {
      console.error("Erro ao adicionar grupo:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o grupo de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductGroup = async (id: string, group: Partial<ProductGroup>) => {
    try {
      const { error } = await supabase
        .from('product_groups')
        .update({
          name: group.name,
          description: group.description,
          notes: group.notes,
          updated_at: new Date().toISOString()
        })
        .eq('id', id);

      if (error) {
        console.error("Erro ao atualizar grupo:", error);
        toast({
          title: "Erro ao atualizar",
          description: "Não foi possível atualizar o grupo de produtos.",
          variant: "destructive"
        });
        return;
      }

      setProductGroups(
        productGroups.map(pg => (pg.id === id ? { 
          ...pg, 
          ...group,
          updatedAt: new Date()
        } : pg))
      );
      
      toast({
        title: "Grupo atualizado",
        description: "Grupo de produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar grupo:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o grupo de produtos.",
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

      if (error) {
        console.error("Erro ao excluir grupo:", error);
        toast({
          title: "Erro ao excluir",
          description: "Não foi possível excluir o grupo de produtos.",
          variant: "destructive"
        });
        return;
      }

      setProductGroups(productGroups.filter(pg => pg.id !== id));
      
      toast({
        title: "Grupo excluído",
        description: "Grupo de produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir grupo:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o grupo de produtos.",
        variant: "destructive"
      });
    }
  };

  return {
    productGroups,
    isLoading,
    addProductGroup,
    updateProductGroup,
    deleteProductGroup,
    setProductGroups
  };
};
