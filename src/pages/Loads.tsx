
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { useLoads } from '@/hooks/useLoads';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { Package, Truck, Calendar, ListChecks, Plus, FileCheck, Weight, Trash2 } from 'lucide-react';
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
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { Load } from '@/types';

export default function Loads() {
  const navigate = useNavigate();
  const { loads } = useAppContext();
  const { deleteLoad } = useLoads();
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);

  const handleViewLoad = (load: Load) => {
    setSelectedLoad(load);
    setIsViewDialogOpen(true);
  };

  const handleDeleteClick = (e: React.MouseEvent, load: Load) => {
    e.stopPropagation();
    setSelectedLoad(load);
    setIsDeleteDialogOpen(true);
  };

  const confirmDelete = async () => {
    if (selectedLoad) {
      await deleteLoad(selectedLoad.id);
      setIsDeleteDialogOpen(false);
      if (isViewDialogOpen) setIsViewDialogOpen(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'planning':
        return <Badge variant="outline">Planejamento</Badge>;
      case 'loading':
        return <Badge className="bg-neutral-500">Carregando</Badge>;
      case 'loaded':
        return <Badge className="bg-neutral-600">Carregado</Badge>;
      case 'in-transit':
        return <Badge className="bg-neutral-700">Em Trânsito</Badge>;
      case 'delivered':
        return <Badge className="bg-neutral-800">Entregue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'loaded':
        return <Badge className="bg-neutral-600">Carregado</Badge>;
      case 'delivered':
        return <Badge className="bg-neutral-800">Entregue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLoadProgress = (status: string) => {
    switch (status) {
      case 'planning': return 20;
      case 'loading': return 40;
      case 'loaded': return 60;
      case 'in-transit': return 80;
      case 'delivered': return 100;
      default: return 0;
    }
  };

  return (
    <PageLayout title="Montagem de Cargas">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Cargas</h2>
          <p className="text-gray-500">Gerencie a separação e carregamento de pedidos</p>
        </div>
        <Button 
          className="bg-neutral-700 hover:bg-neutral-800"
          onClick={() => navigate('/cargas/montar')}
        >
          <Plus size={16} className="mr-2" /> Nova Carga
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loads.map((load) => (
          <Card 
            key={load.id} 
            className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer"
            onClick={() => handleViewLoad(load)}
          >
            <div className="bg-neutral-700 text-white p-3 flex justify-between items-center">
              <h3 className="font-semibold">{load.name}</h3>
              {getStatusBadge(load.status)}
            </div>
            <CardContent className="p-4">
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Data</p>
                    <p className="text-sm text-gray-600">{formatDateToBR(load.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Truck size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Veículo</p>
                    <p className="text-sm text-gray-600">{load.vehicleName || 'Não atribuído'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-3">
                  <Package size={18} className="text-gray-500 mt-0.5" />
                  <div>
                    <p className="text-sm font-medium">Pedidos</p>
                    <p className="text-sm text-gray-600">{load.items.length} pedidos</p>
                  </div>
                </div>
                
                <div className="pt-1">
                  <div className="flex items-center justify-between mb-1">
                    <p className="text-sm font-medium">Progresso</p>
                    <p className="text-sm font-medium">{getLoadProgress(load.status)}%</p>
                  </div>
                  <Progress value={getLoadProgress(load.status)} className="h-2 [&>div]:bg-gradient-to-r [&>div]:from-neutral-500 [&>div]:to-neutral-700" />
                </div>
                
                <div className="pt-3 flex justify-between gap-2">
                  <Button 
                    className="flex-1 bg-neutral-600 hover:bg-neutral-700"
                    onClick={(e) => {e.stopPropagation(); handleViewLoad(load);}}
                  >
                    <ListChecks size={16} className="mr-2" /> Detalhes
                  </Button>
                  <Button 
                    variant="destructive"
                    size="icon"
                    className="flex-shrink-0"
                    onClick={(e) => handleDeleteClick(e, load)}
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {loads.length === 0 && (
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma carga encontrada</h3>
            <p className="text-gray-500">Crie uma nova carga para começar a montar seus pedidos</p>
            <Button 
              className="mt-4 bg-neutral-700 hover:bg-neutral-800"
              onClick={() => navigate('/cargas/montar')}
            >
              <Plus size={16} className="mr-2" /> Nova Carga
            </Button>
          </div>
        )}
      </div>
      
      {/* View Load Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-xl font-bold">{selectedLoad?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={18} className="text-blue-600" />
                <p className="font-medium">Data</p>
              </div>
              <p>{selectedLoad ? formatDateToBR(selectedLoad.date) : ''}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Truck size={18} className="text-blue-600" />
                <p className="font-medium">Veículo</p>
              </div>
              <p>{selectedLoad?.vehicleName || 'Não atribuído'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-1">
                <Package size={18} className="text-blue-600" />
                <p className="font-medium">Status</p>
              </div>
              <div>{selectedLoad && getStatusBadge(selectedLoad.status)}</div>
            </div>
          </div>
          
          <div className="border rounded-md shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-3 border-b">
              <h3 className="font-medium">Itens da Carga</h3>
            </div>
            <div className="p-3">
              <Accordion type="multiple" className="w-full">
                {selectedLoad?.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border rounded-md mb-2 shadow-sm">
                    <AccordionTrigger className="hover:bg-gray-50 px-3 py-2">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <FileCheck size={18} className="text-blue-600" />
                          <span className="font-medium">Pedido: {item.orderId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getItemStatusBadge(item.status)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 border-t bg-white">
                      <div className="py-3">
                        <div className="flex items-center justify-between mb-2">
                          <div className="flex items-center gap-2">
                            <Weight size={16} className="text-blue-600" />
                            <span>Peso Total: <span className="font-medium">{item.totalWeight || 0} kg</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package size={16} className="text-blue-600" />
                            <span>Volume: <span className="font-medium">{item.totalVolume || 0} m³</span></span>
                          </div>
                        </div>
                        <div className="border rounded-md mt-2">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="py-2 px-3 text-left font-medium text-gray-700">Produto</th>
                                <th className="py-2 px-3 text-right font-medium text-gray-700">Qtd</th>
                                <th className="py-2 px-3 text-right font-medium text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.orderItems.map((orderItem) => (
                                <tr key={orderItem.id} className="border-t">
                                  <td className="py-2 px-3 text-gray-800">{orderItem.productName}</td>
                                  <td className="py-2 px-3 text-right font-medium">{orderItem.quantity}</td>
                                  <td className="py-2 px-3 text-right">
                                    <Badge variant="outline">Pendente</Badge>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      </div>
                    </AccordionContent>
                  </AccordionItem>
                ))}
                
                {selectedLoad?.items.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    Nenhum item adicionado a esta carga
                  </div>
                )}
              </Accordion>
            </div>
          </div>
          
          <div className="flex justify-between gap-3 mt-4">
            <Button 
              variant="destructive" 
              onClick={() => {
                setIsViewDialogOpen(false);
                setSelectedLoad(selectedLoad);
                setIsDeleteDialogOpen(true);
              }}
            >
              <Trash2 size={16} className="mr-2" /> Excluir Carga
            </Button>
            <div className="flex gap-3">
              <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>
                Fechar
              </Button>
              <Button className="bg-blue-600 hover:bg-blue-700">
                Atualizar Status
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a carga "{selectedLoad?.name}"? Esta ação não pode ser desfeita.
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
