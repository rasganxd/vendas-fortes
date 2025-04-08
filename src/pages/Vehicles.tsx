
import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Truck, Plus, Edit, Trash2 } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader,
  CardTitle
} from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Switch } from "@/components/ui/switch";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Vehicle } from '@/types';

// Form schema
const vehicleFormSchema = z.object({
  name: z.string().min(2, { message: "Nome deve ter pelo menos 2 caracteres" }),
  licensePlate: z.string().min(7, { message: "Placa deve ter pelo menos 7 caracteres" }),
  type: z.enum(["car", "van", "truck", "motorcycle"]),
  capacity: z.number().min(0, { message: "Capacidade deve ser um número positivo" }),
  active: z.boolean().default(true)
});

export default function Vehicles() {
  const { vehicles = [], addVehicle, updateVehicle, deleteVehicle } = useAppContext();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingVehicle, setEditingVehicle] = useState<Vehicle | null>(null);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [vehicleToDelete, setVehicleToDelete] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const form = useForm<z.infer<typeof vehicleFormSchema>>({
    resolver: zodResolver(vehicleFormSchema),
    defaultValues: {
      name: "",
      licensePlate: "",
      type: "car",
      capacity: 0,
      active: true
    }
  });

  const handleEditVehicle = (vehicle: Vehicle) => {
    setEditingVehicle(vehicle);
    form.reset({
      name: vehicle.name,
      licensePlate: vehicle.licensePlate,
      type: vehicle.type,
      capacity: vehicle.capacity,
      active: vehicle.active
    });
    setIsDialogOpen(true);
  };

  const handleAddVehicle = () => {
    setEditingVehicle(null);
    form.reset({
      name: "",
      licensePlate: "",
      type: "car",
      capacity: 0,
      active: true
    });
    setIsDialogOpen(true);
  };

  const handleDeleteVehicle = (id: string) => {
    setVehicleToDelete(id);
    setIsDeleteConfirmOpen(true);
  };

  const confirmDeleteVehicle = async () => {
    if (!vehicleToDelete) return;
    
    try {
      setIsDeleting(true);
      console.log("Confirmando exclusão do veículo:", vehicleToDelete);
      await deleteVehicle(vehicleToDelete);
    } catch (error) {
      console.error("Erro ao excluir veículo em Vehicles.tsx:", error);
    } finally {
      setIsDeleting(false);
      setIsDeleteConfirmOpen(false);
      setVehicleToDelete(null);
    }
  };

  const onSubmit = (data: z.infer<typeof vehicleFormSchema>) => {
    if (editingVehicle) {
      updateVehicle(editingVehicle.id, {
        name: data.name,
        licensePlate: data.licensePlate,
        type: data.type,
        capacity: data.capacity,
        active: data.active
      });
    } else {
      addVehicle({
        name: data.name,
        licensePlate: data.licensePlate,
        type: data.type,
        capacity: data.capacity,
        active: data.active
      });
    }
    setIsDialogOpen(false);
  };

  const getVehicleTypeLabel = (type: string) => {
    switch (type) {
      case 'car': return 'Carro';
      case 'van': return 'Van';
      case 'truck': return 'Caminhão';
      case 'motorcycle': return 'Moto';
      default: return type;
    }
  };

  return (
    <PageLayout 
      title="Cadastro de Veículos" 
      subtitle="Gerenciamento dos veículos disponíveis para as rotas de entrega"
    >
      <div className="mb-6 flex justify-between items-center">
        <div>
          <h2 className="text-lg font-semibold">Veículos</h2>
          <p className="text-gray-500">Cadastre e gerencie os veículos utilizados nas rotas</p>
        </div>
        <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleAddVehicle}>
          <Plus size={16} className="mr-2" /> Novo Veículo
        </Button>
      </div>

      {vehicles.length > 0 ? (
        <Card>
          <CardHeader>
            <CardTitle>Lista de Veículos</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nome</TableHead>
                  <TableHead>Placa</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Capacidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {vehicles.map((vehicle) => (
                  <TableRow key={vehicle.id}>
                    <TableCell className="font-medium">{vehicle.name}</TableCell>
                    <TableCell>{vehicle.licensePlate}</TableCell>
                    <TableCell>{getVehicleTypeLabel(vehicle.type)}</TableCell>
                    <TableCell>{vehicle.capacity} kg</TableCell>
                    <TableCell>
                      <div className={`inline-flex px-2 py-1 rounded-full text-xs font-medium ${vehicle.active ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                        {vehicle.active ? 'Ativo' : 'Inativo'}
                      </div>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          onClick={() => handleEditVehicle(vehicle)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button 
                          variant="ghost" 
                          size="icon" 
                          className="text-red-500" 
                          onClick={() => handleDeleteVehicle(vehicle.id)}
                        >
                          <Trash2 size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <div className="text-center py-12 bg-white rounded-lg shadow">
          <Truck size={48} className="mx-auto text-gray-400 mb-2" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">Nenhum veículo cadastrado</h3>
          <p className="text-gray-500">Cadastre um novo veículo para utilizar nas rotas de entrega</p>
          <Button className="mt-4 bg-sales-800 hover:bg-sales-700" onClick={handleAddVehicle}>
            <Plus size={16} className="mr-2" /> Cadastrar Veículo
          </Button>
        </div>
      )}

      {/* Vehicle Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>{editingVehicle ? 'Editar Veículo' : 'Novo Veículo'}</DialogTitle>
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
                      <Input placeholder="Nome do veículo" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="licensePlate"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Placa</FormLabel>
                    <FormControl>
                      <Input placeholder="AAA-0000" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="type"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="car">Carro</SelectItem>
                        <SelectItem value="van">Van</SelectItem>
                        <SelectItem value="truck">Caminhão</SelectItem>
                        <SelectItem value="motorcycle">Moto</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="capacity"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Capacidade (kg)</FormLabel>
                    <FormControl>
                      <Input 
                        type="number" 
                        placeholder="0" 
                        {...field}
                        onChange={e => field.onChange(Number(e.target.value))}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="active"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-center justify-between rounded-lg border p-3 shadow-sm">
                    <div className="space-y-0.5">
                      <FormLabel>Ativo</FormLabel>
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
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button type="submit" className="bg-sales-800 hover:bg-sales-700">
                  {editingVehicle ? 'Atualizar' : 'Cadastrar'} Veículo
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={isDeleteConfirmOpen} onOpenChange={setIsDeleteConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este veículo? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction 
              onClick={(e) => {
                e.preventDefault(); // Prevent default dialog close behavior
                confirmDeleteVehicle();
              }} 
              className="bg-destructive text-destructive-foreground"
              disabled={isDeleting}
            >
              {isDeleting ? "Excluindo..." : "Excluir"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
