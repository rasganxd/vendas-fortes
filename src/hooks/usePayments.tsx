
import { useState, useEffect } from 'react';
import { Payment } from '@/types';
import { supabase } from '@/integrations/supabase/client';
import { toast } from '@/components/ui/use-toast';
import { Order } from '@/types/order'; // Added import for Order type

export const loadPayments = async (): Promise<Payment[]> => {
  try {
    console.log("Loading payments from Supabase");
    const { data, error } = await supabase
      .from('payments')
      .select('*')
      .order('date', { ascending: false });
      
    if (error) {
      throw error;
    }
    
    // Transform data to match Payment type
    return data.map(payment => ({
      id: payment.id,
      orderId: payment.order_id || '',
      date: new Date(payment.date),
      amount: payment.amount,
      method: payment.method || '',
      status: payment.status || 'pending',
      notes: payment.notes || '',
      createdAt: new Date(payment.created_at),
      updatedAt: new Date(payment.updated_at),
      dueDate: payment.due_date ? new Date(payment.due_date) : undefined,
      amountInWords: payment.amount_in_words || '',
      paymentLocation: payment.payment_location || '',
      emissionLocation: payment.emission_location || '',
      customerName: payment.customer_name || '',
      customerDocument: payment.customer_document || '',
      customerAddress: payment.customer_address || '',
      // Handle the paymentDate if it exists in the response
      paymentDate: payment.payment_date ? new Date(payment.payment_date) : undefined
    }));
  } catch (error) {
    console.error("Erro ao carregar pagamentos:", error);
    return [];
  }
};

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
        amount_in_words: payment.amountInWords || '',
        payment_date: payment.paymentDate ? payment.paymentDate.toISOString() : null,
        created_at: payment.createdAt.toISOString(),
        updated_at: payment.updatedAt.toISOString()
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
        amountInWords: newPaymentFromDb.amount_in_words,
        createdAt: new Date(newPaymentFromDb.created_at),
        updatedAt: new Date(newPaymentFromDb.updated_at)
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
  const updatePayment = async (id: string, payment: Partial<Payment>) => {
    try {
      // Transform Payment to match Supabase schema
      const supabaseData: Record<string, any> = {};
      
      if (payment.orderId !== undefined) supabaseData.order_id = payment.orderId;
      if (payment.date !== undefined) supabaseData.date = payment.date.toISOString();
      if (payment.amount !== undefined) supabaseData.amount = payment.amount;
      if (payment.method !== undefined) supabaseData.method = payment.method;
      if (payment.status !== undefined) supabaseData.status = payment.status;
      if (payment.notes !== undefined) supabaseData.notes = payment.notes;
      if (payment.dueDate !== undefined) supabaseData.due_date = payment.dueDate.toISOString();
      if (payment.amountInWords !== undefined) supabaseData.amount_in_words = payment.amountInWords;
      if (payment.paymentLocation !== undefined) supabaseData.payment_location = payment.paymentLocation;
      if (payment.emissionLocation !== undefined) supabaseData.emission_location = payment.emissionLocation;
      if (payment.customerName !== undefined) supabaseData.customer_name = payment.customerName;
      if (payment.customerDocument !== undefined) supabaseData.customer_document = payment.customerDocument;
      if (payment.customerAddress !== undefined) supabaseData.customer_address = payment.customerAddress;
      
      // Handle paymentDate specifically
      if (payment.paymentDate !== undefined) {
        supabaseData.payment_date = payment.paymentDate.toISOString();
      }
      
      // Update in Supabase
      const { error } = await supabase
        .from('payments')
        .update(supabaseData)
        .eq('id', id);
        
      if (error) {
        throw error;
      }
      
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
