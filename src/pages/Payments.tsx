
import React, { useState } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import PageLayout from '@/components/layout/PageLayout';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { CalendarClock, Receipt, Wallet } from 'lucide-react';
import PendingPaymentsTab from '@/components/payments/PendingPaymentsTab';
import PaymentsHistoryTab from '@/components/payments/PaymentsHistoryTab';
import PromissoryNotesTab from '@/components/payments/PromissoryNotesTab';
import { usePaymentMethods } from '@/hooks/usePaymentMethods';
import { usePaymentTables } from '@/hooks/usePaymentTables';

export default function Payments() {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { orders, customers, payments } = useAppContext();
  const { paymentMethods } = usePaymentMethods();
  const { paymentTables } = usePaymentTables();

  // Get pending payment orders (orders that have a balance due)
  const pendingPaymentOrders = orders
    .filter(order => {
      // Calculate paid amount for this order
      const paidAmount = payments
        .filter(payment => payment.orderId === order.id)
        .reduce((total, payment) => total + payment.amount, 0);

      // Return orders with balance due
      return paidAmount < order.total;
    })
    .map(order => {
      // Calculate how much is already paid
      const paid = payments
        .filter(payment => payment.orderId === order.id)
        .reduce((total, payment) => total + payment.amount, 0);

      return {
        id: order.id,
        customerName: order.customerName,
        customerId: order.customerId,
        total: order.total,
        paymentTableId: order.paymentTableId,
        paid,
        paymentMethod: order.paymentMethod
      };
    });

  return (
    <PageLayout title="Pagamentos">
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Gerenciar Pagamentos</CardTitle>
          <CardDescription>
            Registre pagamentos, visualize histórico e gere notas promissórias
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue={activeTab} onValueChange={setActiveTab}>
            <TabsList className="grid grid-cols-3 mb-8">
              <TabsTrigger value="pending">
                <Wallet className="mr-2 h-4 w-4" /> Pagamentos Pendentes
              </TabsTrigger>
              <TabsTrigger value="history">
                <CalendarClock className="mr-2 h-4 w-4" /> Histórico
              </TabsTrigger>
              <TabsTrigger value="promissory">
                <Receipt className="mr-2 h-4 w-4" /> Notas Promissórias
              </TabsTrigger>
            </TabsList>
            
            <TabsContent value="pending">
              <PendingPaymentsTab 
                pendingPaymentOrders={pendingPaymentOrders}
                paymentMethods={paymentMethods.map(pm => ({ value: pm.id, label: pm.name }))} 
              />
            </TabsContent>
            
            <TabsContent value="history">
              <PaymentsHistoryTab 
                payments={payments}
                orders={orders}
              />
            </TabsContent>
            
            <TabsContent value="promissory">
              <PromissoryNotesTab 
                pendingPaymentOrders={pendingPaymentOrders}
                paymentTables={paymentTables}
                customers={customers}
                orders={orders}
                payments={payments}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
