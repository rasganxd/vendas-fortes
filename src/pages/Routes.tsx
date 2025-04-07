
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

export default function Routes() {
  const { routes, orders, vehicles, updateRoute, addRoute } = useAppContext();
  const [selectedRoute, setSelectedRoute] = useState<DeliveryRoute | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isAddOrderDialogOpen, setIsAddOrderDialogOpen] = useState(false);
  const [isNewRouteDialogOpen, setIsNewRouteDialogOpen] = useState(false);

  const handleViewRoute = (route: DeliveryRoute) => {
    setSelectedRoute(route);
    setIsViewDialogOpen(true);
  };

  const handleAddOrderToRoute = () => {
    if (!selectedRoute) return;
    setIsAddOrderDialogOpen(true);
  };

  const addOrderToRoute = (orderId: string) => {
    if (!selectedRoute) return;
    
    const order = orders.find(o => o.id === orderId);
    if (!order) return;

    // Find customer info from order
    const customer = {
      name: order.customerName,
      address: order.deliveryAddress || '',
      city: order.deliveryCity || '',
      state: order.deliveryState || '',
      zipCode: order.deliveryZipCode || '',
    };

    // Create new stop
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

    // Update route with new stop
    const updatedStops = [...selectedRoute.stops, newStop];
    updateRoute(selectedRoute.id, { stops: updatedStops });
    
    // Update selected route in state
    setSelectedRoute({
      ...selectedRoute,
      stops: updatedStops
    });
    
    setIsAddOrderDialogOpen(false);
  };

  const removeOrderFromRoute = (stopId: string) => {
    if (!selectedRoute) return;
    
    // Filter out the stop to remove
    const updatedStops = selectedRoute.stops.filter(s => s.id !== stopId);
    
    // Resequence remaining stops
    const resequencedStops = updatedStops.map((stop, index) => ({
      ...stop,
      sequence: index + 1
    }));
    
    // Update route with new stops
    updateRoute(selectedRoute.id, { stops: resequencedStops });
    
    // Update selected route in state
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

  // Get orders not already assigned to the selected route
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
          />
        ))}
        
        {routes.length === 0 && (
          <EmptyRoutes onCreateRoute={() => setIsNewRouteDialogOpen(true)} />
        )}
      </div>
      
      {/* Route Detail Dialog */}
      <RouteDetailDialog
        open={isViewDialogOpen}
        onOpenChange={setIsViewDialogOpen}
        route={selectedRoute}
        onAddOrder={handleAddOrderToRoute}
        onRemoveStop={removeOrderFromRoute}
      />
      
      {/* Add Order Dialog */}
      <AddOrderDialog
        open={isAddOrderDialogOpen}
        onOpenChange={setIsAddOrderDialogOpen}
        orders={getUnassignedOrders()}
        onAddOrder={addOrderToRoute}
      />
      
      {/* New Route Dialog */}
      <NewRouteDialog
        open={isNewRouteDialogOpen}
        onOpenChange={setIsNewRouteDialogOpen}
        vehicles={vehicles}
        onCreateRoute={handleCreateNewRoute}
      />
    </PageLayout>
  );
}
