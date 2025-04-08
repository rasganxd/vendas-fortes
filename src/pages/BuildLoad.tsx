
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/hooks/useAppContext';
import { useLoads } from '@/hooks/useLoads';
import { useOrders } from '@/hooks/useOrders';
import PageLayout from '@/components/layout/PageLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
  CardFooter
} from '@/components/ui/card';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Order, LoadItem } from '@/types';
import { Package, Truck, Save, Check, Calendar, Printer } from 'lucide-react';
import { Badge } from '@/components/ui/badge';
import { formatDateToBR } from '@/lib/date-utils';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import LoadPickingList from '@/components/loads/LoadPickingList';

const loadFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  vehicleName: z.string().optional(),
  notes: z.string().optional(),
});

export default function BuildLoad() {
  const navigate = useNavigate();
  const { orders } = useAppContext(); // Obtemos os pedidos do contexto geral
  const { loads, addLoad } = useLoads(); // Obtemos as funções específicas de cargas
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [showPickingList, setShowPickingList] = useState(false);
  
  // Get all confirmed orders that are not delivered or cancelled
  const availableOrders = orders.filter(order => 
    order.status === 'confirmed' && 
    !['delivered', 'cancelled'].includes(order.status)
  );
  
  const form = useForm<z.infer<typeof loadFormSchema>>({
    resolver: zodResolver(loadFormSchema),
    defaultValues: {
      name: `Carga ${new Date().toLocaleDateString('pt-BR')}`,
      vehicleName: '',
      notes: '',
    },
  });
  
  // Função para selecionar todos os pedidos
  const selectAllOrders = () => {
    if (selectedOrderIds.length === availableOrders.length) {
      // Se todos já estão selecionados, desmarca todos
      setSelectedOrderIds([]);
    } else {
      // Senão, seleciona todos
      setSelectedOrderIds(availableOrders.map(order => order.id));
    }
  };
  
  const toggleOrderSelection = (orderId: string) => {
    setSelectedOrderIds(prev => 
      prev.includes(orderId) 
        ? prev.filter(id => id !== orderId) 
        : [...prev, orderId]
    );
  };
  
  const isOrderSelected = (orderId: string) => {
    return selectedOrderIds.includes(orderId);
  };
  
  const onSubmit = (values: z.infer<typeof loadFormSchema>) => {
    if (selectedOrderIds.length === 0) {
      return; // Can't create an empty load
    }
    
    const loadItems: LoadItem[] = selectedOrderIds.map(orderId => {
      const order = orders.find(o => o.id === orderId);
      if (!order) throw new Error(`Order ${orderId} not found`);
      
      return {
        id: Math.random().toString(36).substring(2, 10),
        orderId: order.id,
        orderItems: order.items,
        status: 'pending',
      };
    });
    
    // Ensure that undefined values are not being passed to Firestore
    const newLoad = {
      name: values.name,
      vehicleName: values.vehicleName && values.vehicleName.trim() !== '' ? values.vehicleName : null,
      date: new Date(),
      items: loadItems,
      status: 'planning' as const,
      notes: values.notes && values.notes.trim() !== '' ? values.notes : null,
    };
    
    addLoad(newLoad);
    navigate('/cargas');
  };

  // Prepara dados para romaneio de separação
  const getSelectedOrders = () => {
    return availableOrders.filter(order => selectedOrderIds.includes(order.id));
  };

  return (
    <PageLayout title="Montar Carga">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Load Information */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Informações da Carga</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome da Carga</FormLabel>
                      <FormControl>
                        <Input {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="vehicleName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Veículo</FormLabel>
                      <FormControl>
                        <Input placeholder="Nome/Placa do veículo (opcional)" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="notes"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Observações</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Observações para esta carga"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="pt-4">
                  <div className="flex items-center mb-2">
                    <Package size={16} className="mr-1 text-gray-500" />
                    <span className="text-sm font-medium">Pedidos Selecionados:</span>
                    <Badge className="ml-2 bg-sales-800">{selectedOrderIds.length}</Badge>
                  </div>
                  
                  <div className="space-y-2">
                    <Button 
                      type="submit" 
                      className="w-full bg-sales-800 hover:bg-sales-700"
                      disabled={selectedOrderIds.length === 0}
                    >
                      <Save size={16} className="mr-2" /> Salvar Carga
                    </Button>
                    
                    {selectedOrderIds.length > 0 && (
                      <Button 
                        type="button" 
                        variant="outline"
                        className="w-full"
                        onClick={() => setShowPickingList(true)}
                      >
                        <Printer size={16} className="mr-2" /> Imprimir Romaneio
                      </Button>
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
            
            {/* Order Selection */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Selecionar Pedidos</CardTitle>
                <CardDescription>
                  Selecione os pedidos que farão parte desta carga
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">
                          <Checkbox
                            checked={selectedOrderIds.length === availableOrders.length && availableOrders.length > 0}
                            onCheckedChange={() => selectAllOrders()}
                            aria-label="Selecionar todos os pedidos"
                          />
                        </TableHead>
                        <TableHead>Nº Pedido</TableHead>
                        <TableHead>Cliente</TableHead>
                        <TableHead>Data</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {availableOrders.map((order) => (
                        <TableRow 
                          key={order.id} 
                          className={isOrderSelected(order.id) ? "bg-blue-50" : ""}
                        >
                          <TableCell>
                            <Checkbox
                              checked={isOrderSelected(order.id)}
                              onCheckedChange={() => toggleOrderSelection(order.id)}
                            />
                          </TableCell>
                          <TableCell className="font-medium">{order.id}</TableCell>
                          <TableCell>{order.customerName}</TableCell>
                          <TableCell>{formatDateToBR(order.createdAt)}</TableCell>
                          <TableCell className="text-right">
                            {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {availableOrders.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <Package size={24} className="mb-2" />
                              <p>Nenhum pedido disponível para montar carga</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
                
                {selectedOrderIds.length > 0 && (
                  <div className="mt-4 p-3 bg-gray-50 rounded-md flex items-center justify-between">
                    <div className="flex items-center">
                      <Check size={16} className="mr-2 text-green-500" />
                      <span>{selectedOrderIds.length} pedidos selecionados</span>
                    </div>
                    <Button 
                      variant="outline"
                      size="sm"
                      onClick={() => setSelectedOrderIds([])}
                    >
                      Limpar seleção
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </form>
      </Form>

      {/* Dialog para o Romaneio de Separação */}
      <Dialog open={showPickingList} onOpenChange={setShowPickingList}>
        <DialogContent className="max-w-4xl">
          <DialogHeader>
            <DialogTitle>Romaneio de Separação</DialogTitle>
          </DialogHeader>
          <LoadPickingList orders={getSelectedOrders()} onClose={() => setShowPickingList(false)} />
        </DialogContent>
      </Dialog>
    </PageLayout>
  );
}
