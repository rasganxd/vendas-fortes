
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
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
        return <Badge variant="outline" className="text-lg font-medium px-3 py-1.5">Planejamento</Badge>;
      case 'loading':
        return <Badge className="bg-blue-500 text-lg font-medium px-3 py-1.5">Carregando</Badge>;
      case 'loaded':
        return <Badge className="bg-amber-500 text-lg font-medium px-3 py-1.5">Carregado</Badge>;
      case 'in-transit':
        return <Badge className="bg-purple-500 text-lg font-medium px-3 py-1.5">Em Trânsito</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 text-lg font-medium px-3 py-1.5">Entregue</Badge>;
      default:
        return <Badge className="text-lg font-medium px-3 py-1.5">{status}</Badge>;
    }
  };

  const getItemStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="text-base">Pendente</Badge>;
      case 'loaded':
        return <Badge className="bg-amber-500 text-base">Carregado</Badge>;
      case 'delivered':
        return <Badge className="bg-green-500 text-base">Entregue</Badge>;
      default:
        return <Badge className="text-base">{status}</Badge>;
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
      <div className="mb-8 flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-semibold text-gray-800">Cargas</h2>
          <p className="text-gray-600 text-xl">Gerencie a separação e carregamento de pedidos</p>
        </div>
        <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xl px-8 py-6 h-auto" onClick={() => navigate('/cargas/montar')}>
          <Plus size={24} className="mr-2" /> Montar Carga
        </Button>
      </div>
      
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {loads.map((load) => (
          <Card key={load.id} className="overflow-hidden hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border-2 border-gray-100">
            <div className="bg-gradient-to-r from-blue-600 to-purple-600 text-white p-5 flex justify-between items-center">
              <h3 className="font-bold text-2xl">{load.name}</h3>
              {getStatusBadge(load.status)}
            </div>
            <CardContent className="p-6">
              <div className="space-y-5">
                <div className="flex items-start gap-4">
                  <Calendar size={26} className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Data</p>
                    <p className="text-xl text-gray-800">{formatDateToBR(load.date)}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Truck size={26} className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Veículo</p>
                    <p className="text-xl text-gray-800">{load.vehicleName || 'Não atribuído'}</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <Package size={26} className="text-blue-600 mt-1" />
                  <div>
                    <p className="text-lg font-medium text-gray-700">Pedidos</p>
                    <p className="text-xl text-gray-800">{load.items.length} pedidos</p>
                  </div>
                </div>
                
                <div className="pt-2">
                  <div className="flex items-center justify-between mb-2">
                    <p className="text-base font-medium">Progresso</p>
                    <p className="text-base font-bold">{getLoadProgress(load.status)}%</p>
                  </div>
                  <Progress 
                    value={getLoadProgress(load.status)} 
                    className="h-3 bg-gray-200 [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-purple-500" 
                  />
                </div>
                
                <div className="pt-5">
                  <Button 
                    className="w-full bg-gradient-to-r from-purple-500 to-blue-500 hover:from-purple-600 hover:to-blue-600 text-lg py-6 h-auto font-medium"
                    onClick={() => handleViewLoad(load)}
                  >
                    <ListChecks size={22} className="mr-2" /> Ver Detalhes
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
        
        {loads.length === 0 && (
          <div className="col-span-2 text-center py-16 bg-white rounded-lg shadow">
            <Package size={72} className="mx-auto text-gray-400 mb-5" />
            <h3 className="text-2xl font-medium text-gray-900 mb-2">Nenhuma carga encontrada</h3>
            <p className="text-gray-600 text-xl">Crie uma nova carga para começar a montar seus pedidos</p>
            <Button className="mt-8 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-xl px-8 py-6 h-auto" onClick={() => navigate('/cargas/montar')}>
              <Plus size={24} className="mr-2" /> Montar Nova Carga
            </Button>
          </div>
        )}
      </div>
      
      {/* View Load Dialog */}
      <Dialog open={isViewDialogOpen} onOpenChange={setIsViewDialogOpen}>
        <DialogContent className="sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle className="text-2xl font-bold text-blue-700">{selectedLoad?.name}</DialogTitle>
          </DialogHeader>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5 mb-5">
            <div className="bg-gray-50 p-5 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Calendar size={20} className="text-blue-600" />
                <p className="text-lg font-medium text-gray-700">Data</p>
              </div>
              <p className="text-xl">{selectedLoad ? formatDateToBR(selectedLoad.date) : ''}</p>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Truck size={20} className="text-blue-600" />
                <p className="text-lg font-medium text-gray-700">Veículo</p>
              </div>
              <p className="text-xl">{selectedLoad?.vehicleName || 'Não atribuído'}</p>
            </div>
            
            <div className="bg-gray-50 p-5 rounded-md shadow-sm">
              <div className="flex items-center gap-2 mb-2">
                <Package size={20} className="text-blue-600" />
                <p className="text-lg font-medium text-gray-700">Status</p>
              </div>
              <p className="text-xl">{selectedLoad && getStatusBadge(selectedLoad.status)}</p>
            </div>
          </div>
          
          <div className="border rounded-md shadow-sm">
            <div className="bg-gradient-to-r from-gray-50 to-blue-50 p-5 border-b">
              <h3 className="font-medium text-xl text-blue-700">Itens da Carga</h3>
            </div>
            <div className="p-5">
              <Accordion type="multiple" className="w-full">
                {selectedLoad?.items.map((item) => (
                  <AccordionItem key={item.id} value={item.id} className="border rounded-md mb-3 shadow-sm">
                    <AccordionTrigger className="hover:bg-gray-50 px-5 py-3">
                      <div className="flex items-center justify-between w-full">
                        <div className="flex items-center gap-3">
                          <FileCheck size={22} className="text-blue-600" />
                          <span className="font-medium text-lg">Pedido: {item.orderId}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          {getItemStatusBadge(item.status)}
                        </div>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="px-5 border-t bg-white">
                      <div className="py-4">
                        <div className="flex items-center justify-between text-lg mb-3">
                          <div className="flex items-center gap-2">
                            <Weight size={18} className="text-blue-600" />
                            <span>Peso Total: <span className="font-medium">{item.totalWeight || 0} kg</span></span>
                          </div>
                          <div className="flex items-center gap-2">
                            <Package size={18} className="text-blue-600" />
                            <span>Volume: <span className="font-medium">{item.totalVolume || 0} m³</span></span>
                          </div>
                        </div>
                        <div className="border rounded-md mt-3">
                          <table className="w-full text-lg">
                            <thead className="bg-gray-50 text-base">
                              <tr>
                                <th className="py-3 px-4 text-left font-medium text-gray-700">Produto</th>
                                <th className="py-3 px-4 text-right font-medium text-gray-700">Qtd</th>
                                <th className="py-3 px-4 text-right font-medium text-gray-700">Status</th>
                              </tr>
                            </thead>
                            <tbody>
                              {item.orderItems.map((orderItem) => (
                                <tr key={orderItem.id} className="border-t">
                                  <td className="py-3 px-4 text-gray-800">{orderItem.productName}</td>
                                  <td className="py-3 px-4 text-right font-medium">{orderItem.quantity}</td>
                                  <td className="py-3 px-4 text-right">
                                    <Badge variant="outline" className="text-base">Pendente</Badge>
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
          
          <div className="flex justify-end gap-3 mt-5">
            <Button variant="outline" onClick={() => setIsViewDialogOpen(false)} className="text-lg px-6 py-6 h-auto">
              Fechar
            </Button>
            <Button className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-lg px-8 py-6 h-auto">
              Atualizar Status
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
