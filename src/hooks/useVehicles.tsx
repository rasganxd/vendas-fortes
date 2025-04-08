
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
      const id = await vehicleService.add(vehicle);
      const newVehicle = { ...vehicle, id };
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
      await vehicleService.update(id, vehicle);
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
      console.log("Iniciando exclusão do veículo com ID:", id);
      
      // Excluir do Firestore primeiro
      await vehicleService.delete(id);
      console.log("Veículo excluído do Firestore com sucesso:", id);
      
      // Atualizar o estado local após confirmação da exclusão - Fixed TypeScript error here
      setVehicles(vehicles.filter(v => v.id !== id));
      console.log("Estado local atualizado, veículo removido do estado:", id);
      
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
