
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
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
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { formatDateToBR } from '@/lib/date-utils';
import { Search, Plus, Calendar, FileText, Printer } from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardDescription, 
  CardHeader, 
  CardTitle,
  CardFooter
} from '@/components/ui/card';
import { Payment, Order, PaymentTable } from '@/types';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PromissoryNoteView from '@/components/payments/PromissoryNoteView';

export default function Payments() {
  const { payments, orders, paymentTables, customers } = useAppContext();
  const { addPayment } = usePayments();
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPaymentTable, setSelectedPaymentTable] = useState<PaymentTable | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showPromissoryNote, setShowPromissoryNote] = useState(false);
  
  const [formData, setFormData] = useState({
    orderId: '',
    amount: 0,
    method: 'cash',
    status: 'completed',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'check', label: 'Cheque' }
  ];

  const filteredPayments = payments.filter(payment =>
    payment.orderId.toLowerCase().includes(search.toLowerCase()) ||
    payment.id.toLowerCase().includes(search.toLowerCase())
  );

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    
    if (name === 'amount') {
      setFormData(prev => ({ ...prev, [name]: Number(value) }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSelectChange = (name: string, value: string) => {
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleAddPayment = (e: React.FormEvent) => {
    e.preventDefault();
    addPayment({
      orderId: formData.orderId,
      amount: formData.amount,
      method: formData.method as 'cash' | 'credit' | 'debit' | 'transfer' | 'check',
      status: 'completed',
      date: new Date(formData.date),
      notes: formData.notes || undefined
    });
    setFormData({
      orderId: '',
      amount: 0,
      method: 'cash',
      status: 'completed',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
    setIsAddDialogOpen(false);
  };

  const getMethodBadge = (method: string) => {
    switch (method) {
      case 'cash':
        return <Badge className="bg-green-500">Dinheiro</Badge>;
      case 'credit':
        return <Badge className="bg-blue-500">Crédito</Badge>;
      case 'debit':
        return <Badge className="bg-teal-500">Débito</Badge>;
      case 'transfer':
        return <Badge className="bg-purple-500">Transferência</Badge>;
      case 'check':
        return <Badge className="bg-amber-500">Cheque</Badge>;
      default:
        return <Badge>{method}</Badge>;
    }
  };

  const pendingPaymentOrders = orders
    .filter(order => 
      order.status !== 'cancelled' && 
      (order.paymentStatus === 'pending' || order.paymentStatus === 'partial')
    )
    .map(order => ({
      id: order.id,
      customerName: order.customerName,
      customerId: order.customerId,
      total: order.total,
      paymentTableId: order.paymentTableId,
      paid: payments
        .filter(p => p.orderId === order.id && p.status === 'completed')
        .reduce((sum, p) => sum + p.amount, 0)
    }));
    
  const handleViewPromissoryNote = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (order && order.paymentTableId) {
      const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
      if (paymentTable && paymentTable.type === 'promissory_note') {
        setSelectedPaymentTable(paymentTable);
        setSelectedOrderId(orderId);
        setShowPromissoryNote(true);
      }
    }
  };

  const getOrderCustomer = (customerId: string) => {
    return customers.find(c => c.id === customerId);
  };

  return (
    <PageLayout title="Pagamentos">
      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="mb-4">
          <TabsTrigger value="pending">Pagamentos Pendentes</TabsTrigger>
          <TabsTrigger value="history">Histórico de Pagamentos</TabsTrigger>
          <TabsTrigger value="promissory">Notas Promissórias</TabsTrigger>
        </TabsList>
        
        <TabsContent value="pending" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Pagamentos Pendentes</CardTitle>
              <CardDescription>Pedidos com pagamentos em aberto</CardDescription>
            </CardHeader>
            <CardContent>
              {pendingPaymentOrders.length === 0 ? (
                <div className="text-center py-8 text-gray-500">
                  Não há pagamentos pendentes
                </div>
              ) : (
                <div className="space-y-4">
                  {pendingPaymentOrders.map(order => {
                    const pendingAmount = order.total - order.paid;
                    const paymentTable = order.paymentTableId ? 
                      paymentTables.find(pt => pt.id === order.paymentTableId) : null;
                    
                    return (
                      <Card key={order.id} className="border shadow-sm">
                        <CardContent className="p-6">
                          <div className="font-medium text-lg mb-1">{order.customerName}</div>
                          <div className="text-sm text-gray-600 mb-3">Pedido: {order.id}</div>
                          <div className="flex justify-between items-center">
                            <div>
                              <div className="text-sm text-gray-700">
                                Total: {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                              <div className="text-sm text-gray-700">
                                Pago: {order.paid.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                              <div className="text-sm font-semibold text-red-600 mt-1">
                                Pendente: {pendingAmount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                              </div>
                            </div>
                            <div className="flex gap-2">
                              {paymentTable && paymentTable.type === 'promissory_note' && (
                                <Button 
                                  size="sm" 
                                  className="bg-blue-600 hover:bg-blue-700 text-xs flex gap-1"
                                  onClick={() => handleViewPromissoryNote(order.id)}
                                >
                                  <FileText size={14} /> Promissória
                                </Button>
                              )}
                              <Dialog>
                                <DialogTrigger asChild>
                                  <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs flex gap-1">
                                    <Plus size={14} /> Pagar
                                  </Button>
                                </DialogTrigger>
                                <DialogContent className="sm:max-w-md">
                                  <DialogHeader>
                                    <DialogTitle>Registrar Pagamento</DialogTitle>
                                  </DialogHeader>
                                  <form>
                                    <div className="grid gap-4 py-4">
                                      <div className="space-y-2">
                                        <Label>Pedido</Label>
                                        <div className="p-2 border rounded-md bg-gray-50">
                                          {order.id} - {order.customerName}
                                        </div>
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`amount-${order.id}`}>Valor</Label>
                                        <Input
                                          id={`amount-${order.id}`}
                                          type="number"
                                          step="0.01"
                                          min="0.01"
                                          max={pendingAmount}
                                          defaultValue={pendingAmount.toFixed(2)}
                                        />
                                      </div>
                                      <div className="space-y-2">
                                        <Label htmlFor={`method-${order.id}`}>Método de Pagamento</Label>
                                        <Select defaultValue="cash">
                                          <SelectTrigger>
                                            <SelectValue placeholder="Selecione o método" />
                                          </SelectTrigger>
                                          <SelectContent>
                                            {paymentMethods.map(method => (
                                              <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                                            ))}
                                          </SelectContent>
                                        </Select>
                                      </div>
                                    </div>
                                    <div className="flex justify-end">
                                      <Button className="bg-sales-800 hover:bg-sales-700">
                                        Confirmar Pagamento
                                      </Button>
                                    </div>
                                  </form>
                                </DialogContent>
                              </Dialog>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    );
                  })}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card className="lg:col-span-2">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>Histórico de Pagamentos</CardTitle>
                  <CardDescription>Registro de todos os pagamentos</CardDescription>
                </div>
                <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="bg-sales-800 hover:bg-sales-700">
                      <Plus size={16} className="mr-2" /> Novo Pagamento
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Registrar Pagamento</DialogTitle>
                    </DialogHeader>
                    <form onSubmit={handleAddPayment}>
                      <div className="grid gap-4 py-4">
                        <div className="space-y-2">
                          <Label htmlFor="orderId">Pedido</Label>
                          <Select
                            value={formData.orderId}
                            onValueChange={(value) => handleSelectChange('orderId', value)}
                            required
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o pedido" />
                            </SelectTrigger>
                            <SelectContent>
                              {pendingPaymentOrders.map(order => (
                                <SelectItem key={order.id} value={order.id}>
                                  {order.id} - {order.customerName} - 
                                  {(order.total - order.paid).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="amount">Valor</Label>
                          <Input
                            id="amount"
                            name="amount"
                            type="number"
                            step="0.01"
                            min="0.01"
                            value={formData.amount}
                            onChange={handleInputChange}
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="method">Método de Pagamento</Label>
                          <Select
                            value={formData.method}
                            onValueChange={(value) => handleSelectChange('method', value)}
                          >
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione o método" />
                            </SelectTrigger>
                            <SelectContent>
                              {paymentMethods.map(method => (
                                <SelectItem key={method.value} value={method.value}>{method.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="date">Data de Pagamento</Label>
                          <div className="relative">
                            <Input
                              id="date"
                              name="date"
                              type="date"
                              value={formData.date}
                              onChange={handleInputChange}
                            />
                            <Calendar size={16} className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-500" />
                          </div>
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="notes">Observações</Label>
                          <Textarea
                            id="notes"
                            name="notes"
                            value={formData.notes}
                            onChange={handleInputChange}
                            rows={3}
                          />
                        </div>
                      </div>
                      <div className="flex justify-end gap-2">
                        <Button type="button" variant="outline" onClick={() => setIsAddDialogOpen(false)}>
                          Cancelar
                        </Button>
                        <Button type="submit" className="bg-sales-800 hover:bg-sales-700">
                          Registrar
                        </Button>
                      </div>
                    </form>
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
                      <TableHead>ID</TableHead>
                      <TableHead>Pedido</TableHead>
                      <TableHead>Data</TableHead>
                      <TableHead>Método</TableHead>
                      <TableHead>Valor</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredPayments.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                          Nenhum pagamento encontrado
                        </TableCell>
                      </TableRow>
                    ) : (
                      filteredPayments.map((payment) => {
                        const order = orders.find(o => o.id === payment.orderId);
                        return (
                          <TableRow key={payment.id}>
                            <TableCell className="font-medium">{payment.id}</TableCell>
                            <TableCell>
                              <div className="text-sm">
                                <div>{payment.orderId}</div>
                                <div className="text-xs text-gray-500">{order?.customerName}</div>
                              </div>
                            </TableCell>
                            <TableCell>{formatDateToBR(payment.date)}</TableCell>
                            <TableCell>{getMethodBadge(payment.method)}</TableCell>
                            <TableCell className="font-medium">
                              {payment.amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                            </TableCell>
                            <TableCell>
                              {payment.status === 'completed' ? 
                                <Badge className="bg-green-500">Confirmado</Badge> : 
                                <Badge variant="outline">Pendente</Badge>}
                            </TableCell>
                          </TableRow>
                        );
                      })
                    )}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="promissory">
          <Card>
            <CardHeader>
              <CardTitle>Notas Promissórias</CardTitle>
              <CardDescription>Visualização e impressão de notas promissórias</CardDescription>
            </CardHeader>
            <CardContent>
              {showPromissoryNote && selectedPaymentTable && selectedOrderId ? (
                <div className="mt-4">
                  <div className="mb-4">
                    <Button 
                      variant="outline" 
                      onClick={() => setShowPromissoryNote(false)}
                      className="mb-4"
                    >
                      Voltar para lista
                    </Button>
                  </div>
                  
                  {(() => {
                    const order = orders.find(o => o.id === selectedOrderId);
                    if (!order) return <div>Pedido não encontrado</div>;
                    
                    const customer = getOrderCustomer(order.customerId);
                    if (!customer) return <div>Cliente não encontrado</div>;
                    
                    return (
                      <PromissoryNoteView
                        customerId={customer.id}
                        customerName={customer.name}
                        paymentTable={selectedPaymentTable}
                        total={order.total}
                      />
                    );
                  })()}
                </div>
              ) : (
                <div>
                  <div className="mb-4">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
                      <Input
                        placeholder="Buscar por cliente ou pedido..."
                        className="pl-10"
                      />
                    </div>
                  </div>
                  
                  <div className="space-y-4">
                    {pendingPaymentOrders
                      .filter(order => {
                        const paymentTable = order.paymentTableId ? 
                          paymentTables.find(pt => pt.id === order.paymentTableId) : null;
                        return paymentTable && paymentTable.type === 'promissory_note';
                      })
                      .map(order => {
                        const pendingAmount = order.total - order.paid;
                        const paymentTable = order.paymentTableId ? 
                          paymentTables.find(pt => pt.id === order.paymentTableId) : null;
                        
                        if (!paymentTable) return null;
                        
                        return (
                          <Card key={order.id} className="border shadow-sm">
                            <CardContent className="p-6">
                              <div className="font-medium text-lg mb-1">{order.customerName}</div>
                              <div className="text-sm text-gray-600 mb-3">Pedido: {order.id}</div>
                              <div className="flex justify-between items-center">
                                <div>
                                  <div className="text-sm text-gray-700">
                                    Total: {order.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                                  </div>
                                  <div className="text-sm font-semibold text-blue-600 mt-1">
                                    Tabela: {paymentTable.name}
                                  </div>
                                </div>
                                <Button 
                                  className="bg-blue-600 hover:bg-blue-700 flex gap-1"
                                  onClick={() => handleViewPromissoryNote(order.id)}
                                >
                                  <FileText size={16} className="mr-1" /> Visualizar Promissória
                                </Button>
                              </div>
                            </CardContent>
                          </Card>
                        );
                      })}
                    
                    {pendingPaymentOrders.filter(order => {
                      const paymentTable = order.paymentTableId ? 
                        paymentTables.find(pt => pt.id === order.paymentTableId) : null;
                      return paymentTable && paymentTable.type === 'promissory_note';
                    }).length === 0 && (
                      <div className="text-center py-8 text-gray-500">
                        Não há pedidos com notas promissórias
                      </div>
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
