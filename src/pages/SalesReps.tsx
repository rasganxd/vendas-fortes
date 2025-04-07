
import { useState } from 'react';
import { useAppContext } from '@/context/AppContext';
import PageLayout from '@/components/layout/PageLayout';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { SalesRep } from '@/types';
import { PlusCircle, UserCog, Edit, Trash2, CheckCircle, XCircle } from 'lucide-react';
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
  FormDescription,
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

const salesRepFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  email: z.string().email({ message: "Email inválido" }),
  phone: z.string().min(10, { message: "Telefone deve ter pelo menos 10 dígitos" }),
  role: z.enum(["admin", "manager", "sales", "driver"]),
  region: z.string().optional(),
  active: z.boolean().default(true),
});

export default function SalesReps() {
  const { salesReps, addSalesRep, updateSalesRep, deleteSalesRep } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSalesRep, setEditingSalesRep] = useState<SalesRep | null>(null);
  const [deletingSalesRepId, setDeletingSalesRepId] = useState<string | null>(null);
  
  const form = useForm<z.infer<typeof salesRepFormSchema>>({
    resolver: zodResolver(salesRepFormSchema),
    defaultValues: {
      name: "",
      email: "",
      phone: "",
      role: "sales",
      region: "",
      active: true
    },
  });

  const openAddDialog = () => {
    form.reset({
      name: "",
      email: "",
      phone: "",
      role: "sales",
      region: "",
      active: true
    });
    setEditingSalesRep(null);
    setIsDialogOpen(true);
  };

  const openEditDialog = (salesRep: SalesRep) => {
    form.reset({
      name: salesRep.name,
      email: salesRep.email,
      phone: salesRep.phone,
      role: salesRep.role,
      region: salesRep.region || "",
      active: salesRep.active
    });
    setEditingSalesRep(salesRep);
    setIsDialogOpen(true);
  };

  const openDeleteDialog = (id: string) => {
    setDeletingSalesRepId(id);
    setIsDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = () => {
    if (deletingSalesRepId) {
      deleteSalesRep(deletingSalesRepId);
      setIsDeleteDialogOpen(false);
      setDeletingSalesRepId(null);
    }
  };

  const onSubmit = (data: z.infer<typeof salesRepFormSchema>) => {
    if (editingSalesRep) {
      updateSalesRep(editingSalesRep.id, {
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        region: data.region,
        active: data.active
      });
    } else {
      // Fixed: Pass all required properties to addSalesRep
      addSalesRep({
        name: data.name,
        email: data.email,
        phone: data.phone,
        role: data.role,
        region: data.region,
        active: data.active
      });
    }
    setIsDialogOpen(false);
  };

  const getRoleBadge = (role: string) => {
    switch(role) {
      case "admin":
        return <Badge className="bg-purple-600">Administrador</Badge>;
      case "manager":
        return <Badge className="bg-blue-600">Gerente</Badge>;
      case "sales":
        return <Badge className="bg-green-600">Vendedor</Badge>;
      case "driver":
        return <Badge className="bg-amber-600">Motorista</Badge>;
      default:
        return <Badge>{role}</Badge>;
    }
  };

  return (
    <PageLayout title="Vendedores">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Gerencimento de Vendedores</CardTitle>
              <CardDescription>Cadastre e gerencie os vendedores da equipe</CardDescription>
            </div>
            <Button onClick={openAddDialog} className="bg-sales-800 hover:bg-sales-700">
              <PlusCircle size={16} className="mr-2" /> Novo Vendedor
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="relative overflow-x-auto rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {salesReps.map((salesRep) => (
                  <TableRow key={salesRep.id}>
                    <TableCell className="font-medium">{salesRep.name}</TableCell>
                    <TableCell>{salesRep.email}</TableCell>
                    <TableCell>{salesRep.phone}</TableCell>
                    <TableCell>{getRoleBadge(salesRep.role)}</TableCell>
                    <TableCell>{salesRep.region || '—'}</TableCell>
                    <TableCell>
                      {salesRep.active ? (
                        <div className="flex items-center text-green-600">
                          <CheckCircle size={16} className="mr-1" /> Ativo
                        </div>
                      ) : (
                        <div className="flex items-center text-gray-500">
                          <XCircle size={16} className="mr-1" /> Inativo
                        </div>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="sm" onClick={() => openEditDialog(salesRep)}>
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="sm" 
                          onClick={() => openDeleteDialog(salesRep.id)}
                          className="text-red-500 hover:text-red-700"
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
                {salesReps.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-8">
                      <UserCog size={40} className="mx-auto text-gray-300 mb-2" />
                      <p className="text-gray-500">Nenhum vendedor cadastrado</p>
                      <Button 
                        onClick={openAddDialog} 
                        variant="outline" 
                        className="mt-2"
                      >
                        Cadastrar Vendedor
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
              {editingSalesRep ? 'Editar Vendedor' : 'Novo Vendedor'}
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
                      <Input placeholder="Nome completo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="email"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Email</FormLabel>
                    <FormControl>
                      <Input type="email" placeholder="email@exemplo.com" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="phone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Telefone</FormLabel>
                    <FormControl>
                      <Input placeholder="(XX) XXXXX-XXXX" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="role"
                render={({ field }) => (
                  <FormItem className="space-y-3">
                    <FormLabel>Função</FormLabel>
                    <FormControl>
                      <RadioGroup
                        onValueChange={field.onChange}
                        defaultValue={field.value}
                        className="flex flex-col space-y-1"
                      >
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="admin" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Administrador
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="manager" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Gerente
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="sales" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Vendedor
                          </FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-3 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="driver" />
                          </FormControl>
                          <FormLabel className="font-normal">
                            Motorista
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
                name="region"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Região</FormLabel>
                    <FormControl>
                      <Input placeholder="Região de atuação (opcional)" {...field} />
                    </FormControl>
                    <FormDescription>
                      Área geográfica onde o vendedor atua
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3">
                    <div className="space-y-0.5">
                      <FormLabel>Status Ativo</FormLabel>
                      <FormDescription>
                        Determina se o vendedor está ativo no sistema
                      </FormDescription>
                    </div>
                    <FormControl>
                      <RadioGroup
                        onValueChange={(value) => field.onChange(value === "true")}
                        defaultValue={field.value ? "true" : "false"}
                        className="flex space-x-4"
                      >
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="true" />
                          </FormControl>
                          <FormLabel className="font-normal">Sim</FormLabel>
                        </FormItem>
                        <FormItem className="flex items-center space-x-1 space-y-0">
                          <FormControl>
                            <RadioGroupItem value="false" />
                          </FormControl>
                          <FormLabel className="font-normal">Não</FormLabel>
                        </FormItem>
                      </RadioGroup>
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
                  {editingSalesRep ? 'Atualizar' : 'Cadastrar'}
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
              Esta ação não pode ser desfeita. O vendedor será removido permanentemente do sistema.
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
