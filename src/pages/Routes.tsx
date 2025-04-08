
import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Plus } from 'lucide-react';
import { DeliveryRoute, RouteStop } from '@/types';
import { RouteCard } from '@/components/routes/RouteCard';
import { EmptyRoutes } from '@/components/routes/EmptyRoutes';
import { RouteDetailDialog } from '@/components/routes/RouteDetailDialog';
import { AddOrderDialog } from '@/components/routes/AddOrderDialog';
import { NewRouteDialog } from '@/components/routes/NewRouteDialog';
import { EditRouteDialog } from '@/components/routes/EditRouteDialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { toast } from '@/components/ui/use-toast';

export default function Routes() {
  const { routes, orders, vehicles, updateRoute, addRoute, deleteRoute } = useAppContext();
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [isNewRouteDialogOpen, setIsNewRouteDialogOpen] = useState(false);
  const [isEditRouteDialogOpen, setIsEditRouteDialogOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [routeToDelete, setRouteToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const handleViewRoute = (route: DeliveryRoute) => {
    setSelectedRoute(route);
    setIsViewDialogOpen(true);
  };

  const handleEditRoute = (route: DeliveryRoute) => {
    setSelectedRoute(route);
    setIsEditRouteDialogOpen(true);
  };

  const handleDeleteRoute = (id: string) => {
    setRouteToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteRoute = async () => {
    if (!routeToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log("Confirmando exclusão da rota:", routeToDelete);
      await deleteRoute(routeToDelete);
      setIsDeleteConfirmOpen(false);
      setRouteToDelete(null);
      
      // Se a rota que foi excluída era a selecionada, limpar a seleção
      if (selectedRoute && selectedRoute.id === routeToDelete) {
        setSelectedRoute(null);
        setIsViewDialogOpen(false);
        setIsEditRouteDialogOpen(false);
      }
    } catch (error) {
      console.error("Erro ao excluir rota em Routes.tsx:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a rota.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setRouteToDelete(null);
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

  const handleCreateNewRoute = (name: string, date: Date, vehicleId: string) => {
    const selectedVehicle = vehicles.find(v => v.id === vehicleId);

    const newRoute: Omit<DeliveryRoute, 'id'> = {
      name: name,
      date: date,
      vehicleId: vehicleId,
      vehicleName: selectedVehicle ? selectedVehicle.name : undefined,
      status: 'planning',
      stops: []
    };

    addRoute(newRoute);
    setIsNewRouteDialogOpen(false);
  };

  const handleSaveRouteChanges = async (id: string, updatedRoute: Partial<DeliveryRoute>) => {
    await updateRoute(id, updatedRoute);
    toast({
      title: "Rota atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
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
          className="bg-sales-800 hover:bg-sales-700"
          onClick={() => setIsNewRouteDialogOpen(true)}
        >
          <Plus size={16} className="mr-2" /> Nova Rota
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {routes.map((route) => (
          <RouteCard 
            key={route.id} 
            route={route} 
            onViewRoute={handleViewRoute}
            onEditRoute={handleEditRoute}
            onDeleteRoute={handleDeleteRoute}
          />
        ))}
        
        {routes.length === 0 && (
          <EmptyRoutes onCreateRoute={() => setIsNewRouteDialogOpen(true)} />
        )}
      </div>
      
      <RouteDetailDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        route={selectedRoute}
        onAddOrder={handleAddOrderToRoute}
        onRemoveStop={removeOrderFromRoute}
      />
      
      <AddOrderDialog
        open={isAddOrderDialogOpen}
        onOpenChange={setIsAddOrderDialogOpen}
        orders={getUnassignedOrders()}
        onAddOrder={addOrderToRoute}
      />
      
      <NewRouteDialog
        open={isNewRouteDialogOpen}
        onOpenChange={setIsNewRouteDialogOpen}
        vehicles={vehicles}
        onCreateRoute={handleCreateNewRoute}
      />

      <EditRouteDialog
        open={isEditRouteDialogOpen}
        onOpenChange={setIsEditRouteDialogOpen}
        route={selectedRoute}
        vehicles={vehicles}
        onSave={handleSaveRouteChanges}
      />

      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir esta rota? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={confirmDeleteRoute} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
