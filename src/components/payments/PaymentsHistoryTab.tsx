
import React, { useState } from 'react';
import { Payment, Order, Customer } from '@/types';
import { Search, Plus } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table';
import { formatDateToBR } from '@/lib/date-utils';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import PaymentForm from './PaymentForm';

interface PaymentsHistoryTabProps {
  payments: Payment[];
  orders: Order[];
  customers: Customer[];
  pendingPaymentOrders: Array<{
    id: string;
    customerName: string;
    customerId: string;
    total: number;
    paymentTableId: string | undefined;
    paid: number;
  }>;
  paymentMethods: Array<{ value: string; label: string }>;
  handleAddPayment: (formData: any) => void;
}

const PaymentsHistoryTab: React.FC<PaymentsHistoryTabProps> = ({
  payments,
  orders,
  customers,
  pendingPaymentOrders,
  paymentMethods,
  handleAddPayment
}) => {
  const [search, setSearch] = useState('');
  const [isAddDialogOpen, setIsAddDialogOpen] = useState(false);
  
  const filteredPayments = payments.filter(payment => {
    const order = orders.find(o => o.id === payment.orderId);
    const customer = order ? customers.find(c => c.id === order.customerId) : null;
    
    return (customer?.code?.toString().toLowerCase().includes(search.toLowerCase()) ||
            customer?.name.toLowerCase().includes(search.toLowerCase()) ||
            payment.id.toLowerCase().includes(search.toLowerCase()));
  });
  
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
      case 'promissoria':
        return <Badge className="bg-orange-500">Promissória</Badge>;
      default:
        return <Badge>{method}</Badge>;
    }
  };

  return (
    <>
      <div className="flex items-center justify-between mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
          <Input
            placeholder="Buscar por código ou nome do cliente..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isAddDialogOpen} onOpenChange={setIsAddDialogOpen}>
          <DialogTrigger asChild>
            <Button className="bg-sales-800 hover:bg-sales-700 ml-4">
              <Plus size={16} className="mr-2" /> Novo Pagamento
            </Button>
          </DialogTrigger>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Registrar Pagamento</DialogTitle>
            </DialogHeader>
            <PaymentForm 
              pendingPaymentOrders={pendingPaymentOrders}
              paymentMethods={paymentMethods}
              onSubmit={(values) => {
                handleAddPayment(values);
                setIsAddDialogOpen(false);
              }}
              onCancel={() => setIsAddDialogOpen(false)}
            />
          </DialogContent>
        </Dialog>
      </div>
      
      <div className="relative overflow-x-auto rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>ID</TableHead>
              <TableHead>Cliente</TableHead>
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
                const customer = order ? customers.find(c => c.id === order.customerId) : null;
                
                return (
                  <TableRow key={payment.id}>
                    <TableCell className="font-medium">{payment.id}</TableCell>
                    <TableCell>
                      <div className="text-sm">
                        <div>{customer?.code ? `${customer.code} - ` : ''}{customer?.name || 'Cliente não encontrado'}</div>
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
    </>
  );
};

export default PaymentsHistoryTab;

