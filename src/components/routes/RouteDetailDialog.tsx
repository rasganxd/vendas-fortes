
import { DeliveryRoute, Order } from '@/types';
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
import RouteFinancialReport from './RouteFinancialReport';
import { useAppContext } from '@/hooks/useAppContext';

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
  const { orders } = useAppContext();
  
  if (!route) return null;

  // Get all orders that are included in this route
  const routeOrders = orders.filter(order => 
    route.stops.some(stop => stop.orderId === order.id)
  );
  
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl">{route.name}</DialogTitle>
        </DialogHeader>
        
        <Tabs defaultValue="stops">
          <TabsList className="grid grid-cols-3 mb-4">
            <TabsTrigger value="stops">Paradas</TabsTrigger>
            <TabsTrigger value="map">Visualização da Rota</TabsTrigger>
            <TabsTrigger value="financial">Relatório Financeiro</TabsTrigger>
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
          
          <TabsContent value="map" className="min-h-[500px]">
            <RouteMap route={route} className="h-full" />
          </TabsContent>
          
          <TabsContent value="financial">
            <RouteFinancialReport 
              route={route}
              orders={routeOrders}
              onClose={() => {}}
            />
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
};
