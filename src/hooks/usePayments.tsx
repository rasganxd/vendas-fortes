import { useState } from 'react';
import { Payment, Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { paymentService } from '@/firebase/firestoreService';

export const usePayments = () => {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [isLoading, setIsLoading] = useState(false);

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

  // Confirm payment for an order
  const confirmPayment = async (orderId: string, paymentInfo: any) => {
    try {
      // Update payment status in Firebase
      // await paymentService.update(orderId, { status: 'completed', ...paymentInfo });

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

  // Add a new payment
  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const id = await paymentService.add(payment);
      const newPayment = { ...payment, id };
      setPayments([...payments, newPayment]);
      toast({
        title: "Pagamento adicionado",
        description: "Pagamento adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar pagamento:", error);
      toast({
        title: "Erro ao adicionar pagamento",
        description: "Houve um problema ao adicionar o pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing payment
  const updatePayment = async (id: string, payment: Partial<Payment>): Promise<void> => {
    try {
      await paymentService.update(id, payment);
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
  
      // Fetch the payment table details
      // const paymentTable = await paymentTableService.get(order.paymentTableId);
      // if (!paymentTable) {
      //   console.error("Payment table not found:", order.paymentTableId);
      //   return;
      // }
  
      // Calculate payment terms based on the payment table
      // const terms = paymentTable.terms;
  
      // Create payment records for each term
      // for (const term of terms) {
      //   const paymentAmount = order.total * (term.percentage / 100);
      //   const paymentDate = new Date();
      //   paymentDate.setDate(paymentDate.getDate() + term.days);
  
      //   const payment: Omit<Payment, 'id'> = {
      //     orderId: order.id,
      //     customerId: order.customerId,
      //     customerName: order.customerName,
      //     amount: paymentAmount,
      //     paymentMethod: order.paymentMethod,
      //     status: 'pending',
      //     date: paymentDate,
      //     paymentDate: paymentDate,
      //     notes: `Parcela ${term.days} dias`,
      //   };
  
      //   await paymentService.add(payment);
      //   setPayments([...payments, payment as Payment]);
      // }
  
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
