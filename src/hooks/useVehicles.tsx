import { useState } from 'react';
import { Vehicle } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useVehicles = () => {
  const [vehicles, setVehicles] = useState<Vehicle[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 9);
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
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
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
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
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
    }
  };

  return {
    vehicles,
    isLoading,
    setVehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };
};
