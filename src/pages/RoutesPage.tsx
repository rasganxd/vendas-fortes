
import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { RoutesList } from '@/components/routes/RoutesList';
import { RoutesHeader } from '@/components/routes/RoutesHeader';
import { RouteDetailDialog } from '@/components/routes/RouteDetailDialog';
import { AddOrderDialog } from '@/components/routes/AddOrderDialog';
import { NewRouteDialog } from '@/components/routes/NewRouteDialog';
import { EditRouteDialog } from '@/components/routes/EditRouteDialog';
import { DeleteRouteDialog } from '@/components/routes/DeleteRouteDialog';
import { useRoutesPage } from '@/components/routes/useRoutesPage';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription
} from '@/components/ui/card';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { MapPin, Truck, Route, Navigation } from 'lucide-react';

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

  // Status colors mapping
  const getStatusColor = (status: string) => {
    switch(status) {
      case 'planning': return 'bg-blue-100 text-blue-800';
      case 'assigned': return 'bg-yellow-100 text-yellow-800';
      case 'in-progress': return 'bg-purple-100 text-purple-800';
      case 'completed': return 'bg-green-100 text-green-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  // Get status label in Portuguese
  const getStatusLabel = (status: string) => {
    switch(status) {
      case 'planning': return 'Planejamento';
      case 'assigned': return 'Atribuída';
      case 'in-progress': return 'Em Progresso';
      case 'completed': return 'Concluída';
      default: return status;
    }
  };

  return (
    <PageLayout title="Roteirização de Entregas">
      <RoutesHeader onNewRoute={() => setIsNewRouteDialogOpen(true)} />
      
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        {/* Routes Card */}
        <Card className="md:col-span-9">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Rotas de Entrega</CardTitle>
            <CardDescription>
              Lista de rotas cadastradas para entregas
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="border rounded-md overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead>Veículo</TableHead>
                    <TableHead>Data</TableHead>
                    <TableHead>Status</TableHead>
                    <TableHead className="text-right">Ações</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {routes.length > 0 ? (
                    routes.map((route) => (
                      <TableRow key={route.id}>
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <Route size={16} className="mr-2 text-sales-800" />
                            {route.name}
                          </div>
                        </TableCell>
                        <TableCell>
                          {route.vehicleName ? (
                            <div className="flex items-center">
                              <Truck size={16} className="mr-1 text-gray-500" />
                              {route.vehicleName}
                            </div>
                          ) : (
                            <span className="text-gray-400 text-sm">Não atribuído</span>
                          )}
                        </TableCell>
                        <TableCell>{formatDateToBR(route.date)}</TableCell>
                        <TableCell>
                          <Badge className={`${getStatusColor(route.status)} font-normal`}>
                            {getStatusLabel(route.status)}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleViewRoute(route)}
                            >
                              Ver
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              onClick={() => handleEditRoute(route)}
                            >
                              Editar
                            </Button>
                            <Button 
                              variant="outline" 
                              size="sm"
                              className="text-destructive hover:text-destructive"
                              onClick={() => handleDeleteRoute(route.id)}
                            >
                              Excluir
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="h-24 text-center">
                        <div className="flex flex-col items-center justify-center text-gray-500">
                          <MapPin size={24} className="mb-2" />
                          <p>Nenhuma rota cadastrada</p>
                          <Button 
                            variant="link"
                            onClick={() => setIsNewRouteDialogOpen(true)}
                            className="mt-2"
                          >
                            Criar Nova Rota
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
        
        {/* Route Information Card */}
        <Card className="md:col-span-3">
          <CardHeader className="py-4">
            <CardTitle className="text-lg">Informações</CardTitle>
            <CardDescription>Detalhes sobre as rotas</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <MapPin className="h-4 w-4 text-sales-800 mr-2" />
                  <span className="text-sm font-medium">Total de Rotas</span>
                </div>
                <Badge variant="outline" className="font-medium text-md">
                  {routes.length}
                </Badge>
              </div>
              
              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Truck className="h-4 w-4 text-sales-800 mr-2" />
                  <span className="text-sm font-medium">Veículos</span>
                </div>
                <Badge variant="outline" className="font-medium text-md">
                  {vehicles.filter(v => v.active).length}
                </Badge>
              </div>

              <div className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-md">
                <div className="flex items-center">
                  <Navigation className="h-4 w-4 text-green-600 mr-2" />
                  <span className="text-sm font-medium">Concluídas</span>
                </div>
                <Badge variant="outline" className="font-medium text-md">
                  {routes.filter(r => r.status === 'completed').length}
                </Badge>
              </div>
              
              <div className="mt-4">
                <Button 
                  className="w-full bg-sales-800 hover:bg-sales-700 text-sm py-1"
                  onClick={() => setIsNewRouteDialogOpen(true)}
                  size="sm"
                >
                  Nova Rota
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
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

      <DeleteRouteDialog
        open={isDeleteConfirmOpen}
        onOpenChange={setIsDeleteConfirmOpen}
        onConfirm={confirmDeleteRoute}
        isDeleting={isDeleting}
      />
    </PageLayout>
  );
}
