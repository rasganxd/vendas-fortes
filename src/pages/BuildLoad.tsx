
import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppContext } from '@/hooks/useAppContext';
import { useLoads } from '@/hooks/useLoads';
import { useNavigate } from 'react-router-dom';
import PageLayout from '@/components/layout/PageLayout';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Plus, Search, Check, CheckSquare, Lock } from 'lucide-react';
import { Order, OrderItem, LoadItem } from '@/types';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Switch } from "@/components/ui/switch"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { zodResolver } from "@hookform/resolvers/zod"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { toast } from "@/components/ui/use-toast"

interface BuildLoadItem {
  id: string;
  orderId: string;
  productId: string;
  productName: string;
  quantity: number;
  status: 'pending' | 'loaded' | 'delivered';
}

const loadFormSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  notes: z.string().optional(),
  includePending: z.boolean().default(false).optional(),
})

export default function BuildLoad() {
  const { orders } = useAppContext();
  const { addLoad, getLockedOrderIds } = useLoads();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [selectedOrderIds, setSelectedOrderIds] = useState<string[]>([]);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [buildLoadItems, setBuildLoadItems] = useState<BuildLoadItem[]>([]);
  const [selectAll, setSelectAll] = useState(false);
  const [lockedOrderIds, setLockedOrderIds] = useState<string[]>([]);

  useEffect(() => {
    setLockedOrderIds(getLockedOrderIds());
  }, [getLockedOrderIds]);

  // Get the orders that are locked/blocked
  const blockedOrders = orders.filter(order => 
    lockedOrderIds.includes(order.id)
  );

  const filteredOrders = orders.filter(order =>
    (order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())) &&
    !selectedOrderIds.includes(order.id) &&
    !lockedOrderIds.includes(order.id)
  );

  const handleOrderSelect = (order: Order, isChecked: boolean) => {
    if (isChecked) {
      if (!selectedOrderIds.includes(order.id)) {
        setSelectedOrderIds(prev => [...prev, order.id]);
      }
    } else {
      setSelectedOrderIds(prev => prev.filter(id => id !== order.id));
    }
  };

  const handleSelectAll = (checked: boolean) => {
    setSelectAll(checked);
    if (checked) {
      const newSelectedIds = [
        ...selectedOrderIds,
        ...filteredOrders.map(order => order.id).filter(id => !selectedOrderIds.includes(id))
      ];
      setSelectedOrderIds(newSelectedIds);
    } else {
      const filteredIds = filteredOrders.map(order => order.id);
      setSelectedOrderIds(prev => prev.filter(id => !filteredIds.includes(id)));
    }
  };

  useEffect(() => {
    setSelectAll(false);
  }, [search]);

  const handleAddSelectedOrders = () => {
    if (selectedOrderIds.length === 0) {
      toast({
        title: "Nenhum pedido selecionado",
        description: "Selecione pelo menos um pedido para adicionar à carga.",
        variant: "destructive"
      });
      return;
    }

    const ordersToAdd = orders.filter(order => selectedOrderIds.includes(order.id));
    
    const newLoadItems: BuildLoadItem[] = [];
    ordersToAdd.forEach(order => {
      order.items.forEach(item => {
        newLoadItems.push({
          id: uuid(),
          orderId: order.id,
          productId: item.productId,
          productName: item.productName,
          quantity: item.quantity,
          status: 'pending'
        });
      });
    });

    setBuildLoadItems(prevItems => [...prevItems, ...newLoadItems]);
    setSelectedOrders(prevOrders => [...prevOrders, ...ordersToAdd]);
    setSelectedOrderIds([]);
    setSelectAll(false);
  };

  const handleRemoveFromLoad = (orderId: string) => {
    setBuildLoadItems(prevItems => prevItems.filter(item => item.orderId !== orderId));
    setSelectedOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const form = useForm<z.infer<typeof loadFormSchema>>({
    resolver: zodResolver(loadFormSchema),
    defaultValues: {
      name: "",
      notes: "",
      includePending: false,
    },
  })

  const handleCreateLoad = async (values: z.infer<typeof loadFormSchema>) => {
    try {
      const uniqueOrderIds = Array.from(new Set(selectedOrders.map(order => order.id)));
      
      const loadItems: LoadItem[] = [];
      
      uniqueOrderIds.forEach(orderId => {
        const order = selectedOrders.find(o => o.id === orderId);
        if (order) {
          order.items.forEach(item => {
            loadItems.push({
              productId: item.productId,
              productName: item.productName,
              quantity: item.quantity,
              orderId: order.id,
              orderItems: [item]
            });
          });
        }
      });

      const newLoad = {
        name: values.name,
        vehicleId: '',
        date: new Date(),
        items: loadItems,
        status: 'planning' as const,
        notes: values.notes && values.notes.trim() !== '' ? values.notes : null,
        salesRepId: 'default-sales-rep-id',
        orderIds: uniqueOrderIds,
        locked: false,
      };
      
      const loadId = await addLoad(newLoad);
      
      if (loadId) {
        toast({
          title: "Carga criada com sucesso",
          description: "A carga foi salva no sistema."
        });
        
        navigate('/cargas');
      }
    } catch (error) {
      console.error("Erro ao criar carga:", error);
      toast({
        title: "Erro ao criar carga",
        description: "Houve um problema ao salvar a carga.",
        variant: "destructive"
      });
    }
    
    setIsCreateDialogOpen(false);
  };

  return (
    <PageLayout title="Montar Carga">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Selecionar Pedidos</CardTitle>
              <CardDescription>
                Adicione pedidos à carga
              </CardDescription>
            </div>
            <Button 
              className="bg-sales-800 hover:bg-sales-700" 
              onClick={handleAddSelectedOrders}
              disabled={selectedOrderIds.length === 0}
            >
              <Plus size={16} className="mr-2" /> Adicionar Selecionados
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar pedidos..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-10">
                    <div className="flex items-center">
                      <Checkbox 
                        checked={selectAll && filteredOrders.length > 0} 
                        onCheckedChange={handleSelectAll}
                        disabled={filteredOrders.length === 0}
                      />
                      <span className="ml-2">Todos</span>
                    </div>
                  </TableHead>
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead>Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell>
                      <Checkbox 
                        checked={selectedOrderIds.includes(order.id)}
                        onCheckedChange={(checked) => handleOrderSelect(order, !!checked)}
                      />
                    </TableCell>
                    <TableCell className="font-medium">{order.id.substring(0, 8)}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell>Disponível</TableCell>
                  </TableRow>
                ))}
                {blockedOrders.map((order) => (
                  <TableRow key={order.id} className="bg-gray-50">
                    <TableCell>
                      <div className="text-amber-600">
                        <Lock size={16} />
                      </div>
                    </TableCell>
                    <TableCell className="font-medium text-gray-500">{order.id.substring(0, 8)}</TableCell>
                    <TableCell className="text-gray-500">{order.customerName}</TableCell>
                    <TableCell>
                      <span className="text-amber-600 flex items-center gap-1">
                        <Lock size={14} /> Bloqueado
                      </span>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredOrders.length === 0 && blockedOrders.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={4} className="text-center py-4">
                      Não há pedidos disponíveis para seleção
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Itens na Carga</CardTitle>
              <CardDescription>
                Lista de itens adicionados à carga
              </CardDescription>
            </div>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sales-800 hover:bg-sales-700" disabled={buildLoadItems.length === 0}>
                  <Plus size={16} className="mr-2" /> Criar Carga
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Criar Carga</DialogTitle>
                  <DialogDescription>
                    Preencha os detalhes da carga.
                  </DialogDescription>
                </DialogHeader>
                <Form {...form}>
                  <form onSubmit={form.handleSubmit(handleCreateLoad)} className="space-y-8">
                    <FormField
                      control={form.control}
                      name="name"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome da Carga</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome da Carga" {...field} />
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
                              placeholder="Observações sobre a carga"
                              className="resize-none"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <Button type="submit" className="bg-sales-800 hover:bg-sales-700">Criar Carga</Button>
                  </form>
                </Form>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Pedido</TableHead>
                <TableHead>Produto</TableHead>
                <TableHead>Quantidade</TableHead>
                <TableHead className="text-right">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {buildLoadItems.map((item) => (
                <TableRow key={item.id}>
                  <TableCell className="font-medium">{item.orderId.substring(0, 8)}</TableCell>
                  <TableCell>{item.productName}</TableCell>
                  <TableCell>{item.quantity}</TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveFromLoad(item.orderId)}
                      >
                        Remover
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {buildLoadItems.length === 0 && (
                <TableRow>
                  <TableCell colSpan={4} className="text-center py-4">
                    Nenhum item adicionado à carga
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
