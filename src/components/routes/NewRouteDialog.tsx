
import { useState } from 'react';
import { Vehicle } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';

interface NewRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vehicles: Vehicle[];
  onCreateRoute: (name: string, date: Date, vehicleId: string) => void;
}

export const NewRouteDialog = ({ open, onOpenChange, vehicles, onCreateRoute }: NewRouteDialogProps) => {
  const [newRouteName, setNewRouteName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleCreateNewRoute = () => {
    if (!newRouteName) return;
    onCreateRoute(newRouteName, selectedDate, selectedVehicleId);
    // Reset form state
    setNewRouteName('');
    setSelectedVehicleId('');
    setSelectedDate(new Date());
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Nova Rota de Entrega</DialogTitle>
        </DialogHeader>
        
        <div className="space-y-4 py-4">
          <div>
            <label htmlFor="routeName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome da Rota
            </label>
            <input
              id="routeName"
              type="text"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              placeholder="Digite o nome da rota"
              value={newRouteName}
              onChange={(e) => setNewRouteName(e.target.value)}
            />
          </div>
          
          <div>
            <label htmlFor="routeDate" className="block text-sm font-medium text-gray-700 mb-1">
              Data
            </label>
            <input
              id="routeDate"
              type="date"
              className="w-full px-3 py-2 border border-gray-300 rounded-md"
              value={selectedDate.toISOString().split('T')[0]}
              onChange={(e) => setSelectedDate(new Date(e.target.value))}
            />
          </div>
          
          <div>
            <label htmlFor="routeVehicle" className="block text-sm font-medium text-gray-700 mb-1">
              Veículo
            </label>
            <Select
              value={selectedVehicleId}
              onValueChange={setSelectedVehicleId}
            >
              <SelectTrigger id="routeVehicle">
                <SelectValue placeholder="Selecionar veículo" />
              </SelectTrigger>
              <SelectContent>
                {vehicles && vehicles.length > 0 ? (
                  vehicles.map(vehicle => (
                    <SelectItem key={vehicle.id} value={vehicle.id}>
                      {vehicle.name}
                    </SelectItem>
                  ))
                ) : (
                  <SelectItem value="none" disabled>Nenhum veículo cadastrado</SelectItem>
                )}
              </SelectContent>
            </Select>
          </div>
        </div>
        
        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            className="bg-sales-800 hover:bg-sales-700"
            onClick={handleCreateNewRoute}
            disabled={!newRouteName}
          >
            Criar Rota
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
