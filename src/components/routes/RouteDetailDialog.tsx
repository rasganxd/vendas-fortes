import { DeliveryRoute, Order } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { MapPin, Plus, Save, X } from 'lucide-react';
import { formatDateToBR } from '@/lib/date-utils';
import { RouteStopsTable } from './RouteStopsTable';
import { RouteProductsList } from './RouteProductsList';
import RouteFinancialReport from './RouteFinancialReport';
import { useAppContext } from '@/hooks/useAppContext';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

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
  const navigate = useNavigate();
  
  if (!route) return null;

  // Get all orders that are included in this route
  const routeOrders = orders.filter(order => 
    route.stops.some(stop => stop.orderId === order.id)
  );
  
  const handleSaveRoute = () => {
    // Here we'd handle saving the route data
    toast({
      title: "Rota salva",
      description: "A rota foi salva com sucesso!"
    });
    onOpenChange(false);
  };

  const handleEditOrder = (orderId: string) => {
    navigate(`/pedidos/novo?id=${orderId}`);
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <div className="flex justify-between items-center">
            <DialogTitle className="text-xl">{route.name}</DialogTitle>
            <DialogClose className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground">
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </DialogClose>
          </div>
        </DialogHeader>
        
        <Tabs defaultValue="stops">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="stops">Paradas</TabsTrigger>
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
              onEditOrder={handleEditOrder}
            />
            
            <div className="mt-4 flex justify-between items-center">
              <div className="text-sm">
                <p><span className="font-medium">Status da Rota:</span> {route.status}</p>
                <p><span className="font-medium">Data:</span> {formatDateToBR(route.date)}</p>
              </div>
              <Button className="bg-teal-600 hover:bg-teal-700" onClick={handleSaveRoute}>
                <Save size={16} className="mr-2" /> Salvar Rota
              </Button>
            </div>
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
