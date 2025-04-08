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
import { SalesRep } from '@/types';
import { toast } from '@/components/ui/use-toast';

interface FormErrors {
  code?: string;
  name?: string;
  email?: string;
  phone?: string;
}

export default function SalesReps() {
  const { salesReps, addSalesRep, updateSalesRep, deleteSalesRep } = useAppContext();
  const [search, setSearch] = useState('');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingSalesRep, setEditingSalesRep] = useState<SalesRep>({
    id: '',
    code: 0,
    name: '',
    email: '',
    phone: '',
    role: 'sales',
    active: true
  });
  const [newSalesRep, setNewSalesRep] = useState<Omit<SalesRep, 'id'>>({
    code: 0,
    name: '',
    email: '',
    phone: '',
    role: 'sales',
    active: true
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const roles = ['admin', 'manager', 'sales', 'driver'];

  const filteredSalesReps = salesReps.filter(rep =>
    rep.name.toLowerCase().includes(search.toLowerCase()) ||
    rep.email.toLowerCase().includes(search.toLowerCase()) ||
    rep.phone.includes(search) ||
    (rep.code?.toString() || '').includes(search)
  );

  const validateForm = (rep: Omit<SalesRep, 'id'>): boolean => {
    let errors: FormErrors = {};
    if (!rep.code) {
      errors.code = 'Código é obrigatório';
    }
    if (!rep.name) {
      errors.name = 'Nome é obrigatório';
    }
    if (!rep.email) {
      errors.email = 'Email é obrigatório';
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(rep.email)) {
      errors.email = 'Email inválido';
    }
    if (!rep.phone) {
      errors.phone = 'Telefone é obrigatório';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewSalesRep = () => {
    // Generate next available code like we do for customers
    const nextCode = salesReps.length > 0 
      ? Math.max(...salesReps.map(rep => rep.code || 0)) + 1 
      : 1;

    setNewSalesRep({
      code: nextCode,
      name: '',
      email: '',
      phone: '',
      role: 'sales',
      region: '',
      active: true
    });
    setIsNewDialogOpen(true);
  };

  const handleEditSalesRep = (rep: SalesRep) => {
    setEditingSalesRep(rep);
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleDeleteSalesRep = (rep: SalesRep) => {
    setEditingSalesRep(rep);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsNewDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setFormErrors({});
  };

  const handleAddSalesRep = async () => {
    if (validateForm(newSalesRep)) {
      try {
        await addSalesRep({
          code: newSalesRep.code,
          name: newSalesRep.name,
          email: newSalesRep.email,
          phone: newSalesRep.phone,
          role: newSalesRep.role as 'admin' | 'manager' | 'sales' | 'driver',
          region: newSalesRep.region,
          active: newSalesRep.active
        });
        setIsNewDialogOpen(false);
        setFormErrors({});
      } catch (error) {
        console.error("Error adding sales rep:", error);
      }
    }
  };

  const handleUpdateSalesRep = async () => {
    if (validateForm(editingSalesRep)) {
      try {
        await updateSalesRep(editingSalesRep.id, {
          code: editingSalesRep.code,
          name: editingSalesRep.name,
          email: editingSalesRep.email,
          phone: editingSalesRep.phone,
          role: editingSalesRep.role as 'admin' | 'manager' | 'sales' | 'driver',
          region: editingSalesRep.region,
          active: editingSalesRep.active
        });
        setIsEditDialogOpen(false);
        setFormErrors({});
      } catch (error) {
        console.error("Error updating sales rep:", error);
      }
    }
  };

  const handleDeleteConfirmation = async () => {
    try {
      await deleteSalesRep(editingSalesRep.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting sales rep:", error);
    }
  };

  return (
    <PageLayout title="Representantes">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Representantes</CardTitle>
              <CardDescription>
                Gerencie seus representantes de vendas
              </CardDescription>
            </div>
            <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleNewSalesRep}>
                  <Plus size={16} className="mr-2" /> Novo Representante
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Representante</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
                    <div className="space-y-2">
                      <Label htmlFor="new-code">Código</Label>
                      <Input
                        id="new-code"
                        type="number"
                        value={newSalesRep.code || ''}
                        onChange={(e) => setNewSalesRep({ ...newSalesRep, code: Number(e.target.value) })}
                      />
                      {formErrors.code && <p className="text-red-500 text-sm">{formErrors.code}</p>}
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="new-name">Nome</Label>
                      <Input
                        id="new-name"
                        value={newSalesRep.name || ''}
                        onChange={(e) => setNewSalesRep({ ...newSalesRep, name: e.target.value })}
                      />
                      {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-email">Email</Label>
                    <Input
                      id="new-email"
                      type="email"
                      value={newSalesRep.email || ''}
                      onChange={(e) => setNewSalesRep({ ...newSalesRep, email: e.target.value })}
                    />
                    {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-phone">Telefone</Label>
                    <Input
                      id="new-phone"
                      value={newSalesRep.phone || ''}
                      onChange={(e) => setNewSalesRep({ ...newSalesRep, phone: e.target.value })}
                    />
                    {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-role">Função</Label>
                    <Select onValueChange={(value) => setNewSalesRep({ ...newSalesRep, role: value as 'sales' | 'admin' | 'manager' | 'driver' })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {roles.map(role => (
                          <SelectItem key={role} value={role}>{role}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="new-region">Região</Label>
                    <Input
                      id="new-region"
                      value={newSalesRep.region || ''}
                      onChange={(e) => setNewSalesRep({ ...newSalesRep, region: e.target.value })}
                    />
                  </div>
                  <div className="flex items-center space-x-2">
                    <Input
                      type="checkbox"
                      id="new-active"
                      checked={newSalesRep.active}
                      onChange={(e) => setNewSalesRep({ ...newSalesRep, active: e.target.checked })}
                    />
                    <Label htmlFor="new-active">Ativo</Label>
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleAddSalesRep}>
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
                placeholder="Buscar representantes..."
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
                  <TableHead>Código</TableHead>
                  <TableHead>Nome</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Telefone</TableHead>
                  <TableHead>Função</TableHead>
                  <TableHead>Região</TableHead>
                  <TableHead>Ativo</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredSalesReps.map((rep) => (
                  <TableRow key={rep.id}>
                    <TableCell className="font-medium">{rep.code}</TableCell>
                    <TableCell>{rep.name}</TableCell>
                    <TableCell>{rep.email}</TableCell>
                    <TableCell>{rep.phone}</TableCell>
                    <TableCell>{rep.role}</TableCell>
                    <TableCell>{rep.region}</TableCell>
                    <TableCell>{rep.active ? 'Sim' : 'Não'}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditSalesRep(rep)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteSalesRep(rep)}
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

      {/* Edit Sales Rep Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Representante</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
              <div className="space-y-2">
                <Label htmlFor="edit-code">Código</Label>
                <Input
                  id="edit-code"
                  type="number"
                  value={editingSalesRep.code || ''}
                  onChange={(e) => setEditingSalesRep({ ...editingSalesRep, code: Number(e.target.value) })}
                />
                {formErrors.code && <p className="text-red-500 text-sm">{formErrors.code}</p>}
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome</Label>
                <Input
                  id="edit-name"
                  value={editingSalesRep.name || ''}
                  onChange={(e) => setEditingSalesRep({ ...editingSalesRep, name: e.target.value })}
                />
                {formErrors.name && <p className="text-red-500 text-sm">{formErrors.name}</p>}
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-email">Email</Label>
              <Input
                id="edit-email"
                type="email"
                value={editingSalesRep.email || ''}
                onChange={(e) => setEditingSalesRep({ ...editingSalesRep, email: e.target.value })}
              />
              {formErrors.email && <p className="text-red-500 text-sm">{formErrors.email}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-phone">Telefone</Label>
              <Input
                id="edit-phone"
                value={editingSalesRep.phone || ''}
                onChange={(e) => setEditingSalesRep({ ...editingSalesRep, phone: e.target.value })}
              />
              {formErrors.phone && <p className="text-red-500 text-sm">{formErrors.phone}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-role">Função</Label>
              <Select value={editingSalesRep.role} onValueChange={(value) => setEditingSalesRep({ ...editingSalesRep, role: value as 'sales' | 'admin' | 'manager' | 'driver' })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione" />
                </SelectTrigger>
                <SelectContent>
                  {roles.map(role => (
                    <SelectItem key={role} value={role}>{role}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-region">Região</Label>
              <Input
                id="edit-region"
                value={editingSalesRep.region || ''}
                onChange={(e) => setEditingSalesRep({ ...editingSalesRep, region: e.target.value })}
              />
            </div>
            <div className="flex items-center space-x-2">
              <Input
                type="checkbox"
                id="edit-active"
                checked={editingSalesRep.active}
                onChange={(e) => setEditingSalesRep({ ...editingSalesRep, active: e.target.checked })}
              />
              <Label htmlFor="edit-active">Ativo</Label>
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleUpdateSalesRep}>
              Atualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Sales Rep Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o representante {editingSalesRep.name}? Esta ação não pode ser desfeita.
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
