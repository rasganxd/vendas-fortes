
import { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { usePayments } from '@/hooks/usePayments';
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
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle 
} from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Payment } from '@/types';
import { formatDateToBR } from '@/lib/date-utils';
import { Search, Plus, Edit, Trash } from 'lucide-react';
import { Badge } from '@/components/ui/badge';

export default function PaymentsList() {
  const { payments, orders } = useAppContext();
  const { addPayment, updatePayment, deletePayment } = usePayments();
  const [search, setSearch] = useState('');
  const [isNewDialogOpen, setIsNewDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [formErrors, setFormErrors] = useState<Record<string, string>>({});
  
  const [newPayment, setNewPayment] = useState<Omit<Payment, 'id'>>({
    orderId: '',
    amount: 0,
    method: 'cash',
    status: 'completed',
    date: new Date(),
    notes: ''
  });
  
  const [editingPayment, setEditingPayment] = useState<Payment>({
    id: '',
    orderId: '',
    amount: 0,
    method: 'cash',
    status: 'completed',
    date: new Date(),
    notes: ''
  });

  const filteredPayments = payments.filter(payment => {
    const order = orders.find(o => o.id === payment.orderId);
    const orderCustomerName = order ? order.customerName.toLowerCase() : '';
    
    return payment.orderId.toLowerCase().includes(search.toLowerCase()) ||
           orderCustomerName.includes(search.toLowerCase()) ||
           (payment.notes && payment.notes.toLowerCase().includes(search.toLowerCase()));
  });

  const validateForm = (payment: Omit<Payment, 'id'>): boolean => {
    let errors: Record<string, string> = {};
    
    if (!payment.orderId) {
      errors.orderId = 'Pedido é obrigatório';
    }
    
    if (!payment.amount || payment.amount <= 0) {
      errors.amount = 'Valor deve ser maior que zero';
    }
    
    if (!payment.method) {
      errors.method = 'Método de pagamento é obrigatório';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleNewPayment = () => {
    setNewPayment({
      orderId: '',
      amount: 0,
      method: 'cash',
      status: 'completed',
      date: new Date(),
      notes: ''
    });
    setFormErrors({});
    setIsNewDialogOpen(true);
  };

  const handleEditPayment = (payment: Payment) => {
    setEditingPayment(payment);
    setFormErrors({});
    setIsEditDialogOpen(true);
  };

  const handleDeletePayment = (payment: Payment) => {
    setEditingPayment(payment);
    setIsDeleteDialogOpen(true);
  };

  const handleAddPayment = async () => {
    if (validateForm(newPayment)) {
      await addPayment(newPayment);
      setIsNewDialogOpen(false);
    }
  };

  const handleUpdatePayment = async () => {
    if (validateForm(editingPayment)) {
      await updatePayment(editingPayment.id, editingPayment);
      setIsEditDialogOpen(false);
    }
  };

  const handleDeleteConfirmation = async () => {
    await deletePayment(editingPayment.id);
    setIsDeleteDialogOpen(false);
  };

  const formatCurrency = (value: number) => {
    return value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'pending':
        return <Badge variant="outline" className="border-yellow-500 text-yellow-500">Pendente</Badge>;
      case 'completed':
        return <Badge className="bg-green-500">Concluído</Badge>;
      case 'failed':
        return <Badge variant="destructive">Falhou</Badge>;
      default:
        return <Badge variant="secondary">{status}</Badge>;
    }
  };

  const getOrderCustomerName = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    return order ? order.customerName : 'Cliente não encontrado';
  };

  return (
    <PageLayout title="Pagamentos">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>Lista de Pagamentos</CardTitle>
              <CardDescription>Gerencie todos os pagamentos</CardDescription>
            </div>
            <Dialog open={isNewDialogOpen} onOpenChange={setIsNewDialogOpen}>
              <DialogTrigger asChild>
                <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleNewPayment}>
                  <Plus size={16} className="mr-2" /> Novo Pagamento
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Adicionar Pagamento</DialogTitle>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="orderId">Pedido</Label>
                    <Select 
                      value={newPayment.orderId} 
                      onValueChange={(value) => setNewPayment({ ...newPayment, orderId: value })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um pedido" />
                      </SelectTrigger>
                      <SelectContent>
                        {orders.map(order => (
                          <SelectItem key={order.id} value={order.id}>
                            {order.id} - {order.customerName}
                          </SelectItem>
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
                      min="0.01"
                      step="0.01"
                      value={newPayment.amount}
                      onChange={(e) => setNewPayment({ ...newPayment, amount: parseFloat(e.target.value) || 0 })}
                    />
                    {formErrors.amount && <p className="text-red-500 text-sm">{formErrors.amount}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="method">Método de Pagamento</Label>
                    <Select 
                      value={newPayment.method} 
                      onValueChange={(value: 'cash' | 'credit' | 'debit' | 'transfer' | 'check') => 
                        setNewPayment({ ...newPayment, method: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o método" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="cash">Dinheiro</SelectItem>
                        <SelectItem value="credit">Cartão de crédito</SelectItem>
                        <SelectItem value="debit">Cartão de débito</SelectItem>
                        <SelectItem value="transfer">Transferência</SelectItem>
                        <SelectItem value="check">Cheque</SelectItem>
                      </SelectContent>
                    </Select>
                    {formErrors.method && <p className="text-red-500 text-sm">{formErrors.method}</p>}
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="status">Status</Label>
                    <Select 
                      value={newPayment.status} 
                      onValueChange={(value: 'pending' | 'completed' | 'failed') => 
                        setNewPayment({ ...newPayment, status: value })
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione o status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="pending">Pendente</SelectItem>
                        <SelectItem value="completed">Concluído</SelectItem>
                        <SelectItem value="failed">Falhou</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  
                  <div className="space-y-2">
                    <Label htmlFor="notes">Observações</Label>
                    <Input
                      id="notes"
                      value={newPayment.notes || ''}
                      onChange={(e) => setNewPayment({ ...newPayment, notes: e.target.value })}
                    />
                  </div>
                </div>
                <div className="flex justify-end gap-2">
                  <Button type="button" variant="outline" onClick={() => setIsNewDialogOpen(false)}>
                    Cancelar
                  </Button>
                  <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleAddPayment}>
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
                  <TableHead>Cliente</TableHead>
                  <TableHead>Data</TableHead>
                  <TableHead>Valor</TableHead>
                  <TableHead>Método</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredPayments.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={7} className="text-center py-4 text-muted-foreground">
                      Nenhum pagamento encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredPayments.map((payment) => (
                    <TableRow key={payment.id}>
                      <TableCell className="font-medium">{payment.orderId}</TableCell>
                      <TableCell>{getOrderCustomerName(payment.orderId)}</TableCell>
                      <TableCell>{formatDateToBR(payment.date)}</TableCell>
                      <TableCell>{formatCurrency(payment.amount)}</TableCell>
                      <TableCell>
                        {payment.method === 'cash' && 'Dinheiro'}
                        {payment.method === 'credit' && 'Cartão de crédito'}
                        {payment.method === 'debit' && 'Cartão de débito'}
                        {payment.method === 'transfer' && 'Transferência'}
                        {payment.method === 'check' && 'Cheque'}
                      </TableCell>
                      <TableCell>{getStatusBadge(payment.status)}</TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleEditPayment(payment)}
                          >
                            <Edit size={16} />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleDeletePayment(payment)}
                            className="text-red-500 hover:text-red-700"
                          >
                            <Trash size={16} />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))
                )}
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
              <Label htmlFor="edit-orderId">Pedido</Label>
              <Select 
                value={editingPayment.orderId} 
                onValueChange={(value) => setEditingPayment({ ...editingPayment, orderId: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um pedido" />
                </SelectTrigger>
                <SelectContent>
                  {orders.map(order => (
                    <SelectItem key={order.id} value={order.id}>
                      {order.id} - {order.customerName}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {formErrors.orderId && <p className="text-red-500 text-sm">{formErrors.orderId}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-amount">Valor</Label>
              <Input
                id="edit-amount"
                type="number"
                min="0.01"
                step="0.01"
                value={editingPayment.amount}
                onChange={(e) => setEditingPayment({ ...editingPayment, amount: parseFloat(e.target.value) || 0 })}
              />
              {formErrors.amount && <p className="text-red-500 text-sm">{formErrors.amount}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-method">Método de Pagamento</Label>
              <Select 
                value={editingPayment.method} 
                onValueChange={(value: 'cash' | 'credit' | 'debit' | 'transfer' | 'check') => 
                  setEditingPayment({ ...editingPayment, method: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o método" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="cash">Dinheiro</SelectItem>
                  <SelectItem value="credit">Cartão de crédito</SelectItem>
                  <SelectItem value="debit">Cartão de débito</SelectItem>
                  <SelectItem value="transfer">Transferência</SelectItem>
                  <SelectItem value="check">Cheque</SelectItem>
                </SelectContent>
              </Select>
              {formErrors.method && <p className="text-red-500 text-sm">{formErrors.method}</p>}
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-status">Status</Label>
              <Select 
                value={editingPayment.status} 
                onValueChange={(value: 'pending' | 'completed' | 'failed') => 
                  setEditingPayment({ ...editingPayment, status: value })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pending">Pendente</SelectItem>
                  <SelectItem value="completed">Concluído</SelectItem>
                  <SelectItem value="failed">Falhou</SelectItem>
                </SelectContent>
              </Select>
            </div>
            
            <div className="space-y-2">
              <Label htmlFor="edit-notes">Observações</Label>
              <Input
                id="edit-notes"
                value={editingPayment.notes || ''}
                onChange={(e) => setEditingPayment({ ...editingPayment, notes: e.target.value })}
              />
            </div>
          </div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => setIsEditDialogOpen(false)}>
              Cancelar
            </Button>
            <Button className="bg-sales-800 hover:bg-sales-700" onClick={handleUpdatePayment}>
              Atualizar
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Delete Payment Dialog */}
      <AlertDialog open={isDeleteDialogOpen} onOpenChange={setIsDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir este pagamento no valor de {formatCurrency(editingPayment.amount)}?
              Esta ação não pode ser desfeita.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsDeleteDialogOpen(false)}>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirmation} className="bg-red-600 hover:bg-red-700">
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </PageLayout>
  );
}
