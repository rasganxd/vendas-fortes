
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { useLoads } from '@/hooks/useLoads';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, Printer, Lock } from 'lucide-react';
import { Load } from '@/types';
import { LoadCard } from '@/components/loads/LoadCard';
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
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { formatDateToBR } from '@/lib/date-utils';
import { FileCheck, Weight, Calendar, Truck, Package } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

export default function Loads() {
  const navigate = useNavigate();
  const { loads, customers } = useAppContext();
  const { deleteLoad, updateLoad, getOrdersFromLoad } = useLoads();
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false);

  const handleViewLoad = (load: Load) => {
    setSelectedLoad(load);
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

  const handlePrintLoad = (load: Load) => {
    setSelectedLoad(load);
    setIsPrintDialogOpen(true);
  };

  const confirmDeleteLoad = async () => {
    if (!selectedLoad) return;
    
    try {
      await deleteLoad(selectedLoad.id);
      setIsDeleteDialogOpen(false);
      toast({
        title: "Carga excluída",
        description: "A carga foi excluída com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao excluir carga:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a carga.",
        variant: "destructive",
      });
    }
  };

  const handleUpdateLoad = async (id: string, updatedLoad: Partial<Load>) => {
    await updateLoad(id, updatedLoad);
    toast({
      title: "Carga atualizada",
      description: "As alterações foram salvas com sucesso.",
    });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planejamento</Badge>;
      case 'loading':
        return <Badge className="bg-blue-500">Carregando</Badge>;
      case 'loaded':
        return <Badge className="bg-amber-500">Carregado</Badge>;
      case 'in-transit':
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

  return (
    <PageLayout title="Montagem de Cargas">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Cargas</h2>
          <p className="text-gray-500">Gerencie a separação e carregamento de pedidos</p>
        </div>
        <Button 
          className="bg-sales-800 hover:bg-sales-700"
          onClick={() => navigate('/cargas/montar')}
        >
          <Plus size={16} className="mr-2" /> Montar Carga
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loads.map((load) => (
          <LoadCard
            key={load.id}
            load={load}
            onView={handleViewLoad}
            onEdit={handleEditLoad}
            onDelete={handleDeleteLoad}
            onPrint={() => handlePrintLoad(load)}
          />
        ))}
        
        {loads.length === 0 && <EmptyLoads />}
      </div>
      
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedLoad?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-3 gap-3 mb-4 text-sm">
            <div className="bg-gray-50 p-2 rounded-md">
              <div className="flex items-center gap-1.5 mb-1 text-gray-600">
                <Calendar size={14} />
                <span>Data</span>
              </div>
              <p>{selectedLoad ? formatDateToBR(selectedLoad.date) : ''}</p>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-md">
              <div className="flex items-center gap-1.5 mb-1 text-gray-600">
                <Truck size={14} />
                <span>Veículo</span>
              </div>
              <p>{selectedLoad?.vehicleName || 'Não atribuído'}</p>
            </div>
            
            <div className="bg-gray-50 p-2 rounded-md">
              <div className="flex items-center gap-1.5 mb-1 text-gray-600">
                <Package size={14} />
                <span>Status</span>
              </div>
              <div className="flex items-center gap-2">
                <span>{selectedLoad ? getStatusBadge(selectedLoad.status) : ''}</span>
                {selectedLoad?.locked && (
                  <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                    <Lock className="h-3 w-3 mr-1" /> Bloqueada
                  </Badge>
                )}
              </div>
            </div>
          </div>
          
          <div className="border rounded-md mb-3">
            <div className="bg-gray-50 p-2 border-b flex justify-between items-center">
              <h3 className="font-medium text-sm">Itens da Carga</h3>
              {selectedLoad && (
                <Button 
                  variant="outline" 
                  size="sm"
                  className="flex items-center gap-1"
                  onClick={() => {
                    setIsViewDialogOpen(false);
                    handlePrintLoad(selectedLoad);
                  }}
                >
                  <Printer size={14} />
                  <span>Imprimir Romaneio</span>
                </Button>
              )}
            </div>
            <div className="p-3">
              <Accordion type="multiple" className="w-full text-sm">
                {selectedLoad?.items?.map((item) => {
                  // Get orders from context to find customer code
                  const orderId = item.orderId || '';
                  const orders = getOrdersFromLoad(selectedLoad);
                  const order = orders.find(o => o.id === orderId);
                  const customerCode = order ? getCustomerCode(order.customerId) : "-";
                  
                  return (
                    <AccordionItem key={item.id || `${orderId}-${item.productId}`} value={item.id || item.orderId || ''} className="border-b last:border-0">
                      <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-gray-50">
                        <div className="flex items-center justify-between w-full">
                          <div className="flex items-center gap-2">
                            <FileCheck size={14} className="text-gray-500" />
                            <span>Cliente: {customerCode}</span>
                          </div>
                        </div>
                      </AccordionTrigger>
                      <AccordionContent className="px-2 py-2 border-t text-xs">
                        <div className="flex items-center justify-between text-gray-600 mb-2">
                          <div className="flex items-center gap-1">
                            <Weight size={12} />
                            <span>Peso: {item.totalWeight || 0} kg</span>
                          </div>
                          <div className="flex items-center gap-1">
                            <Package size={12} />
                            <span>Volume: {item.totalVolume || 0} m³</span>
                          </div>
                        </div>
                        <div className="border rounded-md mt-2">
                          <table className="w-full">
                            <thead className="bg-gray-50 text-xs text-gray-600">
                              <tr>
                                <th className="py-1.5 px-2 text-left">Produto</th>
                                <th className="py-1.5 px-2 text-right">Qtd</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.orderItems?.map((orderItem) => (
                                <tr key={orderItem.id} className="border-t">
                                  <td className="py-1.5 px-2">{orderItem.productName}</td>
                                  <td className="py-1.5 px-2 text-right">{orderItem.quantity}</td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </AccordionContent>
                    </AccordionItem>
                  );
                })}
              </Accordion>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            <Button 
              className="bg-sales-800 hover:bg-sales-700"
              onClick={() => {
                setIsViewDialogOpen(false);
                if (selectedLoad) handleEditLoad(selectedLoad);
              }}
            >
              Editar Carga
            </Button>
          </DialogFooter>
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
              orders={getOrdersFromLoad(selectedLoad)} 
              onClose={() => setIsPrintDialogOpen(false)} 
              loadName={selectedLoad.name}
            />
          )}
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
