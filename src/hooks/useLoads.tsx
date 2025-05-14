
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
          setLoads(data as Load[]);
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
    const newLoad = {
      ...load,
      id,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    } as Load;

    try {
      const { error } = await supabase.from('loads').insert([newLoad]);
      
      if (error) {
        throw error;
      }

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
      const { error } = await supabase
        .from('loads')
        .update({ ...updatedLoad, updatedAt: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      setLoads((prevLoads) => 
        prevLoads.map((load) => 
          load.id === id ? { ...load, ...updatedLoad, updatedAt: new Date().toISOString() } : load
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
      const { error } = await supabase
        .from('loads')
        .update({ locked: newLockedStatus, updatedAt: new Date().toISOString() })
        .eq('id', id);
      
      if (error) {
        throw error;
      }

      setLoads((prevLoads) => 
        prevLoads.map((load) => 
          load.id === id ? { ...load, locked: newLockedStatus, updatedAt: new Date().toISOString() } : load
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
