
import { DeliveryRoute } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';

export const loadRoutes = async (): Promise<DeliveryRoute[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_routes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    return data as DeliveryRoute[];
  } catch (error) {
    console.error("Erro ao carregar rotas:", error);
    return [];
  }
};

export const useRoutes = () => {
  const [routes, setRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Initialize routes when component mounts
  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const loadedRoutes = await loadRoutes();
        setRoutes(loadedRoutes);
      } catch (error) {
        console.error("Error loading routes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchRoutes();
  }, []);

  const addRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      // Add to Supabase
      const { data, error } = await supabase
        .from('delivery_routes')
        .insert(route)
        .select();
        
      if (error) {
        throw error;
      }
      
      const newRoute = data[0] as DeliveryRoute;
      
      // Update local state
      setRoutes([...routes, newRoute]);
      toast({
        title: "Rota adicionada",
        description: "Rota adicionada com sucesso!"
      });
      return newRoute.id;
    } catch (error) {
      console.error("Erro ao adicionar rota:", error);
      toast({
        title: "Erro ao adicionar rota",
        description: "Houve um problema ao adicionar a rota.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateRoute = async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
    try {
      // Update in Supabase
      const { error } = await supabase
        .from('delivery_routes')
        .update(route)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setRoutes(routes.map(r => 
        r.id === id ? { ...r, ...route } : r
      ));
      toast({
        title: "Rota atualizada",
        description: "Rota atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar rota:", error);
      toast({
        title: "Erro ao atualizar rota",
        description: "Houve um problema ao atualizar a rota.",
        variant: "destructive"
      });
    }
  };

  const deleteRoute = async (id: string): Promise<void> => {
    try {
      // Delete from Supabase
      const { error } = await supabase
        .from('delivery_routes')
        .delete()
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setRoutes(routes.filter(r => r.id !== id));
      toast({
        title: "Rota excluída",
        description: "Rota excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir rota:", error);
      toast({
        title: "Erro ao excluir rota",
        description: "Houve um problema ao excluir a rota.",
        variant: "destructive"
      });
    }
  };

  return {
    routes,
    isLoading,
    addRoute,
    updateRoute,
    deleteRoute,
    setRoutes
  };
};
