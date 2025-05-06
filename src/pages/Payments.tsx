
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
import { toast } from '@/components/ui/use-toast';
import { usePayments } from '@/hooks/usePayments';

export default function Payments() {
  const [activeTab, setActiveTab] = useState<string>('pending');
  const { orders, customers, payments } = useAppContext();
  const { paymentMethods } = usePaymentMethods();
  const { paymentTables } = usePaymentTables();
  const { addPayment } = usePayments();

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

  // Handle add payment
  const handleAddPayment = async (formData: any) => {
    try {
      const now = new Date();
      await addPayment({
        ...formData,
        createdAt: now,
        updatedAt: now
      });
      
      toast({
        title: "Pagamento registrado",
        description: "O pagamento foi registrado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao registrar pagamento:", error);
      toast({
        title: "Erro",
        description: "Houve um problema ao registrar o pagamento.",
        variant: "destructive"
      });
    }
  };

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
                paymentTables={paymentTables}
              />
            </TabsContent>
            
            <TabsContent value="history">
              <PaymentsHistoryTab 
                payments={payments}
                orders={orders}
                customers={customers}
                pendingPaymentOrders={pendingPaymentOrders}
                paymentMethods={paymentMethods.map(pm => ({ value: pm.id, label: pm.name }))}
                handleAddPayment={handleAddPayment}
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
