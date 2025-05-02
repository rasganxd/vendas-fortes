
import { useState } from 'react';
import { DeliveryRoute, RouteStop, Order } from '@/types';
import { useAppContext } from '@/hooks/useAppContext';
import { toast } from '@/components/ui/use-toast';

export const useRoutesPage = () => {
  const { 
    routes, 
    orders, 
    vehicles, 
    updateRoute, 
    addRoute, 
    deleteRoute 
  } = useAppContext();
  
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
      
      // Se a rota que foi excluída era a selecionada, limpar a seleção
      if (selectedRoute && selectedRoute.id === routeToDelete) {
        setSelectedRoute(null);
        setIsViewDialogOpen(false);
        setIsEditRouteDialogOpen(false);
      }
      
      // Fechar o diálogo de confirmação após a exclusão bem-sucedida
      setIsDeleteConfirmOpen(false);
    } catch (error) {
      console.error("Erro ao excluir rota em Routes.tsx:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a rota.",
        variant: "destructive",
      });
    } finally {
      setIsDeleting(false);
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
      zipCode: order.deliveryZip || '',
    };

    const newStop: RouteStop = {
      id: Math.random().toString(36).substring(2, 10),
      orderId: order.id,
      customerName: customer.name,
      address: customer.address,
      city: customer.city,
      state: customer.state,
      zip: customer.zipCode, // Using correct property name
      sequence: selectedRoute.stops.length + 1,
      position: selectedRoute.stops.length + 1,
      status: 'pending',
      lat: 0,
      lng: 0,
      completed: false
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
      position: index + 1
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
      vehicleName: selectedVehicle ? selectedVehicle.name : '',
      status: 'pending', // Use 'pending' instead of 'planning' to match the type
      stops: [],
      driverId: '',
      driverName: '',
      createdAt: new Date(),
      updatedAt: new Date()
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
    return orders.filter(order => {
      // Make sure we filter appropriately based on valid status values
      if (!order.status) return false;
      return !assignedOrderIds.includes(order.id) && 
        ['confirmed', 'draft', 'pending', 'processing'].includes(order.status);
    });
  };

  return {
    routes,
    vehicles,
    selectedRoute,
    isViewDialogOpen,
    setIsViewDialogOpen,
    isAddOrderDialogOpen,
    setIsAddOrderDialogOpen,
    isNewRouteDialogOpen,
    setIsNewRouteDialogOpen,
    isEditRouteDialogOpen,
    setIsEditRouteDialogOpen,
    isDeleteConfirmOpen,
    setIsDeleteConfirmOpen,
    isDeleting,
    handleViewRoute,
    handleEditRoute,
    handleDeleteRoute,
    confirmDeleteRoute,
    handleAddOrderToRoute,
    addOrderToRoute,
    removeOrderFromRoute,
    handleCreateNewRoute,
    handleSaveRouteChanges,
    getUnassignedOrders
  };
};
