
import React, { useState } from 'react';
import { Calendar } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

interface PaymentFormProps {
  pendingPaymentOrders: Array<{
    id: string;
    customerName: string;
    customerId: string;
    total: number;
    paymentTableId: string | undefined;
    paid: number;
  }>;
  paymentMethods: Array<{ value: string; label: string }>;
  onSubmit: (formData: any) => void;
  onCancel: () => void;
}

const PaymentForm: React.FC<PaymentFormProps> = ({
  pendingPaymentOrders,
  paymentMethods,
  onSubmit,
  onCancel
}) => {
  const [formData, setFormData] = useState({
    orderId: '',
    amount: 0,
    method: 'cash',
    status: 'completed',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

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

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  return (
    <form onSubmit={handleSubmit}>
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
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit" className="bg-sales-800 hover:bg-sales-700">
          Registrar
        </Button>
      </div>
    </form>
  );
};

export default PaymentForm;
