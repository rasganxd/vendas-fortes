
import { Vehicle } from '@/types';
import { vehicleService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadVehicles = async (): Promise<Vehicle[]> => {
  try {
    return await vehicleService.getAll();
  } catch (error) {
    console.error("Erro ao carregar veículos:", error);
    return [];
  }
};

export const useVehicles = () => {
  const { vehicles, setVehicles } = useAppContext();

  const addVehicle = async (vehicle: Omit<Vehicle, 'id'>) => {
    try {
      // Add to Firebase
      const id = await vehicleService.add(vehicle);
      const newVehicle = { ...vehicle, id };
      
      // Update local state
      setVehicles([...vehicles, newVehicle]);
      toast({
        title: "Veículo adicionado",
        description: "Veículo adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar veículo:", error);
      toast({
        title: "Erro ao adicionar veículo",
        description: "Houve um problema ao adicionar o veículo.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateVehicle = async (id: string, vehicle: Partial<Vehicle>) => {
    try {
      // Update in Firebase
      await vehicleService.update(id, vehicle);
      
      // Update local state
      setVehicles(vehicles.map(v => 
        v.id === id ? { ...v, ...vehicle } : v
      ));
      toast({
        title: "Veículo atualizado",
        description: "Veículo atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar veículo:", error);
      toast({
        title: "Erro ao atualizar veículo",
        description: "Houve um problema ao atualizar o veículo.",
        variant: "destructive"
      });
    }
  };

  const deleteVehicle = async (id: string) => {
    try {
      // Delete from Firebase
      await vehicleService.delete(id);
      
      // Update local state
      setVehicles(vehicles.filter(v => v.id !== id));
      toast({
        title: "Veículo excluído",
        description: "Veículo excluído com sucesso!"
      });
      return true;
    } catch (error) {
      console.error("Erro ao excluir veículo:", error);
      toast({
        title: "Erro ao excluir veículo",
        description: "Houve um problema ao excluir o veículo.",
        variant: "destructive"
      });
      throw error;
    }
  };

  return {
    vehicles,
    addVehicle,
    updateVehicle,
    deleteVehicle
  };
};
