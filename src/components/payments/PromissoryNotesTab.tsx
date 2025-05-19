
import React, { useState, useEffect } from 'react';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '@/components/ui/select';
import { Button } from '@/components/ui/button';
import { Customer, PaymentTable } from '@/types';
import PromissoryNoteView from './PromissoryNoteView';

interface PromissoryNotesTabProps {
  pendingPaymentOrders: any[];
  paymentTables: PaymentTable[];
  customers: Customer[];
  orders: any[];
  payments: any[];
  highlightedOrderId?: string | null;
}

export default function PromissoryNotesTab({ 
  pendingPaymentOrders, 
  paymentTables, 
  customers, 
  orders, 
  payments, 
  highlightedOrderId 
}: PromissoryNotesTabProps) {
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);
  
  // Get only orders that use promissory note payment tables
  const promissoryOrders = orders.filter(order => {
    const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
    return paymentTable?.type === 'promissoria';
  });
  
  // Handle highlighted order from URL parameter
  useEffect(() => {
    if (highlightedOrderId) {
      setSelectedOrderId(highlightedOrderId);
      
      // Scroll the promissory note into view if it exists
      setTimeout(() => {
        const noteElement = document.getElementById(`promissory-note-${highlightedOrderId}`);
        if (noteElement) {
          noteElement.scrollIntoView({ behavior: 'smooth', block: 'center' });
          // Add a temporary highlight class
          noteElement.classList.add('highlight-note');
          
          // Remove the highlight class after animation
          setTimeout(() => {
            noteElement.classList.remove('highlight-note');
          }, 3000);
        }
      }, 300);
    }
  }, [highlightedOrderId, promissoryOrders]);
  
  // If no orders found
  if (promissoryOrders.length === 0) {
    return (
      <div className="p-6 text-center">
        <p className="text-gray-500">Nenhuma nota promissória encontrada.</p>
        <p className="text-sm text-gray-400 mt-2">
          Notas promissórias são geradas automaticamente quando pedidos são criados
          com tabelas de pagamento do tipo "Promissória".
        </p>
      </div>
    );
  }
  
  return (
    <div>
      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Selecionar Pedido</label>
        <Select
          value={selectedOrderId || ''}
          onValueChange={setSelectedOrderId}
        >
          <SelectTrigger className="w-full">
            <SelectValue placeholder="Selecione um pedido para ver a nota promissória" />
          </SelectTrigger>
          <SelectContent>
            {promissoryOrders.map(order => (
              <SelectItem key={order.id} value={order.id}>
                #{order.code || '---'} - {order.customerName} 
                ({new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(order.total)})
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      
      <div className="space-y-10">
        {promissoryOrders
          .filter(order => !selectedOrderId || order.id === selectedOrderId)
          .map(order => {
            const customer = customers.find(c => c.id === order.customerId) || null;
            const paymentTable = paymentTables.find(pt => pt.id === order.paymentTableId);
            
            return (
              <div 
                key={order.id} 
                id={`promissory-note-${order.id}`} 
                className="bg-white p-4 border rounded-md shadow transition-all"
              >
                <PromissoryNoteView
                  order={order}
                  customer={customer}
                  paymentTable={paymentTable}
                  payments={payments.filter(p => p.orderId === order.id)}
                />
              </div>
            );
          })}
      </div>
    </div>
  );
}
