
import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/types';
import { toast } from '@/components/ui/use-toast';
import { paymentMethodService } from '@/services/supabase/paymentMethodService';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Load payment methods on initial render
  useEffect(() => {
    const fetchPaymentMethods = async () => {
      try {
        setIsLoading(true);
        const loadedMethods = await paymentMethodService.getAll();
        setPaymentMethods(loadedMethods);
      } catch (error) {
        console.error("Error loading payment methods:", error);
        toast({
          title: "Erro ao carregar métodos de pagamento",
          description: "Houve um problema ao carregar os métodos de pagamento.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPaymentMethods();
  }, []);

  // Add a new payment method
  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    try {
      const id = await paymentMethodService.add(method);
      
      const newMethod: PaymentMethod = {
        ...method,
        id,
        createdAt: method.createdAt || new Date(),
        updatedAt: method.updatedAt || new Date()
      };
      
      setPaymentMethods([...paymentMethods, newMethod]);
      
      toast({
        title: "Método de pagamento adicionado",
        description: "Método de pagamento adicionado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error("Erro ao adicionar método de pagamento:", error);
      toast({
        title: "Erro ao adicionar método de pagamento",
        description: "Houve um problema ao adicionar o método de pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  // Update an existing payment method
  const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
    try {
      await paymentMethodService.update(id, method);
      
      // Update local state
      setPaymentMethods(paymentMethods.map(pm => 
        pm.id === id ? { ...pm, ...method } : pm
      ));
      
      toast({
        title: "Método de pagamento atualizado",
        description: "Método de pagamento atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar método de pagamento:", error);
      toast({
        title: "Erro ao atualizar método de pagamento",
        description: "Houve um problema ao atualizar o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  // Delete a payment method
  const deletePaymentMethod = async (id: string): Promise<void> => {
    try {
      await paymentMethodService.delete(id);
      
      // Update local state
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
      
      toast({
        title: "Método de pagamento excluído",
        description: "Método de pagamento excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir método de pagamento:", error);
      toast({
        title: "Erro ao excluir método de pagamento",
        description: "Houve um problema ao excluir o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  return {
    paymentMethods,
    isLoading,
    addPaymentMethod,
    updatePaymentMethod,
    deletePaymentMethod,
    setPaymentMethods: setPaymentMethods
  };
};
