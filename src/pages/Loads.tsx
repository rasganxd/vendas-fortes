
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Printer, Lock } from 'lucide-react';
import { Load, Order } from '@/types';
import { EmptyLoads } from '@/components/loads/EmptyLoads';
import { EditLoadDialog } from '@/components/loads/EditLoadDialog';
import { DeleteLoadDialog } from '@/components/loads/DeleteLoadDialog';
import LoadPickingList from '@/components/loads/LoadPickingList';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { formatDateToBR, ensureDate } from '@/lib/date-utils';
import { FileCheck, Weight, Calendar, Truck, Package } from 'lucide-react';
import { toast } from 'sonner';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';

export default function Loads() {
  const navigate = useNavigate();
  const { loads, customers, orders, updateLoad, deleteLoad } = useAppContext();
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);
  const [loadOrders, setLoadOrders] = useState<Order[]>([]);

  const handleViewLoad = async (load: Load) => {
    setSelectedLoad(load);
    // Get orders for this load
    const ordersForLoad = orders.filter(order => 
      load.orderIds?.includes(order.id)
    );
    setLoadOrders(ordersForLoad);
    setIsViewDialogOpen(true);
  };

  const handleEditLoad = (load: Load) => {
    setSelectedLoad(load);
    setIsEditDialogOpen(true);
  };

  const handleDeleteLoad = (id: string) => {
    const loadToDelete = loads.find(l => l.id === id);
    if (loadToDelete) {
      setSelectedLoad(loadToDelete);
      setIsDeleteDialogOpen(true);
    }
  };

  const handlePrintLoad = async (load: Load) => {
    setSelectedLoad(load);
    // Get orders for this load
    const ordersForLoad = orders.filter(order => 
      load.orderIds?.includes(order.id)
    );
    setLoadOrders(ordersForLoad);
    setIsPrintDialogOpen(true);
  };

  const confirmDeleteLoad = async () => {
    if (!selectedLoad) return;
    
    try {
      await deleteLoad(selectedLoad.id);
      setIsDeleteDialogOpen(false);
      setSelectedLoad(null);
    } catch (error) {
      console.error("Erro ao excluir carga:", error);
      // Error is already handled in useLoads with toast
    }
  };

  const handleUpdateLoad = async (id: string, updatedLoad: Partial<Load>) => {
    try {
      await updateLoad(id, updatedLoad);
      setIsEditDialogOpen(false);
      setSelectedLoad(null);
    } catch (error) {
      console.error("Erro ao atualizar carga:", error);
      // Error is already handled in useLoads with toast
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planejamento</Badge>;
      case 'loading':
        return <Badge className="bg-blue-500">Carregando</Badge>;
      case 'loaded':
        return <Badge className="bg-amber-500">Carregado</Badge>;
      case 'in_transit':
        return <Badge className="bg-purple-500">Em Trânsito</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  // Get customer code for an order
  const getCustomerCode = (customerId: string) => {
    const customer = customers.find(c => c.id === customerId);
    return customer?.code || "-";
  };

  // Function to get a simplified view of orders in a load
  const renderSimplifiedOrdersList = (orders: Order[]) => {
    if (!orders || orders.length === 0) {
      return (
        <div className="text-center py-4 text-gray-500">
          Nenhum pedido adicionado a esta carga
        </div>
      );
    }

    return (
      <table className="w-full text-sm">
        <thead className="bg-gray-50 text-gray-600">
          <tr>
            <th className="py-2 px-3 text-left">Cliente</th>
            <th className="py-2 px-3 text-center">Produtos</th>
            <th className="py-2 px-3 text-right">Total</th>
          </tr>
        </thead>
        <tbody>
          {orders.map((order) => {
            const customerCode = getCustomerCode(order.customerId);
            return (
              <tr key={order.id} className="border-t">
                <td className="py-2 px-3">
                  <span className="font-medium">{customerCode}</span> - {order.customerName}
                </td>
                <td className="py-2 px-3 text-center">{order.items.length}</td>
                <td className="py-2 px-3 text-right">
                  {order.total.toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    );
  };

  return (
    <PageLayout title="Montagem de Cargas">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Cargas</h2>
          <p className="text-gray-500">Gerencie a separação e carregamento de pedidos</p>
        </div>
        <Button 
          className="bg-sales-800 hover:bg-sales-700"
          onClick={() => navigate('/carregamentos/montar')}
        >
          <Plus size={16} className="mr-2" /> Montar Carga
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loads.map((load) => (
          <Card key={load.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">{load.name}</CardTitle>
              <div className="flex items-center gap-2">
                {getStatusBadge(load.status)}
                {load.locked && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    <Lock className="h-3 w-3 mr-1" /> Bloqueada
                  </Badge>
                )}
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm text-gray-600">
                <div className="flex justify-between">
                  <span>Data:</span>
                  <span>{formatDateToBR(ensureDate(load.date))}</span>
                </div>
                <div className="flex justify-between">
                  <span>Veículo:</span>
                  <span>{load.vehicleName || 'Não atribuído'}</span>
                </div>
                <div className="flex justify-between">
                  <span>Pedidos:</span>
                  <span>{load.orderIds?.length || 0}</span>
                </div>
                <div className="flex justify-between">
                  <span>Total:</span>
                  <span className="font-medium">
                    {(load.total || 0).toLocaleString('pt-BR', {
                      style: 'currency',
                      currency: 'BRL'
                    })}
                  </span>
                </div>
              </div>
              <div className="flex gap-2 mt-4">
                <Button variant="outline" size="sm" onClick={() => handleViewLoad(load)}>
                  Ver
                </Button>
                <Button variant="outline" size="sm" onClick={() => handleEditLoad(load)}>
                  Editar
                </Button>
                <Button variant="outline" size="sm" onClick={() => handlePrintLoad(load)}>
                  <Printer className="h-4 w-4" />
                </Button>
                <Button 
                  variant="outline" 
                  size="sm" 
                  className="text-destructive hover:text-destructive" 
                  onClick={() => handleDeleteLoad(load.id)}
                >
                  Excluir
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {loads.length === 0 && <EmptyLoads />}
      </div>
      
      {/* View Load Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Detalhes da Carga: {selectedLoad?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedLoad && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Status:</strong> {getStatusBadge(selectedLoad.status)}
                </div>
                <div>
                  <strong>Data:</strong> {formatDateToBR(ensureDate(selectedLoad.date))}
                </div>
                <div>
                  <strong>Veículo:</strong> {selectedLoad.vehicleName || 'Não atribuído'}
                </div>
                <div>
                  <strong>Representante:</strong> {selectedLoad.salesRepName || 'Não atribuído'}
                </div>
                <div>
                  <strong>Total:</strong> {(selectedLoad.total || 0).toLocaleString('pt-BR', {
                    style: 'currency',
                    currency: 'BRL'
                  })}
                </div>
                <div>
                  <strong>Pedidos:</strong> {selectedLoad.orderIds?.length || 0}
                </div>
              </div>
              
              {selectedLoad.notes && (
                <div>
                  <strong>Observações:</strong>
                  <p className="mt-1 text-gray-600">{selectedLoad.notes}</p>
                </div>
              )}
              
              <div>
                <strong>Pedidos incluídos:</strong>
                {renderSimplifiedOrdersList(loadOrders)}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
      
      <EditLoadDialog 
        open={isEditDialogOpen}
        onOpenChange={setIsEditDialogOpen}
        load={selectedLoad}
        onSave={handleUpdateLoad}
      />
      
      <DeleteLoadDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
        onConfirm={confirmDeleteLoad}
        loadName={selectedLoad?.name}
      />
      
      <Dialog 
        open={isPrintDialogOpen} 
        onOpenChange={setIsPrintDialogOpen}
      >
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-auto">
          <DialogHeader>
            <DialogTitle>Romaneio de Separação: {selectedLoad?.name}</DialogTitle>
          </DialogHeader>
          
          {selectedLoad && (
            <LoadPickingList 
              orders={loadOrders} 
              onClose={() => setIsPrintDialogOpen(false)} 
              loadName={selectedLoad.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
