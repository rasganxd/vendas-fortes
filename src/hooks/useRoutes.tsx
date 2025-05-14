
import { DeliveryRoute } from '@/types';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { ensureDate } from '@/lib/date-utils';

export const loadRoutes = async (): Promise<DeliveryRoute[]> => {
  try {
    const { data, error } = await supabase
      .from('delivery_routes')
      .select('*')
      .order('created_at', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Transform the data to match DeliveryRoute type
    return data.map(route => ({
      id: route.id,
      name: route.name,
      date: new Date(route.date || new Date()),
      driverId: route.driver_id || '',
      driverName: route.driver_name || '',
      vehicleId: route.vehicle_id || '',
      vehicleName: route.vehicle_name || '',
      status: route.status as "completed" | "pending" | "in-progress" | "planning" | "assigned" || 'pending',
      stops: [],
      createdAt: new Date(route.created_at || new Date()),
      updatedAt: new Date(route.updated_at || new Date())
    })) as DeliveryRoute[];
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
      // Transform DeliveryRoute to match Supabase schema
      const supabaseRoute = {
        name: route.name,
        date: ensureDate(route.date).toISOString(),
        driver_id: route.driverId,
        driver_name: route.driverName,
        vehicle_id: route.vehicleId,
        vehicle_name: route.vehicleName,
        status: route.status
      };

      // Add to Supabase
      const { data, error } = await supabase
        .from('delivery_routes')
        .insert(supabaseRoute)
        .select();
        
      if (error) {
        throw error;
      }
      
      const newRouteFromDb = data[0];
      
      // Transform back to DeliveryRoute type
      const newRoute: DeliveryRoute = {
        id: newRouteFromDb.id,
        name: newRouteFromDb.name,
        date: new Date(newRouteFromDb.date || new Date()),
        driverId: newRouteFromDb.driver_id || '',
        driverName: newRouteFromDb.driver_name || '',
        vehicleId: newRouteFromDb.vehicle_id || '',
        vehicleName: newRouteFromDb.vehicle_name || '',
        status: newRouteFromDb.status as "completed" | "pending" | "in-progress" | "planning" | "assigned" || 'pending',
        stops: [],
        createdAt: new Date(newRouteFromDb.created_at || new Date()),
        updatedAt: new Date(newRouteFromDb.updated_at || new Date())
      };
      
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

  const updateRoute = async (id: string, routeUpdate: Partial<DeliveryRoute>): Promise<void> => {
    try {
      // Transform DeliveryRoute to match Supabase schema
      const supabaseRouteUpdate: Record<string, any> = {};
      
      if (routeUpdate.name !== undefined) supabaseRouteUpdate.name = routeUpdate.name;
      if (routeUpdate.date !== undefined) supabaseRouteUpdate.date = ensureDate(routeUpdate.date).toISOString();
      if (routeUpdate.driverId !== undefined) supabaseRouteUpdate.driver_id = routeUpdate.driverId;
      if (routeUpdate.driverName !== undefined) supabaseRouteUpdate.driver_name = routeUpdate.driverName;
      if (routeUpdate.vehicleId !== undefined) supabaseRouteUpdate.vehicle_id = routeUpdate.vehicleId;
      if (routeUpdate.vehicleName !== undefined) supabaseRouteUpdate.vehicle_name = routeUpdate.vehicleName;
      if (routeUpdate.status !== undefined) supabaseRouteUpdate.status = routeUpdate.status;
      
      // Update in Supabase
      const { error } = await supabase
        .from('delivery_routes')
        .update(supabaseRouteUpdate)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
      // Update local state
      setRoutes(routes.map(r => 
        r.id === id ? { ...r, ...routeUpdate } : r
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
