
import React, { useState } from 'react';
import { Order, PaymentTable } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import { usePayments } from '@/hooks/usePayments';
import { useNavigate } from 'react-router-dom';

interface PaymentMethod {
  value: string;
  label: string;
}

interface PendingPaymentsTabProps {
  pendingPaymentOrders: Array<{
    id: string;
    customerName: string;
    customerId: string;
    total: number;
    paymentTableId: string | undefined;
    paid: number;
    paymentMethod?: string;
  }>;
  paymentTables: PaymentTable[];
  paymentMethods: PaymentMethod[];
}

const PendingPaymentsTab: React.FC<PendingPaymentsTabProps> = ({
  pendingPaymentOrders,
  paymentTables,
  paymentMethods
}) => {
  const { addPayment } = usePayments();
  const navigate = useNavigate();
  const [paymentDialogOpen, setPaymentDialogOpen] = useState<{ [key: string]: boolean }>({});
  const [paymentValues, setPaymentValues] = useState<{ [key: string]: { amount: number; method: string } }>({});

  React.useEffect(() => {
    const initialValues = {} as { [key: string]: { amount: number; method: string } };
    pendingPaymentOrders.forEach(order => {
      initialValues[order.id] = {
        amount: order.total - order.paid,
        method: order.paymentMethod || 'cash'
      };
    });
    setPaymentValues(initialValues);
  }, [pendingPaymentOrders]);

  const handleOpenPaymentDialog = (orderId: string) => {
    setPaymentDialogOpen(prev => ({ ...prev, [orderId]: true }));
  };

  const handleClosePaymentDialog = (orderId: string) => {
    setPaymentDialogOpen(prev => ({ ...prev, [orderId]: false }));
  };

  const handlePaymentChange = (orderId: string, field: 'amount' | 'method', value: any) => {
    setPaymentValues(prev => ({
      ...prev,
      [orderId]: {
        ...prev[orderId],
        [field]: field === 'amount' ? Number(value) : value
      }
    }));
  };

  const handleViewPromissoryNote = (orderId: string) => {
    navigate(`/pagamentos?tab=promissory&orderId=${orderId}`);
  };

  const handleSubmitPayment = async (orderId: string) => {
    const order = pendingPaymentOrders.find(o => o.id === orderId);
    if (!order) return;

    const paymentValue = paymentValues[orderId];
    if (!paymentValue) return;

    const { amount, method } = paymentValue;
    
    if (!amount || amount <= 0) {
      toast.error("Erro de validação", {
        description: "O valor do pagamento deve ser maior que zero."
      });
      return;
    }

    const pendingAmount = order.total - order.paid;
    if (amount > pendingAmount) {
      toast.error("Erro de validação", {
        description: "O valor do pagamento não pode exceder o valor pendente."
      });
      return;
    }

    const now = new Date();

    try {
      await addPayment({
        orderId: orderId,
        amount: amount,
        method: method as string,
        status: 'completed',
        date: now,
        notes: `Pagamento de ${amount.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}`,
        createdAt: now,
        updatedAt: now
      });

      handleClosePaymentDialog(orderId);
      // Toast notification removed from here as it's already in usePayments.tsx
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast.error("Erro", {
        description: "Houve um problema ao registrar o pagamento."
      });
    }
  };

  if (pendingPaymentOrders.length === 0) {
    return (
      <div className="text-center py-8 text-gray-500">
        Não há pagamentos pendentes
      </div>
    );
  }

  return (
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
                  <Dialog 
                    open={paymentDialogOpen[order.id]} 
                    onOpenChange={(open) => {
                      if (open) {
                        handleOpenPaymentDialog(order.id);
                      } else {
                        handleClosePaymentDialog(order.id);
                      }
                    }}
                  >
                    <DialogTrigger asChild>
                      <Button 
                        size="sm" 
                        className="bg-teal-600 hover:bg-teal-700 text-xs flex gap-1"
                        onClick={() => handleOpenPaymentDialog(order.id)}
                      >
                        <Plus size={14} /> Pagar
                      </Button>
                    </DialogTrigger>
                    <DialogContent className="sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Registrar Pagamento</DialogTitle>
                      </DialogHeader>
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
                            value={paymentValues[order.id]?.amount || pendingAmount}
                            onChange={(e) => handlePaymentChange(order.id, 'amount', e.target.value)}
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor={`method-${order.id}`}>Método de Pagamento</Label>
                          <Select 
                            value={paymentValues[order.id]?.method || 'cash'}
                            onValueChange={(value) => handlePaymentChange(order.id, 'method', value)}
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
                      </div>
                      <div className="flex justify-end">
                        <Button 
                          className="bg-sales-800 hover:bg-sales-700"
                          onClick={() => handleSubmitPayment(order.id)}
                        >
                          Confirmar Pagamento
                        </Button>
                      </div>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
};

export default PendingPaymentsTab;
