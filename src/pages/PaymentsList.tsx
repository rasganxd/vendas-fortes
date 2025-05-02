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
import { Payment } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { toast } from '@/components/ui/use-toast';

interface FormErrors {
  orderId?: string;
  amount?: string;
  method?: string;
  date?: string;
}

export default function PaymentsList() {
  const { payments, addPayment, updatePayment, deletePayment, orders } = useAppContext();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingPayment, setEditingPayment] = useState<Payment>({
    id: '',
    orderId: '',
    date: new Date(),
    amount: 0,
    method: '',
    notes: '',
    createdAt: new Date(),
    updatedAt: new Date()
  });
  const [formData, setFormData] = useState({
    orderId: '',
    amount: 0,
    method: '',
    status: 'pending',
    date: new Date(),
    notes: ''
  });
  const [formErrors, setFormErrors] = useState<FormErrors>({});

  const filteredPayments = payments.filter(payment =>
    payment.orderId.toLowerCase().includes(search.toLowerCase()) ||
    payment.method.toLowerCase().includes(search.toLowerCase())
  );

  const validateForm = (): boolean => {
    let errors: FormErrors = {};
    if (!formData.orderId) {
      errors.orderId = 'Pedido é obrigatório';
    }
    if (!formData.amount) {
      errors.amount = 'Valor é obrigatório';
    }
    if (!formData.method) {
      errors.method = 'Método é obrigatório';
    }
    if (!formData.date) {
      errors.date = 'Data é obrigatória';
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleAddDialogOpen = () => {
    setFormData({
      orderId: '',
      amount: 0,
      method: '',
      status: 'pending',
      date: new Date(),
      notes: ''
    });
    setFormErrors({});
    setIsAddDialogOpen(true);
  };

  const handleEditClick = (payment: Payment) => {
    setEditingPayment(payment);
    setFormData({
      orderId: payment.orderId,
      amount: payment.amount,
      method: payment.method,
      status: payment.status || 'pending',
      date: payment.date,
      notes: payment.notes
    });
    setIsEditDialogOpen(true);
  };

  const handleDeleteClick = (payment: Payment) => {
    setEditingPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleCloseDialog = () => {
    setIsAddDialogOpen(false);
    setIsEditDialogOpen(false);
    setIsDeleteDialogOpen(false);
    setFormErrors({});
  };

  const handleAddPayment = async () => {
    if (validateForm()) {
      try {
        await addPayment({
          orderId: formData.orderId,
          amount: formData.amount,
          method: formData.method,
          status: formData.status,
          date: formData.date,
          notes: formData.notes,
          createdAt: new Date(),
          updatedAt: new Date()
        });
        setIsAddDialogOpen(false);
        setFormErrors({});
        resetFormData();
      } catch (error) {
        console.error("Error adding payment:", error);
      }
    }
  };

  const handleEditPayment = async () => {
    if (validateForm()) {
      try {
        await updatePayment(editingPayment.id, {
          orderId: formData.orderId,
          amount: formData.amount,
          method: formData.method,
          status: formData.status,
          date: formData.date,
          notes: formData.notes,
          updatedAt: new Date()
        });
        setIsEditDialogOpen(false);
        setFormErrors({});
      } catch (error) {
        console.error("Error updating payment:", error);
      }
    }
  };

  const handleDeleteConfirmation = async () => {
    try {
      await deletePayment(editingPayment.id);
      setIsDeleteDialogOpen(false);
    } catch (error) {
      console.error("Error deleting payment:", error);
    }
  };

  const resetFormData = () => {
    setFormData({
      orderId: '',
      amount: 0,
      method: '',
      status: 'pending',
      date: new Date(),
      notes: ''
    });
  };

  return (
    <PageLayout title="Pagamentos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pagamentos</CardTitle>
              <CardDescription>
                Gerencie os pagamentos recebidos
              </CardDescription>
            </div>
            <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleAddDialogOpen}>
                  <Plus size={16} className="mr-2" /> Novo Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Pagamento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="order-id">Pedido</Label>
                    <Select value={formData.orderId} onValueChange={(value) => setFormData({ ...formData, orderId: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pedido" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map((order) => (
                          <SelectItem key={order.id} value={order.id}>{order.id}</SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    {formErrors.orderId && <p className="text-red-500 text-sm">{formErrors.orderId}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="amount">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      value={formData.amount}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
                    />
                    {formErrors.amount && <p className="text-red-500 text-sm">{formErrors.amount}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="method">Método</Label>
                    <Input
                      id="method"
                      value={formData.method}
                      onChange={(e) => setFormData({ ...formData, method: e.target.value })}
                    />
                    {formErrors.method && <p className="text-red-500 text-sm">{formErrors.method}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="partial">Parcial</SelectItem>
                        <SelectItem value="paid">Pago</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="date">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={formatDateToBR(formData.date)}
                      onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
                    />
                    {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="notes">Notas</Label>
                    <Input
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={handleCloseDialog}>
                    Cancelar
                  </Button>
                  <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleAddPayment}>
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
                placeholder="Buscar pagamentos..."
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
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.map((payment) => (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.orderId}</TableCell>
                    <TableCell>R$ {payment.amount}</TableCell>
                    <TableCell>{payment.method}</TableCell>
                    <TableCell>{payment.status}</TableCell>
                    <TableCell>{formatDateToBR(payment.date)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleEditClick(payment)}
                        >
                          <Edit size={16} />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteClick(payment)}
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

      {/* Edit Payment Dialog */}
      <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Editar Pagamento</DialogTitle>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="order-id">Pedido</Label>
              <Select value={formData.orderId} onValueChange={(value) => setFormData({ ...formData, orderId: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pedido" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map((order) => (
                    <SelectItem key={order.id} value={order.id}>{order.id}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.orderId && <p className="text-red-500 text-sm">{formErrors.orderId}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="amount">Valor</Label>
              <Input
                id="amount"
                type="number"
                value={formData.amount}
                onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) })}
              />
              {formErrors.amount && <p className="text-red-500 text-sm">{formErrors.amount}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="method">Método</Label>
              <Input
                id="method"
                value={formData.method}
                onChange={(e) => setFormData({ ...formData, method: e.target.value })}
              />
              {formErrors.method && <p className="text-red-500 text-sm">{formErrors.method}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="partial">Parcial</SelectItem>
                  <SelectItem value="paid">Pago</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="date">Data</Label>
              <Input
                id="date"
                type="date"
                value={formatDateToBR(formData.date)}
                onChange={(e) => setFormData({ ...formData, date: new Date(e.target.value) })}
              />
              {formErrors.date && <p className="text-red-500 text-sm">{formErrors.date}</p>}
            </div>
            <div className="space-y-2">
              <Label htmlFor="notes">Notas</Label>
              <Input
                id="notes"
                value={formData.notes}
                onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={handleCloseDialog}>
              Cancelar
            </Button>
            <Button type="submit" className="bg-sales-800 hover:bg-sales-700" onClick={handleEditPayment}>
              Atualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmação de exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o pagamento? Esta ação não pode ser desfeita.
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
