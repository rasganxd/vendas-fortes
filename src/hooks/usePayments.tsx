
import { useAppContext } from './useAppContext';
import { useOrders } from './useOrders';
import { toast } from '@/components/ui/use-toast';
import { Payment } from '@/types';
import { paymentService } from '@/firebase/firestoreService';

export const loadPayments = async (): Promise<Payment[]> => {
  try {
    return await paymentService.getAll();
  } catch (error) {
    console.error("Erro ao carregar pagamentos:", error);
    return [];
  }
};

export const usePayments = () => {
  const { orders, setOrders, payments, setPayments } = useAppContext();
  const { updateOrder } = useOrders();

  const calculateTotal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;

    return order.items.reduce((total, item) => total + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
  };

  const addPayment = async (payment: Omit<Payment, 'id'>): Promise<string> => {
    try {
      const id = await paymentService.add(payment);
      const newPayment = { ...payment, id } as Payment;
      setPayments([...payments, newPayment]);
      
      // Update order payment status if necessary
      const order = orders.find(o => o.id === payment.orderId);
      if (order) {
        const totalPaid = [...payments, newPayment]
          .filter(p => p.orderId === payment.orderId && p.status === 'completed')
          .reduce((sum, p) => sum + p.amount, 0);
          
        let paymentStatus: 'pending' | 'partial' | 'paid' = 'pending';
        if (totalPaid >= order.total) {
          paymentStatus = 'paid';
        } else if (totalPaid > 0) {
          paymentStatus = 'partial';
        }
        
        await updateOrder(order.id, { paymentStatus });
      }
      
      toast({
        title: "Pagamento adicionado",
        description: "Pagamento registrado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar pagamento:", error);
      toast({
        title: "Erro ao registrar pagamento",
        description: "Houve um problema ao registrar o pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updatePayment = async (id: string, payment: Partial<Payment>): Promise<boolean> => {
    try {
      await paymentService.update(id, payment);
      setPayments(payments.map(p => p.id === id ? { ...p, ...payment } : p));
      
      toast({
        title: "Pagamento atualizado",
        description: "Pagamento atualizado com sucesso!"
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao atualizar pagamento:", error);
      toast({
        title: "Erro ao atualizar pagamento",
        description: "Houve um problema ao atualizar o pagamento.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const deletePayment = async (id: string): Promise<boolean> => {
    try {
      await paymentService.delete(id);
      setPayments(payments.filter(p => p.id !== id));
      
      toast({
        title: "Pagamento excluído",
        description: "Pagamento excluído com sucesso!"
      });
      
      return true;
    } catch (error) {
      console.error("Erro ao excluir pagamento:", error);
      toast({
        title: "Erro ao excluir pagamento",
        description: "Houve um problema ao excluir o pagamento.",
        variant: "destructive"
      });
      
      return false;
    }
  };

  const confirmPayment = async (orderId: string, paymentInfo: any) => {
    try {
      // Get the order to update
      const orderToUpdate = orders.find(o => o.id === orderId);
      
      if (!orderToUpdate) {
        throw new Error(`Order with ID ${orderId} not found`);
      }
      
      // Update the order payment status
      await updateOrder(orderId, { 
        paymentStatus: 'paid',
        paymentMethod: paymentInfo.paymentMethod || orderToUpdate.paymentMethod
      });
      
      toast({
        title: "Pagamento confirmado",
        description: "O pagamento foi confirmado com sucesso."
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

  return {
    calculateTotal,
    confirmPayment,
    addPayment,
    updatePayment,
    deletePayment
  };
};
