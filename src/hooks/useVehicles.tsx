
import { useState, useEffect } from 'react';
import { Vehicle } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { vehicleService } from '@/services/firebase/vehicleService';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);

  // Load vehicles from Firebase
  useEffect(() => {
    const loadVehicles = async () => {
      try {
        setIsLoading(true);
        const data = await vehicleService.getAll();
        setVehicles(data);
      } catch (error) {
        console.error("Error loading vehicles:", error);
        toast({
          variant: "destructive",
          title: "Erro ao carregar veículos",
          description: "Não foi possível carregar os veículos."
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadVehicles();
  }, []);

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      setIsProcessing(true);
      const newId = await vehicleService.add(vehicle);
      const newVehicle = { ...vehicle, id: newId };
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Veículo adicionado",
        description: "Veículo adicionado com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o veículo.",
        variant: "destructive"
      });
      return "";
    } finally {
      setIsProcessing(false);
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      setIsProcessing(true);
      await vehicleService.update(id, vehicle);
      setVehicles(
        vehicles.map(v => (v.id === id ? { ...v, ...vehicle } : v))
      );
      toast({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o veículo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      setIsProcessing(true);
      await vehicleService.delete(id);
      setVehicles(vehicles.filter(v => v.id !== id));
      toast({
        title: "Veículo excluído",
        description: "Veículo excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o veículo.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    vehicles,
    isLoading,
    isProcessing,
    setVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };
};
