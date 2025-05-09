
import { useState } from 'react';
import { Payment, Order } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';

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
      // Update payment status in Supabase
      const supabaseData = {
        status: 'completed',
        ...paymentInfo
      };
      
      const { error } = await supabase
        .from('payments')
        .update(supabaseData)
        .eq('order_id', orderId);
        
      if (error) throw error;

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
      // Transform payment to match Supabase schema
      const supabasePayment = {
        order_id: payment.orderId,
        customer_name: payment.customerName,
        customer_document: payment.customerDocument || '',
        customer_address: payment.customerAddress || '',
        amount: payment.amount,
        method: payment.method || '',
        status: payment.status || 'pending',
        date: payment.date.toISOString(),
        payment_location: payment.paymentLocation || '',
        emission_location: payment.emissionLocation || '',
        notes: payment.notes || '',
        due_date: payment.dueDate ? payment.dueDate.toISOString() : null,
        amount_in_words: payment.amountInWords || ''
      };
      
      const { data, error } = await supabase
        .from('payments')
        .insert(supabasePayment)
        .select();
        
      if (error) throw error;
      
      const newPaymentFromDb = data[0];
      
      // Transform back to Payment type
      const newPayment: Payment = {
        id: newPaymentFromDb.id,
        orderId: newPaymentFromDb.order_id,
        customerName: newPaymentFromDb.customer_name,
        customerDocument: newPaymentFromDb.customer_document,
        customerAddress: newPaymentFromDb.customer_address,
        amount: newPaymentFromDb.amount,
        method: newPaymentFromDb.method,
        status: newPaymentFromDb.status,
        date: new Date(newPaymentFromDb.date),
        paymentDate: newPaymentFromDb.payment_date ? new Date(newPaymentFromDb.payment_date) : undefined,
        paymentLocation: newPaymentFromDb.payment_location,
        emissionLocation: newPaymentFromDb.emission_location,
        notes: newPaymentFromDb.notes,
        dueDate: newPaymentFromDb.due_date ? new Date(newPaymentFromDb.due_date) : undefined,
        amountInWords: newPaymentFromDb.amount_in_words
      };
      
      setPayments([...payments, newPayment]);
      toast({
        title: "Pagamento adicionado",
        description: "Pagamento adicionado com sucesso!"
      });
      return newPayment.id;
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
      // Transform payment to match Supabase schema
      const supabasePayment: Record<string, any> = {};
      
      if (payment.orderId !== undefined) supabasePayment.order_id = payment.orderId;
      if (payment.customerName !== undefined) supabasePayment.customer_name = payment.customerName;
      if (payment.customerDocument !== undefined) supabasePayment.customer_document = payment.customerDocument;
      if (payment.customerAddress !== undefined) supabasePayment.customer_address = payment.customerAddress;
      if (payment.amount !== undefined) supabasePayment.amount = payment.amount;
      if (payment.method !== undefined) supabasePayment.method = payment.method;
      if (payment.status !== undefined) supabasePayment.status = payment.status;
      if (payment.date !== undefined) supabasePayment.date = payment.date.toISOString();
      if (payment.paymentDate !== undefined) supabasePayment.payment_date = payment.paymentDate.toISOString();
      if (payment.paymentLocation !== undefined) supabasePayment.payment_location = payment.paymentLocation;
      if (payment.emissionLocation !== undefined) supabasePayment.emission_location = payment.emissionLocation;
      if (payment.notes !== undefined) supabasePayment.notes = payment.notes;
      if (payment.dueDate !== undefined) supabasePayment.due_date = payment.dueDate.toISOString();
      if (payment.amountInWords !== undefined) supabasePayment.amount_in_words = payment.amountInWords;
      
      const { error } = await supabase
        .from('payments')
        .update(supabasePayment)
        .eq('id', id);
        
      if (error) throw error;
      
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
      const { error } = await supabase
        .from('payments')
        .delete()
        .eq('id', id);
        
      if (error) throw error;
      
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
      const { data: paymentTableData, error: tableError } = await supabase
        .from('payment_tables')
        .select('*')
        .eq('id', order.paymentTableId)
        .single();
        
      if (tableError) {
        console.error("Payment table not found:", order.paymentTableId, tableError);
        return;
      }
      
      // Fetch payment terms
      const { data: termsData, error: termsError } = await supabase
        .from('payment_table_terms')
        .select('*')
        .eq('payment_table_id', order.paymentTableId);
        
      if (termsError) {
        console.error("Error fetching payment terms:", termsError);
        return;
      }
      
      // Create payment records for each term
      for (const term of termsData) {
        const paymentDate = new Date();
        paymentDate.setDate(paymentDate.getDate() + term.days);
        
        const paymentAmount = order.total * (term.percentage / 100);
        
        const supabasePayment = {
          order_id: order.id,
          customer_name: order.customerName,
          amount: paymentAmount,
          method: order.paymentMethod,
          status: 'pending',
          date: new Date().toISOString(),
          due_date: paymentDate.toISOString(),
          notes: `Parcela ${term.installment} - ${term.days} dias`
        };
        
        const { error: insertError } = await supabase
          .from('payments')
          .insert(supabasePayment);
          
        if (insertError) {
          console.error("Error creating payment record:", insertError);
        }
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
