
import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { usePayments } from '@/hooks/usePayments';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPaymentsTab from '@/components/payments/PendingPaymentsTab';
import PaymentsHistoryTab from '@/components/payments/PaymentsHistoryTab';
import PromissoryNotesTab from '@/components/payments/PromissoryNotesTab';
import PromissoryNoteView from '@/components/payments/PromissoryNoteView';
import { Button } from '@/components/ui/button';
import { Payment, PaymentTable } from '@/types';

export default function Payments() {
  const { payments, orders, paymentTables, customers } = useAppContext();
  const { addPayment } = usePayments();
  const [activeTab, setActiveTab] = useState("pending");
  const [selectedPaymentTable, setSelectedPaymentTable] = useState<PaymentTable | null>(null);
  const [selectedOrderId, setSelectedOrderId] = useState<string>('');
  const [showPromissoryNote, setShowPromissoryNote] = useState(false);

  const paymentMethods = [
    { value: 'cash', label: 'Dinheiro' },
    { value: 'credit', label: 'Cartão de Crédito' },
    { value: 'debit', label: 'Cartão de Débito' },
    { value: 'transfer', label: 'Transferência' },
    { value: 'check', label: 'Cheque' },
    { value: 'promissoria', label: 'Nota Promissória' }
  ];

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
      paymentMethod: order.paymentMethod,
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

  const handleAddPayment = (paymentData: Omit<Payment, 'id'>) => {
    return addPayment(paymentData);
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
              <PendingPaymentsTab
                pendingPaymentOrders={pendingPaymentOrders}
                paymentTables={paymentTables}
                paymentMethods={paymentMethods}
                onViewPromissoryNote={handleViewPromissoryNote}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <Card>
            <CardHeader>
              <CardTitle>Histórico de Pagamentos</CardTitle>
              <CardDescription>Registro de todos os pagamentos</CardDescription>
            </CardHeader>
            <CardContent>
              <PaymentsHistoryTab 
                payments={payments}
                orders={orders}
                pendingPaymentOrders={pendingPaymentOrders}
                paymentMethods={paymentMethods}
                handleAddPayment={handleAddPayment}
              />
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
                <PromissoryNotesTab
                  pendingPaymentOrders={pendingPaymentOrders}
                  paymentTables={paymentTables}
                  customers={customers}
                  orders={orders}
                  payments={payments}
                />
              )}
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </PageLayout>
  );
}
