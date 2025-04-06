
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { Package, Truck, Calendar, ListChecks, Plus, FileCheck, Weight } from 'lucide-react';
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
} from '@/components/ui/dialog';
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Progress } from '@/components/ui/progress';
import { Load } from '@/types';

export default function Loads() {
  const { loads } = useAppContext();
  const [selectedLoad, setSelectedLoad] = useState<Load | null>(null);
  const [isViewDialogOpen, setIsViewDialogOpen] = useState(false);

  const handleViewLoad = (load: Load) => {
    setSelectedLoad(load);
    setIsViewDialogOpen(true);
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

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline">Pendente</Badge>;
      case 'loaded':
        return <Badge className="bg-amber-500">Carregado</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500">Entregue</Badge>;
      default:
        return <Badge>{status}</Badge>;
    }
  };

  const getLoadProgress = (status: string) => {
    switch (status) {
      case 'planning':
        return 20;
      case 'loading':
        return 40;
      case 'loaded':
        return 60;
      case 'in-transit':
        return 80;
      case 'delivered':
        return 100;
      default:
        return 0;
    }
  };

  return (
    <PageLayout title="Montagem de Cargas">
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Cargas</h2>
          <p className="text-gray-500">Gerencie a separação e carregamento de pedidos</p>
        </div>
        <Button className="bg-sales-800 hover:bg-sales-700">
          <Plus size={16} className="mr-2" /> Nova Carga
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {loads.map((load) => (
          <Card key={load.id} className="overflow-hidden hover:shadow-lg transition-shadow">
            <div className="bg-sales-800 text-white p-3 flex justify-between items-center">
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
                    <p className="text-xs font-medium">Progresso</p>
                    <p className="text-xs font-medium">{getLoadProgress(load.status)}%</p>
                  </div>
                  <Progress value={getLoadProgress(load.status)} className="h-2" />
                </div>
                
                <div className="pt-3">
                  <Button 
                    className="w-full bg-teal-600 hover:bg-teal-700"
                    onClick={() => handleViewLoad(load)}
                  >
                    <ListChecks size={16} className="mr-2" /> Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {loads.length === 0 && (
          <div className="col-span-2 text-center py-12 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma carga encontrada</h3>
            <p className="text-gray-500">Crie uma nova carga para começar a montar seus pedidos</p>
            <Button className="mt-4 bg-sales-800 hover:bg-sales-700">
              <Plus size={16} className="mr-2" /> Criar Nova Carga
            </Button>
          </div>
        )}
      </div>
      
      {/* View Load Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>{selectedLoad?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Calendar size={16} className="text-gray-500" />
                <p className="text-sm font-medium">Data</p>
              </div>
              <p className="text-sm">{selectedLoad ? formatDateToBR(selectedLoad.date) : ''}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Truck size={16} className="text-gray-500" />
                <p className="text-sm font-medium">Veículo</p>
              </div>
              <p className="text-sm">{selectedLoad?.vehicleName || 'Não atribuído'}</p>
            </div>
            
            <div className="bg-gray-50 p-3 rounded-md">
              <div className="flex items-center gap-2 mb-1">
                <Package size={16} className="text-gray-500" />
                <p className="text-sm font-medium">Status</p>
              </div>
              <p className="text-sm">{selectedLoad?.status}</p>
            </div>
          </div>
          
          <div className="border rounded-md">
            <div className="bg-gray-50 p-3 border-b">
              <h3 className="font-medium">Itens da Carga</h3>
            </div>
            <div className="p-3">
              <Accordion type="multiple" className="w-full">
                {selectedLoad?.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id}>
                    <AccordionTrigger className="hover:bg-gray-50 px-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <FileCheck size={16} className="text-gray-500" />
                          <span>Pedido: {item.orderId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getItemStatusBadge(item.status)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-3 border-t">
                      <div className="py-2">
                        <div className="flex items-center justify-between text-sm mb-2">
                          <div className="flex items-center gap-2">
                            <Weight size={14} className="text-gray-500" />
                            <span>Peso Total: {item.totalWeight || 0} kg</span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package size={14} className="text-gray-500" />
                            <span>Volume: {item.totalVolume || 0} m³</span>
                          </div>
                        </div>
                        <div className="border rounded-md mt-2">
                          <table className="w-full text-sm">
                            <thead className="bg-gray-50 text-xs">
                              <tr>
                                <th className="py-2 px-2 text-left">Produto</th>
                                <th className="py-2 px-2 text-right">Qtd</th>
                                <th className="py-2 px-2 text-right">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.orderItems.map((orderItem) => (
                                <tr key={orderItem.id} className="border-t">
                                  <td className="py-2 px-2">{orderItem.productName}</td>
                                  <td className="py-2 px-2 text-right">{orderItem.quantity}</td>
                                  <td className="py-2 px-2 text-right">
                                    <Badge variant="outline" className="text-xs">Pendente</Badge>
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
              </Accordion>
            </div>
          </div>
          
          <div className="flex justify-end gap-2 mt-4">
            <Button variant="outline">Fechar</Button>
            <Button className="bg-sales-800 hover:bg-sales-700">
              Atualizar Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
