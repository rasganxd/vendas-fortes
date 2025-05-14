
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Load, LoadItem, Order } from '@/types';
import { useOrders } from './useOrders';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/hooks/use-toast';

export const useLoads = () => {
  const [loads, setLoads] = useState<Load[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const { orders } = useOrders();

  // Fetch loads from Supabase or use mock data
  useEffect(() => {
    const fetchLoads = async () => {
      try {
        setIsLoading(true);
        const { data, error } = await supabase
          .from('loads')
          .select('*')
          .order('date', { ascending: false });

        if (error) {
          throw error;
        }

        if (data) {
          // Convert database format to our app format
          const formattedLoads: Load[] = data.map(item => ({
            id: item.id,
            name: item.name || '',
            date: item.date,
            vehicleId: item.vehicle_id || '',
            vehicleName: item.vehicle_name,
            salesRepId: item.sales_rep_id,
            status: (item.status as Load['status']) || 'planning',
            total: item.total || 0,
            notes: item.notes || '',
            createdAt: item.created_at,
            updatedAt: item.updated_at,
            locked: item.locked || false,
            items: [], // Will be populated from load_items if needed
            orderIds: [], // Will be populated from load_orders if needed
          }));
          setLoads(formattedLoads);
        }
      } catch (error) {
        console.error('Error fetching loads:', error);
        // Use mock data or handle error
      } finally {
        setIsLoading(false);
      }
    };

    fetchLoads();
  }, []);

  // Add a new load
  const addLoad = async (load: Partial<Load>): Promise<string> => {
    const id = uuidv4();
    const now = new Date().toISOString();
    
    // Map our app model to the database model
    const dbLoad = {
      id,
      name: load.name,
      date: load.date,
      vehicle_id: load.vehicleId,
      vehicle_name: load.vehicleName,
      sales_rep_id: load.salesRepId,
      status: load.status,
      total: load.total || 0,
      notes: load.notes || '',
      created_at: now,
      updated_at: now,
      locked: load.locked || false,
    };

    try {
      const { error } = await supabase.from('loads').insert([dbLoad]);
      
      if (error) {
        throw error;
      }

      // Create new load with our app format
      const newLoad: Load = {
        id,
        name: load.name || '',
        date: load.date || new Date(),
        vehicleId: load.vehicleId || '',
        vehicleName: load.vehicleName,
        salesRepId: load.salesRepId,
        items: load.items || [],
        status: load.status || 'planning',
        total: load.total || 0,
        notes: load.notes || '',
        createdAt: now,
        updatedAt: now,
        orderIds: load.orderIds || [],
        locked: load.locked || false
      };

      setLoads((prevLoads) => [newLoad, ...prevLoads]);
      return id;
    } catch (error) {
      console.error("Error adding load:", error);
      throw error;
    }
  };

  // Update an existing load
  const updateLoad = async (id: string, updatedLoad: Partial<Load>): Promise<void> => {
    try {
      const now = new Date().toISOString();
      
      // Map our app model to the database model
      const dbLoad = {
        name: updatedLoad.name,
        date: updatedLoad.date,
        vehicle_id: updatedLoad.vehicleId,
        vehicle_name: updatedLoad.vehicleName,
        sales_rep_id: updatedLoad.salesRepId,
        status: updatedLoad.status,
        total: updatedLoad.total,
        notes: updatedLoad.notes,
        updated_at: now,
        locked: updatedLoad.locked,
      };

      const { error } = await supabase
        .from('loads')
        .update(dbLoad)
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      setLoads((prevLoads) => 
        prevLoads.map((load) => 
          load.id === id ? { ...load, ...updatedLoad, updatedAt: now } : load
        )
      );
    } catch (error) {
      console.error("Error updating load:", error);
      throw error;
    }
  };

  // Delete a load
  const deleteLoad = async (id: string): Promise<void> => {
    try {
      const { error } = await supabase.from('loads').delete().eq('id', id);
      
      if (error) {
        throw error;
      }

      setLoads((prevLoads) => prevLoads.filter((load) => load.id !== id));
    } catch (error) {
      console.error("Error deleting load:", error);
      throw error;
    }
  };

  // Get orders assigned to a load
  const getOrdersFromLoad = (load: Load): Order[] => {
    if (!load || !load.orderIds || !orders) return [];
    return orders.filter((order) => load.orderIds.includes(order.id));
  };

  // Toggle lock status of a load
  const toggleLoadLock = async (id: string): Promise<void> => {
    const load = loads.find(l => l.id === id);
    if (!load) return;

    const newLockedStatus = !load.locked;
    
    try {
      const now = new Date().toISOString();
      
      const { error } = await supabase
        .from('loads')
        .update({ 
          locked: newLockedStatus, 
          updated_at: now 
        })
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      setLoads((prevLoads) => 
        prevLoads.map((load) => 
          load.id === id ? { ...load, locked: newLockedStatus, updatedAt: now } : load
        )
      );

      toast({
        title: newLockedStatus ? "Carga bloqueada" : "Carga desbloqueada",
        description: `A carga foi ${newLockedStatus ? "bloqueada" : "desbloqueada"} com sucesso.`,
      });
    } catch (error) {
      console.error("Error toggling load lock:", error);
      toast({
        title: "Erro",
        description: "Não foi possível alterar o status de bloqueio da carga.",
        variant: "destructive",
      });
    }
  };

  return {
    loads,
    isLoading,
    setLoads,
    addLoad,
    updateLoad,
    deleteLoad,
    getOrdersFromLoad,
    toggleLoadLock,
  };
};
