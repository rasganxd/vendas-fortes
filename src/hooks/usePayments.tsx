
import { Payment } from '@/types';
import { paymentService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

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
