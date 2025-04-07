
import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { Product, Customer, SalesRep, OrderItem } from '@/types';
import { AlertCircle, ShoppingCart, Trash2, Plus, Save } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { formatDateToBR } from '@/lib/date-utils';

const orderFormSchema = z.object({
  customerId: z.string({
    required_error: "Selecione um cliente",
  }),
  salesRepId: z.string({
    required_error: "Selecione um vendedor",
  }),
  notes: z.string().optional(),
});

export default function NewOrder() {
  const navigate = useNavigate();
  const { customers, products, salesReps, addOrder } = useAppContext();
  const [selectedProduct, setSelectedProduct] = useState<string>('');
  const [quantity, setQuantity] = useState<number>(1);
  const [orderItems, setOrderItems] = useState<OrderItem[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof orderFormSchema>>({
    resolver: zodResolver(orderFormSchema),
    defaultValues: {
      notes: '',
    },
  });
  
  const addProductToOrder = () => {
    if (!selectedProduct || quantity <= 0) {
      setErrorMessage('Selecione um produto e informe a quantidade');
      return;
    }
    
    const product = products.find(p => p.id === selectedProduct);
    if (!product) return;
    
    // Check if product already exists in order
    const existingItemIndex = orderItems.findIndex(item => item.productId === product.id);
    
    if (existingItemIndex >= 0) {
      // Update existing item
      const updatedItems = [...orderItems];
      const newQuantity = updatedItems[existingItemIndex].quantity + quantity;
      updatedItems[existingItemIndex] = {
        ...updatedItems[existingItemIndex],
        quantity: newQuantity,
        total: product.price * newQuantity
      };
      setOrderItems(updatedItems);
    } else {
      // Add new item
      const newItem: OrderItem = {
        id: Math.random().toString(36).substring(2, 10),
        productId: product.id,
        productName: product.name,
        quantity,
        unitPrice: product.price,
        total: product.price * quantity
      };
      setOrderItems([...orderItems, newItem]);
    }
    
    // Reset form
    setSelectedProduct('');
    setQuantity(1);
    setErrorMessage(null);
  };
  
  const removeProduct = (itemId: string) => {
    setOrderItems(orderItems.filter(item => item.id !== itemId));
  };
  
  // Calculate order total
  const orderTotal = orderItems.reduce((sum, item) => sum + item.total, 0);
  
  const onSubmit = (values: z.infer<typeof orderFormSchema>) => {
    if (orderItems.length === 0) {
      setErrorMessage("Adicione pelo menos um produto ao pedido");
      return;
    }
    
    const customer = customers.find(c => c.id === values.customerId);
    const salesRep = salesReps.find(s => s.id === values.salesRepId);
    
    if (!customer || !salesRep) {
      setErrorMessage("Cliente ou vendedor não encontrado");
      return;
    }
    
    const newOrder = {
      customerId: values.customerId,
      customerName: customer.name,
      salesRepId: values.salesRepId,
      salesRepName: salesRep.name,
      items: orderItems,
      total: orderTotal,
      status: 'draft' as const,
      paymentStatus: 'pending' as const,
      notes: values.notes || undefined
    };
    
    addOrder(newOrder);
    navigate('/pedidos');
  };
  
  return (
    <PageLayout title="Novo Pedido">
      <div className="mb-6">
        <div className="text-sm text-gray-500">
          {formatDateToBR(new Date())}
        </div>
      </div>
      
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Customer and Sales Rep Selection */}
            <Card className="md:col-span-1">
              <CardHeader>
                <CardTitle className="text-lg">Informações Gerais</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={form.control}
                  name="customerId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Cliente</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um cliente" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {customers.map((customer) => (
                            <SelectItem key={customer.id} value={customer.id}>
                              {customer.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="salesRepId"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Vendedor</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um vendedor" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          {salesReps.filter(rep => rep.role === 'sales').map((salesRep) => (
                            <SelectItem key={salesRep.id} value={salesRep.id}>
                              {salesRep.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
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
                          placeholder="Observações para este pedido"
                          className="resize-none"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </CardContent>
            </Card>
            
            {/* Product Selection and Order Items */}
            <Card className="md:col-span-2">
              <CardHeader>
                <CardTitle className="text-lg">Itens do Pedido</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex gap-2 items-end">
                  <div className="flex-1">
                    <FormLabel>Produto</FormLabel>
                    <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} - {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="w-24">
                    <FormLabel>Quantidade</FormLabel>
                    <Input
                      type="number"
                      min="1"
                      value={quantity}
                      onChange={(e) => setQuantity(parseInt(e.target.value) || 0)}
                    />
                  </div>
                  <Button 
                    type="button" 
                    onClick={addProductToOrder}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    <Plus size={16} className="mr-1" /> Adicionar
                  </Button>
                </div>
                
                {errorMessage && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{errorMessage}</AlertDescription>
                  </Alert>
                )}
                
                <div className="border rounded-md overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Produto</TableHead>
                        <TableHead className="text-right">Preço Unit.</TableHead>
                        <TableHead className="text-center">Quantidade</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                        <TableHead className="w-[50px]"></TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {orderItems.map((item) => (
                        <TableRow key={item.id}>
                          <TableCell>{item.productName}</TableCell>
                          <TableCell className="text-right">
                            {item.unitPrice.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                          <TableCell className="text-center">{item.quantity}</TableCell>
                          <TableCell className="text-right font-medium">
                            {item.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                          <TableCell>
                            <Button 
                              variant="ghost" 
                              size="sm"
                              onClick={() => removeProduct(item.id)}
                              className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 size={16} />
                            </Button>
                          </TableCell>
                        </TableRow>
                      ))}
                      
                      {orderItems.length === 0 && (
                        <TableRow>
                          <TableCell colSpan={5} className="h-24 text-center">
                            <div className="flex flex-col items-center justify-center text-gray-500">
                              <ShoppingCart size={24} className="mb-2" />
                              <p>Nenhum produto adicionado ao pedido</p>
                            </div>
                          </TableCell>
                        </TableRow>
                      )}
                      
                      {orderItems.length > 0 && (
                        <TableRow>
                          <TableCell colSpan={3} className="text-right font-medium">
                            Total do Pedido:
                          </TableCell>
                          <TableCell className="text-right font-bold">
                            {orderTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </TableCell>
                          <TableCell></TableCell>
                        </TableRow>
                      )}
                    </TableBody>
                  </Table>
                </div>
              </CardContent>
              <CardFooter className="flex justify-between border-t p-4">
                <Button variant="outline" type="button" onClick={() => navigate('/pedidos')}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sales-800 hover:bg-sales-700">
                  <Save size={16} className="mr-2" /> Salvar Pedido
                </Button>
              </CardFooter>
            </Card>
          </div>
        </form>
      </Form>
    </PageLayout>
  );
}
