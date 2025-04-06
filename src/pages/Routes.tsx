
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { MapPin, Plus, Route, Calendar, Truck } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import { DeliveryRoute, RouteStop } from '@/types';

export default function Routes() {
  const { routes } = useAppContext();
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewRoute = (route: DeliveryRoute) => {
    setSelectedRoute(route);
    setIsViewDialogOpen(true);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planejamento</Badge>;
      case 'assigned':
        return <Badge className="bg-blue-500">Atribuída</Badge>;
      case 'in-progress':
        return <Badge className="bg-amber-500">Em Progresso</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStopStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  return (
    <PageLayout title="Roteirização de Entregas">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Rotas de Entrega</h2>
          <p className="text-gray-500">Gerencie e planeje as rotas para entrega de pedidos</p>
        </div>
        <Button className="bg-sales-800 hover:bg-sales-700">
          <Plus size={16} className="mr-2" /> Nova Rota
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <Card key={route.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-sales-800 text-white p-3 flex justify-between items-center">
              <h3 className="font-semibold">{route.name}</h3>
              {getStatusBadge(route.status)}
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Data de Entrega</p>
                    <p className="text-sm text-gray-600">{formatDateToBR(route.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Motorista / Veículo</p>
                    <p className="text-sm text-gray-600">
                      {route.driverName || 'Não atribuído'} / {route.vehicleName || 'Não atribuído'}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <MapPin size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Paradas</p>
                    <p className="text-sm text-gray-600">{route.stops.length} paradas</p>
                  </div>
                </div>
                
                <div className="pt-3">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleViewRoute(route)}
                  >
                    <Route size={16} className="mr-2" /> Ver Rota
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {routes.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
            <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma rota encontrada</h3>
            <p className="text-gray-500">Crie uma nova rota para começar a planejar suas entregas</p>
            <Button className="mt-4 bg-sales-800 hover:bg-sales-700">
              <Plus size={16} className="mr-2" /> Criar Nova Rota
            </Button>
          </div>
        )}
      </div>
      
      {/* View Route Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedRoute?.name}</DialogTitle>
          </DialogHeader>
          
          <Tabs defaultValue="stops">
            <TabsList className="grid grid-cols-2 mb-4">
              <TabsTrigger value="stops">Paradas</TabsTrigger>
              <TabsTrigger value="map">Mapa</TabsTrigger>
            </TabsList>
            
            <TabsContent value="stops">
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-2 px-4 text-left">Seq.</th>
                      <th className="py-2 px-4 text-left">Cliente</th>
                      <th className="py-2 px-4 text-left">Endereço</th>
                      <th className="py-2 px-4 text-left">Hora Prevista</th>
                      <th className="py-2 px-4 text-left">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {selectedRoute?.stops.sort((a, b) => a.sequence - b.sequence).map((stop) => (
                      <tr key={stop.id} className="border-b">
                        <td className="py-2 px-4">{stop.sequence}</td>
                        <td className="py-2 px-4 font-medium">{stop.customerName}</td>
                        <td className="py-2 px-4">
                          {stop.address}, {stop.city}/{stop.state}
                        </td>
                        <td className="py-2 px-4">
                          {stop.estimatedArrival ? new Date(stop.estimatedArrival).toLocaleTimeString('pt-BR', {
                            hour: '2-digit',
                            minute: '2-digit'
                          }) : '-'}
                        </td>
                        <td className="py-2 px-4">{getStopStatusBadge(stop.status)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <div className="text-sm">
                  <p><span className="font-medium">Status da Rota:</span> {selectedRoute?.status}</p>
                  <p><span className="font-medium">Data:</span> {selectedRoute ? formatDateToBR(selectedRoute.date) : ''}</p>
                </div>
                <Button className="bg-teal-600 hover:bg-teal-700">
                  Otimizar Rota
                </Button>
              </div>
            </TabsContent>
            
            <TabsContent value="map" className="h-[400px] bg-gray-100 rounded-md flex items-center justify-center">
              <div className="text-center">
                <MapPin size={48} className="mx-auto text-gray-400 mb-2" />
                <p className="text-gray-500">Visualização de mapa não disponível na versão atual.</p>
              </div>
            </TabsContent>
          </Tabs>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
