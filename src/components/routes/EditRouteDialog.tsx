
import { useState, useEffect } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle, 
  DialogFooter 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { format } from 'date-fns';
import { DeliveryRoute, Vehicle } from '@/types';
import { CalendarIcon } from 'lucide-react';
import { Calendar } from '@/components/ui/calendar';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { cn } from '@/lib/utils';

interface EditRouteDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: DeliveryRoute | null;
  vehicles: Vehicle[];
  onSave: (id: string, updatedRoute: Partial<DeliveryRoute>) => Promise<void>;
}

export const EditRouteDialog = ({ open, onOpenChange, route, vehicles, onSave }: EditRouteDialogProps) => {
  const [name, setName] = useState('');
  const [status, setStatus] = useState<'planning' | 'assigned' | 'in-progress' | 'completed'>('planning');
  const [date, setDate] = useState<Date | undefined>(undefined);
  const [vehicleId, setVehicleId] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Reset form when dialog opens with new route data
  useEffect(() => {
    if (route && open) {
      setName(route.name);
      setStatus(route.status);
      setDate(route.date);
      setVehicleId(route.vehicleId || '');
    }
  }, [route, open]);
  
  const handleSave = async () => {
    if (!route) return;
    
    setIsLoading(true);
    
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);
    
    const updatedRoute: Partial<DeliveryRoute> = {
      name,
      status,
      date,
      vehicleId: vehicleId || undefined,
      vehicleName: selectedVehicle ? selectedVehicle.name : undefined,
    };
    
    try {
      await onSave(route.id, updatedRoute);
      onOpenChange(false);
    } catch (error) {
      console.error('Error updating route:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Editar Rota</DialogTitle>
        </DialogHeader>
        
        <div className="grid gap-4 py-4">
          <div className="grid gap-2">
            <Label htmlFor="name">Nome da Rota</Label>
            <Input
              id="name"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nome da rota"
            />
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="status">Status</Label>
            <Select value={status} onValueChange={(value: 'planning' | 'assigned' | 'in-progress' | 'completed') => setStatus(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="planning">Planejamento</SelectItem>
                <SelectItem value="assigned">Atribuída</SelectItem>
                <SelectItem value="in-progress">Em Progresso</SelectItem>
                <SelectItem value="completed">Concluída</SelectItem>
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label htmlFor="vehicle">Veículo</Label>
            <Select value={vehicleId} onValueChange={setVehicleId}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o veículo" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Nenhum</SelectItem>
                {vehicles.filter(v => v.active).map((vehicle) => (
                  <SelectItem key={vehicle.id} value={vehicle.id}>
                    {vehicle.name} ({vehicle.type})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div className="grid gap-2">
            <Label>Data</Label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "justify-start text-left font-normal",
                    !date && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 h-4 w-4" />
                  {date ? format(date, "dd/MM/yyyy") : "Selecione uma data"}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={setDate}
                  initialFocus
                />
              </PopoverContent>
            </Popover>
          </div>
        </div>
        
        <DialogFooter>
          <Button 
            variant="outline" 
            onClick={() => onOpenChange(false)}
            disabled={isLoading}
          >
            Cancelar
          </Button>
          <Button 
            onClick={handleSave}
            disabled={isLoading || !name || !status || !date}
            className="bg-sales-800 hover:bg-sales-700"
          >
            Salvar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
