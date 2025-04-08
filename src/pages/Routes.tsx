
import PageLayout from '@/components/layout/PageLayout';
import { RoutesList } from '@/components/routes/RoutesList';
import { RoutesHeader } from '@/components/routes/RoutesHeader';
import { RouteDetailDialog } from '@/components/routes/RouteDetailDialog';
import { AddOrderDialog } from '@/components/routes/AddOrderDialog';
import { NewRouteDialog } from '@/components/routes/NewRouteDialog';
import { EditRouteDialog } from '@/components/routes/EditRouteDialog';
import { DeleteRouteDialog } from '@/components/routes/DeleteRouteDialog';
import { useRoutesPage } from '@/components/routes/useRoutesPage';

export default function Routes() {
  const {
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
  } = useRoutesPage();

  return (
    <PageLayout title="Roteirização de Entregas">
      <RoutesHeader onNewRoute={() => setIsNewRouteDialogOpen(true)} />
      
      <RoutesList 
        routes={routes}
        onViewRoute={handleViewRoute}
        onEditRoute={handleEditRoute}
        onDeleteRoute={handleDeleteRoute}
        onCreateRoute={() => setIsNewRouteDialogOpen(true)}
      />
      
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

      <DeleteRouteDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDeleteRoute}
        isDeleting={isDeleting}
      />
    </PageLayout>
  );
}
