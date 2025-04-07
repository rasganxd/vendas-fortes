import { useState } from 'react';
import PageLayout from '@/components/layout/PageLayout';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { PlusCircle, Edit, Trash2, CreditCard } from 'lucide-react';
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
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
import { Badge } from '@/components/ui/badge';
import { Switch } from '@/components/ui/switch';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { PaymentMethod } from '@/types';

const paymentMethodFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  type: z.enum(['cash', 'credit', 'debit', 'transfer', 'check', 'other']),
  installments: z.boolean().default(false),
  maxInstallments: z.number().min(1).default(1),
  active: z.boolean().default(true),
});

export default function PaymentMethods() {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { id: '1', name: 'Dinheiro', type: 'cash', installments: false, maxInstallments: 1, active: true },
    { id: '2', name: 'Cartão de Crédito', type: 'credit', installments: true, maxInstallments: 12, active: true },
    { id: '3', name: 'Cartão de Débito', type: 'debit', installments: false, maxInstallments: 1, active: true },
    { id: '4', name: 'Transferência Bancária', type: 'transfer', installments: false, maxInstallments: 1, active: true },
    { id: '5', name: 'Boleto Bancário', type: 'other', installments: false, maxInstallments: 1, active: true },
  ]);
  
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod | null>(null);
  const [deletingMethodId, setDeletingMethodId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof paymentMethodFormSchema>>({
    resolver: zodResolver(paymentMethodFormSchema),
    defaultValues: {
      name: "",
      type: "cash",
      installments: false,
      maxInstallments: 1,
      active: true
    },
  });

  const openAddDialog = () => {
    form.reset({
      name: "",
      type: "cash",
      installments: false,
      maxInstallments: 1,
      active: true
    });
    setEditingMethod(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (method: PaymentMethod) => {
    form.reset({
      name: method.name,
      type: method.type,
      installments: method.installments,
      maxInstallments: method.maxInstallments,
      active: method.active
    });
    setEditingMethod(method);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingMethodId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingMethodId) {
      setPaymentMethods(prev => prev.filter(method => method.id !== deletingMethodId));
      setIsDeleteDialogOpen(false);
      setDeletingMethodId(null);
    }
  };

  const onSubmit = (data: z.infer<typeof paymentMethodFormSchema>) => {
    if (editingMethod) {
      setPaymentMethods(prev => 
        prev.map(method => method.id === editingMethod.id ? { ...method, ...data } : method)
      );
    } else {
      const newMethod: PaymentMethod = {
        ...data,
        id: Math.random().toString(36).substring(2, 10)
      };
      setPaymentMethods(prev => [...prev, newMethod]);
    }
    setIsDialogOpen(false);
  };

  const getTypeBadge = (type: string) => {
    switch(type) {
      case "cash":
        return <Badge className="bg-green-600">Dinheiro</Badge>;
      case "credit":
        return <Badge className="bg-blue-600">Crédito</Badge>;
      case "debit":
        return <Badge className="bg-purple-600">Débito</Badge>;
      case "transfer":
        return <Badge className="bg-indigo-600">Transferência</Badge>;
      case "check":
        return <Badge className="bg-amber-600">Cheque</Badge>;
      case "other":
        return <Badge className="bg-gray-500">Outro</Badge>;
      default:
        return <Badge>{type}</Badge>;
    }
  };

  return (
    <PageLayout title="Formas de Pagamento">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Formas de Pagamento</CardTitle>
              <CardDescription>Cadastre e gerencie as formas de pagamento disponíveis</CardDescription>
            </div>
            <Button onClick={openAddDialog} className="bg-sales-800 hover:bg-sales-700">
              <PlusCircle size={16} className="mr-2" /> Nova Forma de Pagamento
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Parcelamento</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {paymentMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>{getTypeBadge(method.type)}</TableCell>
                    <TableCell>
                      {method.installments 
                        ? `Até ${method.maxInstallments}x` 
                        : "Não disponível"}
                    </TableCell>
                    <TableCell>
                      {method.active ? (
                        <Badge className="bg-green-600">Ativo</Badge>
                      ) : (
                        <Badge variant="outline">Inativo</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(method)}>
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openDeleteDialog(method.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {paymentMethods.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={5} className="text-center py-8">
                      <CreditCard size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">Nenhuma forma de pagamento cadastrada</p>
                      <Button 
                        onClick={openAddDialog} 
                        variant="outline" 
                        className="mt-2"
                      >
                        Cadastrar Forma de Pagamento
                      </Button>
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Add/Edit Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>
              {editingMethod ? 'Editar Forma de Pagamento' : 'Nova Forma de Pagamento'}
            </DialogTitle>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome da forma de pagamento" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Tipo</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-wrap gap-4"
                      >
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="cash" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Dinheiro
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="credit" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Crédito
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="debit" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Débito
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="transfer" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Transferência
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="check" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Cheque
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-2 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="other" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Outro
                          </FormLabel>
                        </FormItem>
                      </RadioGroup>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="installments"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Permite Parcelamento</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              {form.watch('installments') && (
                <FormField
                  control={form.control}
                  name="maxInstallments"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Máximo de Parcelas</FormLabel>
                      <FormControl>
                        <Input 
                          type="number" 
                          min="1" 
                          max="24"
                          {...field}
                          onChange={e => field.onChange(parseInt(e.target.value))}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              )}
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Status Ativo</FormLabel>
                    </div>
                    <FormControl>
                      <Switch
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
              
              <div className="flex justify-end pt-4 space-x-2">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)}
                >
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sales-800 hover:bg-sales-700">
                  {editingMethod ? 'Atualizar' : 'Cadastrar'}
                </Button>
              </div>
            </form>
          </Form>
        </DialogContent>
      </Dialog>
      
      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Esta ação não pode ser desfeita. Esta forma de pagamento será removida permanentemente do sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={handleDeleteConfirm}
              className="bg-red-600 hover:bg-red-700"
            >
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
