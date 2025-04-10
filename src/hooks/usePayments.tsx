
import { Payment } from '@/types';
import { paymentService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';
import { useOrders } from './useOrders';

export const loadPayments = async (): Promise<Payment[]> => {
  try {
    return await paymentService.getAll();
  } catch (error) {
    console.error("Erro ao carregar pagamentos:", error);
    return [];
  }
};

export const usePayments = () => {
  const { payments, setPayments } = useAppContext();
  const { updateOrder } = useOrders();

  const addPayment = async (payment: Omit<Payment, 'id'>) => {
    try {
      const id = await paymentService.add(payment);
      const newPayment = { ...payment, id };
      setPayments([...payments, newPayment]);
      
      // Update order payment status
      const { orderId, amount } = payment;
      const relevantPayments = [...payments, newPayment]
        .filter(p => p.orderId === orderId && p.status === 'completed');
      
      const totalPaid = relevantPayments.reduce((sum, p) => sum + p.amount, 0);
      
      // Find order in context
      const order = await paymentService.getOrderById(orderId);
      if (order) {
        const newStatus = totalPaid >= order.total ? 'paid' : totalPaid > 0 ? 'partial' : 'pending';
        await updateOrder(orderId, { paymentStatus: newStatus });
      }
      
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
      throw error;
    }
  };

  const updatePayment = async (id: string, payment: Partial<Payment>) => {
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
      throw error;
    }
  };

  const deletePayment = async (id: string) => {
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
      throw error;
    }
  };
  
  const generatePromissoryNote = (paymentId: string, customerId: string, amount: number) => {
    const payment = payments.find(p => p.id === paymentId);
    if (!payment) {
      toast({
        title: "Erro",
        description: "Pagamento não encontrado",
        variant: "destructive"
      });
      return null;
    }
    
    // Here we would generate the actual promissory note document
    // In a real implementation, this might involve creating a PDF
    // or another document format
    
    return {
      paymentId,
      customerId,
      amount,
      date: new Date(),
      status: 'generated'
    };
  };

  return {
    payments,
    addPayment,
    updatePayment,
    deletePayment,
    generatePromissoryNote
  };
};
