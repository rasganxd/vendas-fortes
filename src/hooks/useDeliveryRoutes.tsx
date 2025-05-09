import { useState, useEffect } from 'react';
import { DeliveryRoute } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { createStandardService } from '@/services/supabase';

export const useDeliveryRoutes = () => {
  const [deliveryRoutes, setDeliveryRoutes] = useState<DeliveryRoute[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    const fetchDeliveryRoutes = async () => {
      try {
        setIsLoading(true);
        
        const { data, error } = await supabase
          .from('delivery_routes')
          .select('*')
          .order('created_at', { ascending: false });
          
        if (error) throw error;
        
        const routes: DeliveryRoute[] = data.map(route => ({
          id: route.id,
          name: route.name,
          date: new Date(route.date),
          driverId: route.driver_id || '',
          driverName: route.driver_name || '',
          vehicleId: route.vehicle_id || '',
          vehicleName: route.vehicle_name || '',
          status: route.status as "completed" | "pending" | "in-progress" | "planning" | "assigned" || 'pending',
          stops: [],
          createdAt: new Date(route.created_at),
          updatedAt: new Date(route.updated_at)
        }));
        
        setDeliveryRoutes(routes);
      } catch (error) {
        console.error("Error loading delivery routes:", error);
      } finally {
        setIsLoading(false);
      }
    };
    
    fetchDeliveryRoutes();
  }, []);
  
  const addDeliveryRoute = async (route: Omit<DeliveryRoute, 'id'>) => {
    try {
      const { data, error } = await supabase
        .from('delivery_routes')
        .insert({
          name: route.name,
          date: route.date.toISOString(),
          driver_id: route.driverId,
          driver_name: route.driverName,
          vehicle_id: route.vehicleId,
          vehicle_name: route.vehicleName,
          status: route.status
        })
        .select();
        
      if (error) throw error;
      
      const newRoute: DeliveryRoute = {
        id: data[0].id,
        name: data[0].name,
        date: new Date(data[0].date),
        driverId: data[0].driver_id || '',
        driverName: data[0].driver_name || '',
        vehicleId: data[0].vehicle_id || '',
        vehicleName: data[0].vehicle_name || '',
        status: data[0].status as "completed" | "pending" | "in-progress" | "planning" | "assigned" || 'pending',
        stops: [],
        createdAt: new Date(data[0].created_at),
        updatedAt: new Date(data[0].updated_at)
      };
      
      setDeliveryRoutes([...deliveryRoutes, newRoute]);
      
      toast({
        title: "Rota adicionada",
        description: "Rota adicionada com sucesso!"
      });
      
      return newRoute.id;
    } catch (error) {
      console.error("Error adding delivery route:", error);
      toast({
        title: "Erro ao adicionar rota",
        description: "Houve um problema ao adicionar a rota.",
        variant: "destructive"
      });
      return "";
    }
  };
  
  const updateDeliveryRoute = async (id: string, route: Partial<DeliveryRoute>): Promise<void> => {
    try {
      const supabaseUpdate: Record<string, any> = {};
      
      if (route.name !== undefined) supabaseUpdate.name = route.name;
      if (route.date !== undefined) supabaseUpdate.date = route.date.toISOString();
      if (route.driverId !== undefined) supabaseUpdate.driver_id = route.driverId;
      if (route.driverName !== undefined) supabaseUpdate.driver_name = route.driverName;
      if (route.vehicleId !== undefined) supabaseUpdate.vehicle_id = route.vehicleId;
      if (route.vehicleName !== undefined) supabaseUpdate.vehicle_name = route.vehicleName;
      if (route.status !== undefined) supabaseUpdate.status = route.status;
      
      const { error } = await supabase
        .from('delivery_routes')
        .update(supabaseUpdate)
        .eq('id', id);
        
      if (error) throw error;
      
      setDeliveryRoutes(deliveryRoutes.map(r => 
        r.id === id ? { ...r, ...route } : r
      ));
      
      toast({
        title: "Rota atualizada",
        description: "Rota atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Error updating delivery route:", error);
      toast({
        title: "Erro ao atualizar rota",
        description: "Houve um problema ao atualizar a rota.",
        variant: "destructive"
      });
    }
  };
  
  const deleteDeliveryRoute = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase
        .from('delivery_routes')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
      setDeliveryRoutes(deliveryRoutes.filter(r => r.id !== id));
      
      toast({
        title: "Rota excluída",
        description: "Rota excluída com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting delivery route:", error);
      toast({
        title: "Erro ao excluir rota",
        description: "Houve um problema ao excluir a rota.",
        variant: "destructive"
      });
    }
  };
  
  return {
    deliveryRoutes,
    isLoading,
    addDeliveryRoute,
    updateDeliveryRoute,
    deleteDeliveryRoute
  };
};
