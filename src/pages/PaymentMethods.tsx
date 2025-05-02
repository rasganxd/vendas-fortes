
import React, { useState, useEffect } from 'react';
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
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
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
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Plus, Search, Edit, Trash } from 'lucide-react';
import { PaymentMethod } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface FormErrors {
  name?: string;
}

// Update the type for payment method to include the type "card"
type PaymentMethodType = 'cash' | 'credit' | 'debit' | 'transfer' | 'check' | 'card' | 'other';

export default function PaymentMethods() {
  const { paymentMethods, addPaymentMethod, updatePaymentMethod, deletePaymentMethod } = useAppContext();
  const [search, setSearch] = useState('');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingMethod, setEditingMethod] = useState<PaymentMethod>({
    id: '',
    name: '',
    description: '',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'cash',
    active: true
  });
  const [newMethod, setNewMethod] = useState<Omit<PaymentMethod, 'id'>>({
    name: '',
    description: '',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date(),
    type: 'cash',
    active: true
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const filteredMethods = paymentMethods.filter(method =>
    method.name.toLowerCase().includes(search.toLowerCase()) ||
    (method.type && method.type.toLowerCase().includes(search.toLowerCase()))
  );

  const validateForm = (method: Omit<PaymentMethod, 'id'>): boolean => {
    let errors: FormErrors = {};
    if (!method.name) {
      errors.name = 'Nome é obrigatório';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewMethod = () => {
    setNewMethod({
      name: '',
      description: '',
      notes: '',
      createdAt: new Date(),
      updatedAt: new Date(),
      type: 'cash',
      active: true
    });
    setIsNewDialogOpen(true);
  };

  const handleEditMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleDeleteMethod = (method: PaymentMethod) => {
    setEditingMethod(method);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsNewDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setFormErrors({});
  };

  const handleAddMethod = async () => {
    if (validateForm(newMethod)) {
      try {
        await addPaymentMethod({
          name: newMethod.name,
          description: newMethod.description,
          notes: newMethod.notes,
          createdAt: newMethod.createdAt,
          updatedAt: newMethod.updatedAt,
          type: newMethod.type,
          active: newMethod.active
        });
        setIsNewDialogOpen(false);
        setFormErrors({});
      } catch (error) {
        console.error("Error adding payment method:", error);
      }
    }
  };

  const handleUpdateMethod = async () => {
    if (validateForm(editingMethod)) {
      try {
        await updatePaymentMethod(editingMethod.id, {
          name: editingMethod.name,
          description: editingMethod.description,
          notes: editingMethod.notes,
          updatedAt: new Date(),
          type: editingMethod.type,
          active: editingMethod.active
        });
        setIsEditDialogOpen(false);
        setFormErrors({});
      } catch (error) {
        console.error("Error updating payment method:", error);
      }
    }
  };

  const handleDeleteConfirmation = async () => {
    try {
      await deletePaymentMethod(editingMethod.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting payment method:", error);
    }
  };

  // Update the function handleTypeChange to use the type
  const handleTypeChange = (value: PaymentMethodType) => {
    setEditingMethod({...editingMethod, type: value});
  };

  return (
    <PageLayout title="Formas de Pagamento">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Formas de Pagamento</CardTitle>
              <CardDescription>
                Gerencie suas formas de pagamento
              </CardDescription>
            </div>
            <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleNewMethod}>
                  <Plus size={16} className="mr-2" /> Nova Forma de Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Forma de Pagamento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="new-name">Nome</Label>
                    <Input
                      id="new-name"
                      value={newMethod.name || ''}
                      onChange={(e) => setNewMethod({ ...newMethod, name: e.target.value })}
                    />
                    {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-type">Tipo</Label>
                    {/* Corrigir o select de tipo */}
                    <Select value={newMethod.type || 'cash'} onValueChange={(value: PaymentMethodType) => setNewMethod({...newMethod, type: value})}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um tipo" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="card">Cartão</SelectItem>
                        <SelectItem value="credit">Crédito</SelectItem>
                        <SelectItem value="debit">Débito</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      id="new-active"
                      checked={newMethod.active}
                      onChange={(e) => setNewMethod({ ...newMethod, active: e.target.checked })}
                    />
                    <Label htmlFor="new-active">Ativo</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleAddMethod}>
                    Adicionar
                  </Button>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                placeholder="Buscar formas de pagamento..."
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
                  <TableHead>Nome</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredMethods.map((method) => (
                  <TableRow key={method.id}>
                    <TableCell className="font-medium">{method.name}</TableCell>
                    <TableCell>{method.type}</TableCell>
                    <TableCell>{method.active ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditMethod(method)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteMethod(method)}
                        >
                          <Trash size={16} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Edit Method Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Forma de Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="edit-name">Nome</Label>
              <Input
                id="edit-name"
                value={editingMethod.name || ''}
                onChange={(e) => setEditingMethod({ ...editingMethod, name: e.target.value })}
              />
              {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-type">Tipo</Label>
              {/* Corrigir o select de tipo */}
              <Select value={editingMethod.type || 'cash'} onValueChange={handleTypeChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um tipo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="card">Cartão</SelectItem>
                  <SelectItem value="credit">Crédito</SelectItem>
                  <SelectItem value="debit">Débito</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                  <SelectItem value="other">Outro</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="checkbox"
                id="edit-active"
                checked={editingMethod.active}
                onChange={(e) => setEditingMethod({ ...editingMethod, active: e.target.checked })}
              />
              <Label htmlFor="edit-active">Ativo</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleUpdateMethod}>
              Atualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Method Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir a forma de pagamento {editingMethod.name}? Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleCloseDialog}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmation} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
