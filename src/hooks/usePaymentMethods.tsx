
import { useState } from 'react';
import { PaymentMethod } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const usePaymentMethods = () => {
  const currentDate = new Date();
  
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([
    { 
      id: '1', 
      name: 'Dinheiro', 
      description: 'Pagamento em espécie',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    },
    { 
      id: '2', 
      name: 'Cartão de Crédito', 
      description: 'Pagamento com cartão de crédito',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    },
    { 
      id: '3', 
      name: 'Cartão de Débito', 
      description: 'Pagamento com cartão de débito',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    },
    { 
      id: '4', 
      name: 'Transferência Bancária', 
      description: 'Transferência bancária ou PIX',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addPaymentMethod = async (method: Omit<PaymentMethod, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 9);
      const newMethod: PaymentMethod = { 
        ...method, 
        id: newId,
        notes: method.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setPaymentMethods([...paymentMethods, newMethod]);
      toast({
        title: "Método adicionado",
        description: "Método de pagamento adicionado com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar método:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar o método de pagamento.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updatePaymentMethod = async (id: string, method: Partial<PaymentMethod>) => {
    try {
      setPaymentMethods(
        paymentMethods.map(pm => (pm.id === id ? { 
          ...pm, 
          ...method,
          updatedAt: new Date()
        } : pm))
      );
      toast({
        title: "Método atualizado",
        description: "Método de pagamento atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar método:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar o método de pagamento.",
        variant: "destructive"
      });
    }
  };

  const deletePaymentMethod = async (id: string) => {
    try {
      setPaymentMethods(paymentMethods.filter(pm => pm.id !== id));
      toast({
        title: "Método excluído",
        description: "Método de pagamento excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir método:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o método de pagamento.",
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
