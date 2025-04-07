
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { formatDateToBR } from '@/lib/date-utils';
import { Package, Truck, Calendar, ListChecks, Plus, FileCheck, Weight } from 'lucide-react';
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
  DialogFooter,
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
  const navigate = useNavigate();
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
          className="bg-sales-800 hover:bg-sales-700"
          onClick={() => navigate('/cargas/montar')}
        >
          <Plus size={16} className="mr-2" /> Montar Carga
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
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
                    <p className="text-sm font-medium">Itens</p>
                    <p className="text-sm text-gray-600">{load.items.length} itens</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-1 text-xs">
                    <span>Progresso</span>
                    <span>{getLoadProgress(load.status)}%</span>
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
          <div className="col-span-3 text-center py-12 bg-white rounded-lg shadow">
            <Package size={48} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhuma carga encontrada</h3>
            <p className="text-gray-500">Crie uma nova carga para começar</p>
            <Button 
              className="mt-4 bg-sales-800 hover:bg-sales-700"
              onClick={() => navigate('/cargas/montar')}
            >
              <Plus size={16} className="mr-2" /> Montar Carga
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
              <p>{selectedLoad ? getStatusBadge(selectedLoad.status) : ''}</p>
            </div>
          </div>
          
          <div className="border rounded-md mb-3">
            <div className="bg-gray-50 p-2 border-b">
              <h3 className="font-medium text-sm">Itens da Carga</h3>
            </div>
            <div className="p-3">
              <Accordion type="multiple" className="w-full text-sm">
                {selectedLoad?.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border-b last:border-0">
                    <AccordionTrigger className="py-2 px-2 hover:no-underline hover:bg-gray-50">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-2">
                          <FileCheck size={14} className="text-gray-500" />
                          <span>Pedido: {item.orderId}</span>
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
                            {item.orderItems.map((orderItem) => (
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
                ))}
              </Accordion>
            </div>
          </div>
          
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)}>Fechar</Button>
            <Button className="bg-sales-800 hover:bg-sales-700">
              Atualizar Status
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
