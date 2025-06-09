import { useState, useEffect } from 'react';
import { Payment } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { Order } from '@/types/order';
import { paymentService } from '@/services/supabase/paymentService';

export const loadPayments = async (): Promise<Payment[]> => {
  try {
    console.log("Loading payments from Supabase");
    const payments = await paymentService.getAll();
    console.log(`Loaded ${payments.length} payments from Supabase`);
    return payments;
  } catch (error) {
    console.error("Error loading payments:", error);
    return [];
  }
};

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load payments on initial render
  useEffect(() => {
    const fetchPayments = async () => {
      try {
        setIsLoading(true);
        const loadedPayments = await loadPayments();
        setPayments(loadedPayments);
      } catch (error) {
        console.error("Error loading payments:", error);
        toast({
          title: "Erro ao carregar pagamentos",
          description: "Houve um problema ao carregar os pagamentos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPayments();
  }, []);

  // Calculate total for an order
  const calculateTotal = (orderId: string) => {
    let total = 0;
    payments.forEach(payment => {
      if (payment.orderId === orderId) {
        total += payment.amount;
      }
    });
    return total;
  };

  // Add a new payment
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      console.log('💳 Adding payment to database:', {
        orderId: payment.orderId,
        amount: payment.amount,
        method: payment.method,
        status: payment.status,
        customerName: payment.customerName,
        dueDate: payment.dueDate,
        notes: payment.notes
      });

      // Validate required fields
      if (!payment.orderId) {
        throw new Error('Order ID is required');
      }
      if (!payment.amount || payment.amount <= 0) {
        throw new Error('Valid payment amount is required');
      }
      if (!payment.method) {
        throw new Error('Payment method is required');
      }
      if (!payment.customerName) {
        throw new Error('Customer name is required');
      }

      // Ensure all required fields are present with proper types
      const paymentData = {
        orderId: payment.orderId,
        amount: Number(payment.amount),
        method: String(payment.method),
        status: payment.status || 'completed',
        date: payment.date || new Date(),
        dueDate: payment.dueDate || new Date(),
        notes: payment.notes || '',
        customerName: String(payment.customerName),
        createdAt: payment.createdAt || new Date(),
        updatedAt: payment.updatedAt || new Date(),
        // Include additional fields that might be needed
        amountInWords: payment.amountInWords,
        paymentLocation: payment.paymentLocation,
        emissionLocation: payment.emissionLocation,
        customerDocument: payment.customerDocument,
        customerAddress: payment.customerAddress,
        installments: payment.installments,
        paymentDate: payment.paymentDate,
        salesRepId: payment.salesRepId,
        syncedToMobile: payment.syncedToMobile,
        lastSyncDate: payment.lastSyncDate
      };

      console.log('📝 Processed payment data for database:', paymentData);
      
      const id = await paymentService.add(paymentData);
      
      if (!id) {
        throw new Error('Failed to get payment ID from service');
      }
      
      console.log('✅ Payment added to database with ID:', id);
      
      const newPayment: Payment = {
        ...paymentData,
        id
      };
      
      setPayments(prevPayments => [...prevPayments, newPayment]);
      
      console.log('✅ Payment added to local state successfully');
      
      toast({
        title: "Pagamento adicionado",
        description: "Pagamento adicionado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("❌ Error adding payment:", error);
      toast({
        title: "Erro ao adicionar pagamento",
        description: error instanceof Error ? error.message : "Houve um problema ao adicionar o pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Confirm payment for an order
  const confirmPayment = async (orderId: string, paymentInfo: any) => {
    try {
      // Get payments for this order
      const orderPayments = payments.filter(p => p.orderId === orderId);
      
      // Update each payment's status
      for (const payment of orderPayments) {
        await paymentService.update(payment.id, {
          ...payment,
          status: 'completed',
          ...paymentInfo
        });
      }

      // Update local state
      setPayments(payments.map(payment =>
        payment.orderId === orderId ? { ...payment, status: 'completed', ...paymentInfo } : payment
      ));

      toast({
        title: "Pagamento confirmado",
        description: "O pagamento foi confirmado com sucesso!"
      });
      return true;
    } catch (error) {
      console.error("Erro ao confirmar pagamento:", error);
      toast({
        title: "Erro ao confirmar pagamento",
        description: "Houve um problema ao confirmar o pagamento.",
        variant: "destructive"
      });
      return false;
    }
  };

  // Update an existing payment
  const updatePayment = async (id: string, payment: Partial<Payment>) => {
    try {
      await paymentService.update(id, payment);
      
      // Update local state
      setPayments(payments.map(p => 
        p.id === id ? { ...p, ...payment } : p
      ));
      
      toast({
        title: "Pagamento atualizado",
        description: "Pagamento atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Houve um problema ao atualizar o pagamento.",
        variant: "destructive"
      });
    }
  };

  // Delete a payment
  const deletePayment = async (id: string): Promise<void> => {
    try {
      await paymentService.delete(id);
      
      // Update local state
      setPayments(payments.filter(p => p.id !== id));
      
      toast({
        title: "Pagamento excluído",
        description: "Pagamento excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error);
      toast({
        title: "Erro ao excluir pagamento",
        description: "Houve um problema ao excluir o pagamento.",
        variant: "destructive"
      });
    }
  };

  // Create an automatic payment record
  const createAutomaticPaymentRecord = async (order: Order) => {
    try {
      if (!order.paymentTableId) {
        console.warn("No payment table specified for order:", order.id);
        return;
      }
  
      // Get payment tables from context/supabase
      const tables = await loadPaymentTables();
      const paymentTable = tables.find(t => t.id === order.paymentTableId);
      
      if (!paymentTable) {
        console.error("Payment table not found:", order.paymentTableId);
        return;
      }
      
      // Create payment records for each term
      for (const term of paymentTable.terms || []) {
        const paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() + term.days);
        
        const paymentAmount = order.total * (term.percentage / 100);
        
        const payment = {
          orderId: order.id,
          customerName: order.customerName,
          amount: paymentAmount,
          method: order.paymentMethod,
          status: 'pending',
          date: new Date(),
          dueDate: paymentDate,
          notes: `Parcela ${term.installment} - ${term.days} dias`,
          createdAt: new Date(),
          updatedAt: new Date()
        };
        
        await addPayment(payment);
      }
  
      toast({
        title: "Pagamentos agendados",
        description: "Pagamentos agendados com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao criar pagamentos automáticos:", error);
      toast({
        title: "Erro ao agendar pagamentos",
        description: "Houve um problema ao agendar os pagamentos.",
        variant: "destructive"
      });
    }
  };

  return {
    payments,
    isLoading,
    setPayments,
    calculateTotal,
    confirmPayment,
    addPayment,
    updatePayment,
    deletePayment,
    createAutomaticPaymentRecord
  };
};

// Helper function to load payment tables
const loadPaymentTables = async () => {
  try {
    const { paymentTableService } = await import('@/services/supabase/paymentTableService');
    return await paymentTableService.getAll();
  } catch (error) {
    console.error("Error loading payment tables:", error);
    return [];
  }
};
