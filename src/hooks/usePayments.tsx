import { useAppContext } from './useAppContext';
import { useOrders } from './useOrders';
import { toast } from '@/components/ui/use-toast';

export const usePayments = () => {
  const { orders, setOrders } = useAppContext();
  const { updateOrder } = useOrders();

  const calculateTotal = (orderId: string) => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return 0;

    return order.items.reduce((total, item) => total + ((item.unitPrice || 0) * (item.quantity || 0)), 0);
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
  };
};
