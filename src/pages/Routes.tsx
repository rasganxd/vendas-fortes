import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { useRoutes } from '@/hooks/useRoutes';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { MapPin, Plus, Route, Calendar, Truck, Package, X, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { DeliveryRoute, RouteStop, Order } from '@/types';

export default function Routes() {
  const { routes, orders, vehicles, updateRoute, addRoute } = useAppContext();
  const { deleteRoute } = useRoutes();
  const navigate = useNavigate();
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [isNewRouteDialogOpen, setIsNewRouteDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [newRouteName, setNewRouteName] = useState('');
  const [selectedVehicleId, setSelectedVehicleId] = useState('');
  const [selectedDate, setSelectedDate] = useState(new Date());

  const handleViewRoute = (route: DeliveryRoute) => {
    setSelectedRoute(route);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, route: DeliveryRoute) => {
    e.stopPropagation();
    setSelectedRoute(route);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedRoute) {
      await deleteRoute(selectedRoute.id);
      setIsDeleteDialogOpen(false);
      if (isViewDialogOpen) setIsViewDialogOpen(false);
    }
  };

  const handleAddOrderToRoute = () => {
    if (!selectedRoute) return;
    setIsAddOrderDialogOpen(true);
  };

  const addOrderToRoute = (orderId: string) => {
    if (!selectedRoute) return;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    const customer = {
      name: order.customerName,
      address: order.deliveryAddress || '',
      city: order.deliveryCity || '',
      state: order.deliveryState || '',
      zipCode: order.deliveryZipCode || '',
    };

    const newStop: RouteStop = {
      id: Math.random().toString(36).substring(2, 10),
      orderId: order.id,
      customerName: customer.name,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zipCode: customer.zipCode,
      sequence: selectedRoute.stops.length + 1,
      status: 'pending'
    };

    const updatedStops = [...selectedRoute.stops, newStop];
    updateRoute(selectedRoute.id, { stops: updatedStops });
    
    setSelectedRoute({
      ...selectedRoute,
      stops: updatedStops
    });
    
    setIsAddOrderDialogOpen(false);
  };

  const removeOrderFromRoute = (stopId: string) => {
    if (!selectedRoute) return;
    
    const updatedStops = selectedRoute.stops.filter(s => s.id !== stopId);
    
    const resequencedStops = updatedStops.map((stop, index) => ({
      ...stop,
      sequence: index + 1
    }));
    
    updateRoute(selectedRoute.id, { stops: resequencedStops });
    
    setSelectedRoute({
      ...selectedRoute,
      stops: resequencedStops
    });
  };

  const handleCreateNewRoute = () => {
    if (!newRouteName) return;

    const selectedVehicle = vehicles.find(v => v.id === selectedVehicleId);

    const newRoute: Omit<DeliveryRoute, 'id'> = {
      name: newRouteName,
      date: selectedDate,
      vehicleId: selectedVehicleId,
      vehicleName: selectedVehicle ? selectedVehicle.name : undefined,
      status: 'planning',
      stops: []
    };

    addRoute(newRoute);
    setIsNewRouteDialogOpen(false);
    setNewRouteName('');
    setSelectedVehicleId('');
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planejamento</Badge>;
      case 'assigned':
        return <Badge className="bg-neutral-500">Atribuída</Badge>;
      case 'in-progress':
        return <Badge className="bg-neutral-600">Em Progresso</Badge>;
      case 'completed':
        return <Badge className="bg-neutral-700">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getStopStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-neutral-700">Concluída</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getUnassignedOrders = () => {
    if (!selectedRoute) return [];
    
    const assignedOrderIds = selectedRoute.stops.map(stop => stop.orderId);
    return orders.filter(order => 
      !assignedOrderIds.includes(order.id) && 
      (order.status === 'confirmed' || order.status === 'draft')
    );
  };

  return (
    <PageLayout title="Roteirização de Entregas">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Rotas de Entrega</h2>
          <p className="text-gray-500">Gerencie e planeje as rotas para entrega de pedidos</p>
        </div>
        <Button 
          className="bg-neutral-700 hover:bg-neutral-800"
          onClick={() => setIsNewRouteDialogOpen(true)}
        >
          <Plus size={16} className="mr-2" /> Nova Rota
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <Card 
            key={route.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewRoute(route)}
          >
            <div className="bg-neutral-700 text-white p-3 flex justify-between items-center">
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
                
                <div className="pt-3 flex justify-between gap-2">
                  <Button 
                    className="flex-1 bg-neutral-600 hover:bg-neutral-700"
                    onClick={(e) => {e.stopPropagation(); handleViewRoute(route);}}
                  >
                    <Route size={16} className="mr-2" /> Ver Rota
                  </Button>
                  <Button 
                    variant="destructive"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={(e) => handleDeleteClick(e, route)}
                  >
                    <Trash2 size={16} />
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
            <Button 
              className="mt-4 bg-neutral-700 hover:bg-neutral-800"
              onClick={() => setIsNewRouteDialogOpen(true)}
            >
              <Plus size={16} className="mr-2" /> Criar Nova Rota
            </Button>
          </div>
        )}
      </div>
      
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
              <div className="flex justify-between mb-4">
                <Button 
                  variant="destructive"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    setIsDeleteDialogOpen(true);
                  }}
                  disabled={selectedRoute?.status === 'completed'}
                >
                  <Trash2 size={16} className="mr-2" /> Excluir Rota
                </Button>
                
                <Button 
                  onClick={() => handleAddOrderToRoute()}
                  className="bg-neutral-700 hover:bg-neutral-800"
                  disabled={selectedRoute?.status === 'completed'}
                >
                  <Plus size={16} className="mr-2" /> Adicionar Pedido
                </Button>
              </div>
              
              <div className="border rounded-md overflow-hidden">
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 text-gray-700">
                    <tr>
                      <th className="py-2 px-4 text-left">Seq.</th>
                      <th className="py-2 px-4 text-left">Cliente</th>
                      <th className="py-2 px-4 text-left">Endereço</th>
                      <th className="py-2 px-4 text-left">Hora Prevista</th>
                      <th className="py-2 px-4 text-left">Status</th>
                      <th className="py-2 px-4 text-left">Ações</th>
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
                        <td className="py-2 px-4">
                          {selectedRoute?.status !== 'completed' && (
                            <Button 
                              variant="ghost" 
                              size="icon" 
                              className="text-red-500"
                              onClick={() => removeOrderFromRoute(stop.id)}
                            >
                              <X size={16} />
                            </Button>
                          )}
                        </td>
                      </tr>
                    ))}
                    
                    {selectedRoute?.stops.length === 0 && (
                      <tr>
                        <td colSpan={6} className="py-4 text-center text-gray-500">
                          Nenhuma parada adicionada a esta rota
                        </td>
                      </tr>
                    )}
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
      
      <Dialog open={isAddOrderDialogOpen} onOpenChange={setIsAddOrderDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Adicionar Pedido à Rota</DialogTitle>
          </DialogHeader>
          
          <div className="py-4">
            <h3 className="font-medium mb-3">Selecione um pedido para adicionar à rota:</h3>
            {getUnassignedOrders().length > 0 ? (
              <div className="space-y-3 max-h-[300px] overflow-y-auto">
                {getUnassignedOrders().map(order => (
                  <Card key={order.id} className="cursor-pointer hover:bg-gray-50" onClick={() => addOrderToRoute(order.id)}>
                    <CardContent className="p-3">
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{order.customerName}</div>
                          <div className="text-sm text-gray-500">Pedido #{order.id.substring(0, 6)}</div>
                        </div>
                        <div>
                          <Package size={18} />
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            ) : (
              <div className="text-center py-6">
                <p className="text-gray-500">Não há pedidos disponíveis para adicionar à rota.</p>
              </div>
            )}
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOrderDialogOpen(false)}>
              Cancelar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <Dialog open={isNewRouteDialogOpen} onOpenChange={setIsNewRouteDialogOpen}>
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
                      <SelectItem key={vehicle.id} value={vehicle.id}>{vehicle.name}</SelectItem>
                    ))
                  ) : (
                    <SelectItem value="none" disabled>Nenhum veículo cadastrado</SelectItem>
                  )}
                </SelectContent>
              </Select>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNewRouteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button 
              className="bg-neutral-700 hover:bg-neutral-800"
              onClick={handleCreateNewRoute}
              disabled={!newRouteName}
            >
              Criar Rota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a rota "{selectedRoute?.name}"? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={confirmDelete} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
