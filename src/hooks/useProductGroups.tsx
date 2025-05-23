
import { useState, useEffect } from 'react';
import { ProductGroup } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { productGroupService } from '@/services/firebase/productGroupService';
import { productGroupLocalService } from '@/services/local/productGroupLocalService';

// Cache keys for local storage
const GROUPS_CACHE_KEY = 'app_product_groups_cache';
const GROUPS_CACHE_TIMESTAMP_KEY = 'app_product_groups_timestamp';
const CACHE_MAX_AGE = 5 * 60 * 1000; // 5 minutes

export const useProductGroups = () => {
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasAttemptedLoad, setHasAttemptedLoad] = useState(false);

  // Load product groups from Firebase
  useEffect(() => {
    // Prevent multiple load attempts
    if (hasAttemptedLoad) return;
    
    const fetchProductGroups = async () => {
      setIsLoading(true);
      setHasAttemptedLoad(true);
      try {
        console.log("Fetching product groups from Firebase");
        // Try Firebase first
        const groups = await productGroupService.getAll();
        console.log(`Loaded ${groups.length} product groups from Firebase`);
        
        if (groups && groups.length > 0) {
          setProductGroups(groups);
          
          // Update local storage for offline access
          try {
            await productGroupLocalService.setAll(groups);
            console.log("Updated product groups in local storage");
            
            // Update cache
            localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(groups));
            localStorage.setItem(GROUPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
          } catch (localError) {
            console.error("Error saving product groups to local storage:", localError);
          }
        } else {
          console.log("No product groups found in Firebase, creating default groups");
          
          // Create default groups if none exist
          const currentDate = new Date();
          const defaultGroups = [
            { 
              id: 'group-1', 
              name: 'Bebidas', 
              description: 'Bebidas diversas',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'group-2', 
              name: 'Alimentos', 
              description: 'Produtos alimentícios',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'group-3', 
              name: 'Limpeza', 
              description: 'Produtos de limpeza',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            }
          ];
          
          // Add default groups to Firebase
          for (const group of defaultGroups) {
            try {
              await productGroupService.add(group);
            } catch (error) {
              console.error(`Error adding default group ${group.name}:`, error);
            }
          }
          
          // Set default groups in state
          setProductGroups(defaultGroups);
          
          // Update local storage with default groups
          try {
            await productGroupLocalService.setAll(defaultGroups);
            
            // Update cache
            localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(defaultGroups));
            localStorage.setItem(GROUPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
          } catch (localError) {
            console.error("Error saving default groups to local storage:", localError);
          }
        }
      } catch (error) {
        console.error('Error fetching product groups from Firebase:', error);
        
        // Try local storage as fallback
        try {
          console.log("Firebase fetch failed, trying local storage");
          const localGroups = await productGroupLocalService.getAll();
          console.log(`Found ${localGroups.length} product groups in local storage`);
          
          if (localGroups && localGroups.length > 0) {
            setProductGroups(localGroups);
          } else {
            // Try to use cached data as last resort
            const cachedData = localStorage.getItem(GROUPS_CACHE_KEY);
            if (cachedData) {
              console.log("Using cached product groups data");
              setProductGroups(JSON.parse(cachedData));
            } else {
              // If nothing worked, create default groups
              console.log("No product groups found in cache, creating default groups");
              const currentDate = new Date();
              const defaultGroups = [
                { 
                  id: 'group-1', 
                  name: 'Bebidas', 
                  description: 'Bebidas diversas',
                  notes: '',
                  createdAt: currentDate,
                  updatedAt: currentDate
                },
                { 
                  id: 'group-2', 
                  name: 'Alimentos', 
                  description: 'Produtos alimentícios',
                  notes: '',
                  createdAt: currentDate,
                  updatedAt: currentDate
                },
                { 
                  id: 'group-3', 
                  name: 'Limpeza', 
                  description: 'Produtos de limpeza',
                  notes: '',
                  createdAt: currentDate,
                  updatedAt: currentDate
                }
              ];
              setProductGroups(defaultGroups);
              
              toast({
                title: "Grupos padrão criados",
                description: "Foram criados grupos de produtos padrão.",
              });
            }
          }
        } catch (localError) {
          console.error('Error fetching product groups from local storage:', localError);
          toast({
            title: "Erro ao carregar grupos",
            description: "Não foi possível carregar os grupos de produtos.",
            variant: "destructive"
          });
          
          // Last resort - create default groups in memory only
          const currentDate = new Date();
          const defaultGroups = [
            { 
              id: 'group-1', 
              name: 'Bebidas', 
              description: 'Bebidas diversas',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'group-2', 
              name: 'Alimentos', 
              description: 'Produtos alimentícios',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            },
            { 
              id: 'group-3', 
              name: 'Limpeza', 
              description: 'Produtos de limpeza',
              notes: '',
              createdAt: currentDate,
              updatedAt: currentDate
            }
          ];
          setProductGroups(defaultGroups);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchProductGroups();
  }, [hasAttemptedLoad]);

  const addProductGroup = async (group: Omit<ProductGroup, 'id'>) => {
    try {
      console.log("Adding new product group:", group);
      const id = await productGroupService.add(group);

      // Refresh groups after adding to ensure we have the latest data without duplicates
      const updatedGroups = await productGroupService.getAll();
      setProductGroups(updatedGroups);
      
      try {
        // Update local storage
        await productGroupLocalService.setAll(updatedGroups);
        
        // Update cache
        localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(updatedGroups));
        localStorage.setItem(GROUPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
      } catch (localError) {
        console.error("Error updating local storage after adding group:", localError);
      }
      
      toast({
        title: "Grupo adicionado",
        description: "Grupo de produto adicionado com sucesso!"
      });
      
      return id;
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
      console.log(`Updating product group ${id}:`, group);
      await productGroupService.update(id, group);

      // Refresh the list to ensure consistency
      const groupToUpdate = productGroups.find(g => g.id === id);
      if (groupToUpdate) {
        const updatedGroup = { ...groupToUpdate, ...group, updatedAt: new Date() };
        
        const updatedGroups = productGroups.map(pg => (pg.id === id ? updatedGroup : pg));
        setProductGroups(updatedGroups);
        
        try {
          // Update local storage
          await productGroupLocalService.update(id, group);
          
          // Update cache
          localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(updatedGroups));
          localStorage.setItem(GROUPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (localError) {
          console.error("Error updating local storage after updating group:", localError);
        }
      }
      
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
      console.log(`Deleting product group ${id}`);
      // Get the name of the group before deleting
      const groupToDelete = productGroups.find(g => g.id === id);
      if (groupToDelete) {
        // Delete all groups with this name to ensure no duplicates remain
        await productGroupService.deleteAllByName(groupToDelete.name);
        
        // Refresh the list from the server
        const updatedGroups = await productGroupService.getAll();
        setProductGroups(updatedGroups);
        
        try {
          // Update local storage
          await productGroupLocalService.delete(id);
          
          // Update cache
          localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(updatedGroups));
          localStorage.setItem(GROUPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (localError) {
          console.error("Error updating local storage after deleting group:", localError);
        }
      } else {
        // If not found in local state, just delete by ID
        await productGroupService.delete(id);
        
        const updatedGroups = productGroups.filter(pg => pg.id !== id);
        setProductGroups(updatedGroups);
        
        try {
          // Update local storage
          await productGroupLocalService.delete(id);
          
          // Update cache
          localStorage.setItem(GROUPS_CACHE_KEY, JSON.stringify(updatedGroups));
          localStorage.setItem(GROUPS_CACHE_TIMESTAMP_KEY, Date.now().toString());
        } catch (localError) {
          console.error("Error updating local storage after deleting group:", localError);
        }
      }
      
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
