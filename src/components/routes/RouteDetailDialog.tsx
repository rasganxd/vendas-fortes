
import { DeliveryRoute } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin, Plus } from 'lucide-react';
import { formatDateToBR } from '@/lib/date-utils';
import { RouteStopsTable } from './RouteStopsTable';
import { RouteProductsList } from './RouteProductsList';
import { RouteMap } from './RouteMap';

interface RouteDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  route: DeliveryRoute | null;
  onAddOrder: () => void;
  onRemoveStop: (stopId: string) => void;
}

export const RouteDetailDialog = ({ 
  open, 
  onOpenChange, 
  route, 
  onAddOrder, 
  onRemoveStop 
}: RouteDetailDialogProps) => {
  if (!route) return null;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-3xl">
        <DialogHeader>
          <DialogTitle>{route.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="stops">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="stops">Paradas</TabsTrigger>
            <TabsTrigger value="map">Mapa</TabsTrigger>
          </TabsList>
          
          <TabsContent value="stops">
            <div className="flex justify-between mb-4">
              <RouteProductsList route={route} />
              
              <Button 
                onClick={onAddOrder}
                className="bg-sales-800 hover:bg-sales-700"
                disabled={route.status === 'completed'}
              >
                <Plus size={16} className="mr-2" /> Adicionar Pedido
              </Button>
            </div>
            
            <RouteStopsTable 
              stops={route.stops} 
              isCompleted={route.status === 'completed'} 
              onRemoveStop={onRemoveStop} 
            />
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">
                <p><span className="font-medium">Status da Rota:</span> {route.status}</p>
                <p><span className="font-medium">Data:</span> {formatDateToBR(route.date)}</p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700">
                Otimizar Rota
              </Button>
            </div>
          </TabsContent>
          
          <TabsContent value="map">
            <RouteMap route={route} />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
