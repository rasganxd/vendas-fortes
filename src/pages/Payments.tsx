
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { usePayments } from '@/hooks/usePayments';
import PageLayout from '@/components/layout/PageLayout';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import PendingPaymentsTab from '@/components/payments/PendingPaymentsTab';
import PaymentsHistoryTab from '@/components/payments/PaymentsHistoryTab';
import PromissoryNotesTab from '@/components/payments/PromissoryNotesTab';
import { Button } from '@/components/ui/button';
import { Payment } from '@/types';
import { useSearchParams } from 'react-router-dom';
import PromissoryNoteView from '@/components/payments/PromissoryNoteView';

export default function Payments() {
  const { payments, orders, paymentTables, customers } = useAppContext();
  const { addPayment } = usePayments();
  const [searchParams] = useSearchParams();
  
  const tabFromParams = searchParams.get('tab');
  const orderIdFromParams = searchParams.get('orderId');
  
  const [activeTab, setActiveTab] = useState(tabFromParams || "pending");

  // Initialize with a default empty tab - don't show promissory note until explicitly requested
  const [showPromissoryNote, setShowPromissoryNote] = useState(false);
  const [promissoryNotePayment, setPromissoryNotePayment] = useState<Payment | null>(null);

  useEffect(() => {
    if (orderIdFromParams) {
      const order = orders.find(o => o.id === orderIdFromParams);
      if (order) {
        // Look for existing payment or create a temporary one for display
        const existingPayment = payments.find(p => p.orderId === orderIdFromParams && p.method === 'promissoria');
        
        if (existingPayment) {
          setPromissoryNotePayment(existingPayment);
          setShowPromissoryNote(true);
        } else {
          // Create a temporary payment object for display purposes
          const customer = customers.find(c => c.id === order.customerId);
          if (customer) {
            const now = new Date();
            const newPayment: Payment = {
              id: 'temp-' + Date.now(),
              orderId: order.id,
              date: now,
              dueDate: order.dueDate || now,
              amount: order.total,
              method: 'promissoria',
              notes: '',
              customerName: customer.name || order.customerName,
              customerDocument: customer.document,
              customerAddress: customer.address,
              createdAt: now,
              updatedAt: now
            };
            setPromissoryNotePayment(newPayment);
            setShowPromissoryNote(true);
          }
        }
      }
    }
  }, [orderIdFromParams, orders, payments, customers]);

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
    
  const handleAddPayment = (paymentData: Omit<Payment, 'id'>) => {
    return addPayment(paymentData);
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
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="history">
          <PaymentsHistoryTab
            payments={payments}
            orders={orders}
            customers={customers}
            pendingPaymentOrders={pendingPaymentOrders}
            paymentMethods={paymentMethods}
            handleAddPayment={handleAddPayment}
          />
        </TabsContent>
        
        <TabsContent value="promissory">
          <Card>
            <CardHeader>
              <CardTitle>Notas Promissórias</CardTitle>
              <CardDescription>Visualização e impressão de notas promissórias</CardDescription>
            </CardHeader>
            <CardContent>
              {showPromissoryNote && promissoryNotePayment ? (
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
                  
                  {/* Make sure we always pass a valid payment object */}
                  <PromissoryNoteView payment={promissoryNotePayment} />
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
