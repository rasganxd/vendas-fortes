
import { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { vehicleService } from '@/services/supabase/vehicleService';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load vehicles on initial render
  useEffect(() => {
    const fetchVehicles = async () => {
      try {
        setIsLoading(true);
        console.log('🚛 Carregando veículos...');
        const loadedVehicles = await vehicleService.getAll();
        console.log('🚛 Veículos carregados:', loadedVehicles);
        setVehicles(loadedVehicles);
      } catch (error) {
        console.error("❌ Erro ao carregar veículos:", error);
        toast({
          title: "Erro ao carregar veículos",
          description: "Houve um problema ao carregar os veículos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchVehicles();
  }, []);

  // Add a new vehicle
  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      console.log('🚛 Adicionando veículo:', vehicle);
      const id = await vehicleService.add(vehicle);
      console.log('✅ Veículo adicionado com ID:', id);
      
      const newVehicle: Vehicle = {
        ...vehicle,
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      setVehicles([...vehicles, newVehicle]);
      
      toast({
        title: "Veículo adicionado",
        description: "Veículo adicionado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("❌ Erro ao adicionar veículo:", error);
      toast({
        title: "Erro ao adicionar veículo",
        description: "Houve um problema ao adicionar o veículo.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing vehicle
  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      console.log('🚛 Atualizando veículo:', id, vehicle);
      await vehicleService.update(id, vehicle);
      
      // Update local state
      setVehicles(vehicles.map(v => 
        v.id === id ? { ...v, ...vehicle, updatedAt: new Date() } : v
      ));
      
      toast({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso!"
      });
    } catch (error) {
      console.error("❌ Erro ao atualizar veículo:", error);
      toast({
        title: "Erro ao atualizar veículo",
        description: "Houve um problema ao atualizar o veículo.",
        variant: "destructive"
      });
    }
  };

  // Delete a vehicle
  const deleteVehicle = async (id: string): Promise<void> => {
    try {
      console.log('🗑️ Excluindo veículo:', id);
      await vehicleService.delete(id);
      
      // Update local state
      setVehicles(vehicles.filter(v => v.id !== id));
      
      toast({
        title: "Veículo excluído",
        description: "Veículo excluído com sucesso!"
      });
    } catch (error) {
      console.error("❌ Erro ao excluir veículo:", error);
      toast({
        title: "Erro ao excluir veículo",
        description: "Houve um problema ao excluir o veículo.",
        variant: "destructive"
      });
    }
  };

  return {
    vehicles,
    isLoading,
    addVehicle,
    updateVehicle,
    deleteVehicle,
    setVehicles
  };
};
