
import { useState, useEffect } from 'react';
import { unitService, Unit } from '@/services/supabase/unitService';
import { toast } from "sonner";

export const useUnits = () => {
  const [units, setUnits] = useState<Unit[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasLoaded, setHasLoaded] = useState(false);

  useEffect(() => {
    const loadUnits = async () => {
      if (hasLoaded) return;
      
      try {
        setIsLoading(true);
        console.log("🔄 Loading units from database...");
        
        const data = await unitService.getAll();
        
        console.log("✅ Units loaded successfully:", data.length, data);
        setUnits(data);
        setHasLoaded(true);
      } catch (error) {
        console.error('❌ Error loading units:', error);
        toast.error("Erro ao carregar unidades");
        setUnits([]);
      } finally {
        setIsLoading(false);
      }
    };

    loadUnits();
  }, [hasLoaded]);

  const addUnit = async (unit: Omit<Unit, 'id' | 'created_at' | 'updated_at'>): Promise<string> => {
    try {
      const newId = await unitService.create(unit);
      const newUnit = { 
        ...unit, 
        id: newId, 
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      setUnits(prev => [...prev, newUnit]);
      return newId;
    } catch (error) {
      console.error('Error adding unit:', error);
      throw error;
    }
  };

  const updateUnit = async (id: string, unit: Partial<Omit<Unit, 'id' | 'created_at' | 'updated_at'>>): Promise<void> => {
    try {
      await unitService.update(id, unit);
      setUnits(prev => prev.map(u => u.id === id ? { ...u, ...unit, updated_at: new Date().toISOString() } : u));
    } catch (error) {
      console.error('Error updating unit:', error);
      throw error;
    }
  };

  const deleteUnit = async (id: string): Promise<void> => {
    try {
      await unitService.delete(id);
      setUnits(prev => prev.filter(u => u.id !== id));
    } catch (error) {
      console.error('Error deleting unit:', error);
      throw error;
    }
  };

  const forceRefresh = async () => {
    setHasLoaded(false);
    setIsLoading(true);
  };

  return {
    units,
    isLoading,
    addUnit,
    updateUnit,
    deleteUnit,
    forceRefresh
  };
};
