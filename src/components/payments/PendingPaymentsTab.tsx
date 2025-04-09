
import React from 'react';
import { Order, PaymentTable } from '@/types';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { FileText, Plus } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
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
  }>;
  paymentTables: PaymentTable[];
  paymentMethods: PaymentMethod[];
  onViewPromissoryNote: (orderId: string) => void;
}

const PendingPaymentsTab: React.FC<PendingPaymentsTabProps> = ({
  pendingPaymentOrders,
  paymentTables,
  paymentMethods,
  onViewPromissoryNote
}) => {
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
                      onClick={() => onViewPromissoryNote(order.id)}
                    >
                      <FileText size={14} /> Promissória
                    </Button>
                  )}
                  <Dialog>
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
                    <Button size="sm" className="bg-teal-600 hover:bg-teal-700 text-xs flex gap-1">
                      <Plus size={14} /> Pagar
                    </Button>
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
