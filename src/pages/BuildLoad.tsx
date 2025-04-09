import React, { useState, useEffect } from 'react';
import { v4 as uuid } from 'uuid';
import { useAppContext } from '@/hooks/useAppContext';
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
import { Plus, Search } from 'lucide-react';
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
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { cn } from "@/lib/utils"
import { format } from "date-fns"
import { CalendarIcon } from "lucide-react"

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
  vehicleName: z.string().min(2, {
    message: "Nome do veículo deve ter pelo menos 2 caracteres.",
  }),
  date: z.date(),
  notes: z.string().optional(),
  includePending: z.boolean().default(false).optional(),
})

export default function BuildLoad() {
  const { orders } = useAppContext();
  const [search, setSearch] = useState('');
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [selectedOrders, setSelectedOrders] = useState<Order[]>([]);
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false);
  const [buildLoadItems, setBuildLoadItems] = useState<BuildLoadItem[]>([]);

  const filteredOrders = orders.filter(order =>
    order.customerName.toLowerCase().includes(search.toLowerCase()) ||
    order.id.toLowerCase().includes(search.toLowerCase())
  );

  // Função para transformar OrderItems em LoadItems
  const mapOrderItemsToLoadItems = (orderItems: OrderItem[], orderId: string): BuildLoadItem[] => {
    return orderItems.map((item) => ({
      id: uuid(),
      orderId: orderId,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      status: 'pending'
    }));
  };

  const handleOrderSelect = (order: Order) => {
    setSelectedOrder(order);
  };

  const handleAddToLoad = () => {
    if (!selectedOrder) return;

    const newLoadItems: BuildLoadItem[] = selectedOrder.items.flatMap(item => ({
      id: uuid(),
      orderId: selectedOrder.id,
      productId: item.productId,
      productName: item.productName,
      quantity: item.quantity,
      status: 'pending'
    }));

    setBuildLoadItems(prevItems => [...prevItems, ...newLoadItems]);
    setSelectedOrders(prevOrders => [...prevOrders, selectedOrder]);
  };

  const handleRemoveFromLoad = (orderId: string) => {
    setBuildLoadItems(prevItems => prevItems.filter(item => item.orderId !== orderId));
    setSelectedOrders(prevOrders => prevOrders.filter(order => order.id !== orderId));
  };

  const form = useForm<z.infer<typeof loadFormSchema>>({
    resolver: zodResolver(loadFormSchema),
    defaultValues: {
      name: "",
      vehicleName: "",
      date: new Date(),
      notes: "",
      includePending: false,
    },
  })

  const handleCreateLoad = async (values: z.infer<typeof loadFormSchema>) => {
    // Aqui você pode processar os dados do formulário e os itens de carga
    console.log("Dados do formulário:", values);
    console.log("Itens de carga:", buildLoadItems);

    const loadItems: LoadItem[] = selectedOrders.flatMap(order => 
      order.items.map(item => ({
        productId: item.productId,
        productName: item.productName,
        quantity: item.quantity,
        orderId: order.id
      }))
    );

    const newLoad = {
      name: values.name,
      vehicleName: values.vehicleName,
      vehicleId: values.vehicleName || 'default-vehicle-id', // Usando vehicleName como ID temporário se disponível
      date: values.date,
      items: loadItems,
      status: 'planning' as const,
      notes: values.notes && values.notes.trim() !== '' ? values.notes : null,
      salesRepId: 'default-sales-rep-id',
      orderIds: selectedOrderIds,
    };
    
    console.log("New Load", newLoad)

    // Aqui você pode adicionar a lógica para salvar a carga no banco de dados ou realizar outras ações necessárias
    setIsCreateDialogOpen(false);
  };

  const selectedOrderIds = selectedOrders.map(order => order.id);

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
                  <TableHead>Pedido</TableHead>
                  <TableHead>Cliente</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredOrders.map((order) => (
                  <TableRow key={order.id}>
                    <TableCell className="font-medium">{order.id}</TableCell>
                    <TableCell>{order.customerName}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => handleOrderSelect(order)}
                        >
                          Selecionar
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
          {selectedOrder && (
            <div className="mt-4">
              <h3 className="text-lg font-semibold">Pedido Selecionado: {selectedOrder.id}</h3>
              <p>Cliente: {selectedOrder.customerName}</p>
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Produto</TableHead>
                    <TableHead>Quantidade</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedOrder.items.map((item) => (
                    <TableRow key={item.productId}>
                      <TableCell>{item.productName}</TableCell>
                      <TableCell>{item.quantity}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
              <Button className="mt-2 bg-sales-800 hover:bg-sales-700" onClick={handleAddToLoad}>Adicionar à Carga</Button>
            </div>
          )}
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
                      name="vehicleName"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Nome do Veículo</FormLabel>
                          <FormControl>
                            <Input placeholder="Nome do Veículo" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="date"
                      render={({ field }) => (
                        <FormItem className="flex flex-col">
                          <FormLabel>Data</FormLabel>
                          <Popover>
                            <PopoverTrigger asChild>
                              <FormControl>
                                <Button
                                  variant={"outline"}
                                  className={cn(
                                    "pl-3 text-left font-normal",
                                    !field.value && "text-muted-foreground"
                                  )}
                                >
                                  {field.value ? (
                                    format(field.value, "PPP")
                                  ) : (
                                    <span>Pick a date</span>
                                  )}
                                  <CalendarIcon className="ml-auto h-4 w-4 opacity-50" />
                                </Button>
                              </FormControl>
                            </PopoverTrigger>
                            <PopoverContent className="w-auto p-0" align="start">
                              <Calendar
                                mode="single"
                                selected={field.value}
                                onSelect={field.onChange}
                                disabled={(date) =>
                                  date > new Date()
                                }
                                initialFocus
                              />
                            </PopoverContent>
                          </Popover>
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
                  <TableCell className="font-medium">{item.orderId}</TableCell>
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
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
