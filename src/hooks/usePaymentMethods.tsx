
import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    {
      id: '1',
      name: 'Dinheiro',
      type: 'cash',
      active: true
    },
    {
      id: '2',
      name: 'Cartão de Crédito',
      type: 'credit',
      active: true
    },
    {
      id: '3',
      name: 'Cartão de Débito',
      type: 'debit',
      active: true
    },
    {
      id: '4',
      name: 'Transferência',
      type: 'transfer',
      active: true
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 9);
      const newMethod = { ...method, id: newId };
      setPaymentMethods([...paymentMethods, newMethod]);
      toast({
        title: "Forma de pagamento adicionada",
        description: "Forma de pagamento adicionada com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar forma de pagamento:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a forma de pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
    try {
      setPaymentMethods(
        paymentMethods.map(pm => (pm.id === id ? { ...pm, ...method } : pm))
      );
      toast({
        title: "Forma de pagamento atualizada",
        description: "Forma de pagamento atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar forma de pagamento:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a forma de pagamento.",
        variant: "destructive"
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
      toast({
        title: "Forma de pagamento excluída",
        description: "Forma de pagamento excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir forma de pagamento:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a forma de pagamento.",
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
    setPaymentMethods
  };
};
