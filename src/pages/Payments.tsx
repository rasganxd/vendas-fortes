
import React, { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { useSearchParams } from 'react-router-dom';
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
import { loadOrders } from '@/hooks/useOrders';

export default function Payments() {
  const [searchParams] = useSearchParams();
  const tabFromUrl = searchParams.get('tab');
  const orderIdFromUrl = searchParams.get('orderId');
  
  const [activeTab, setActiveTab] = useState<string>(tabFromUrl === 'promissory' ? 'promissory' : 'pending');
  
  const { customers } = useAppContext();
  const { paymentMethods } = usePaymentMethods();
  const { paymentTables } = usePaymentTables();
  const { payments, addPayment, isLoading } = usePayments();
  const [orders, setOrders] = useState([]);
  const [isLoadingOrders, setIsLoadingOrders] = useState(true);

  // Handle URL parameters for tab selection
  useEffect(() => {
    if (tabFromUrl) {
      // Map URL parameter values to tab values
      const tabValue = tabFromUrl === 'promissory' 
        ? 'promissory' 
        : tabFromUrl === 'history' 
          ? 'history' 
          : 'pending';
      
      setActiveTab(tabValue);
    }
  }, [tabFromUrl]);

  // Load orders
  useEffect(() => {
    const fetchOrders = async () => {
      try {
        setIsLoadingOrders(true);
        const loadedOrders = await loadOrders();
        setOrders(loadedOrders);
      } catch (error) {
        console.error("Error loading orders:", error);
      } finally {
        setIsLoadingOrders(false);
      }
    };

    fetchOrders();
  }, []);

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

  // Show loading state
  if (isLoading || isLoadingOrders) {
    return (
      <PageLayout title="Pagamentos">
        <div className="flex justify-center items-center h-96">
          <p>Carregando dados...</p>
        </div>
      </PageLayout>
    );
  }

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
          <Tabs value={activeTab} onValueChange={setActiveTab}>
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
                highlightedOrderId={orderIdFromUrl}
              />
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
    </PageLayout>
  );
}
