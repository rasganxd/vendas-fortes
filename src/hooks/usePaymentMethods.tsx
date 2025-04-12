
import { useState, useEffect } from 'react';
import { PaymentMethod } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const usePaymentMethods = () => {
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethod[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for payment methods
    const initialPaymentMethods: PaymentMethod[] = [
      { id: '1', name: 'Dinheiro', type: 'cash', active: true },
      { id: '2', name: 'Cartão de Crédito', type: 'credit', active: true, installments: true, maxInstallments: 12 },
      { id: '3', name: 'Cartão de Débito', type: 'debit', active: true },
      { id: '4', name: 'Transferência', type: 'bank_transfer', active: true },
      { id: '5', name: 'Cheque', type: 'check', active: true },
      { id: '6', name: 'Nota Promissória', type: 'other', active: true },
    ];
    
    setPaymentMethods(initialPaymentMethods);
    setIsLoading(false);
  }, []);

  const addPaymentMethod = async (paymentMethod: Omit<PaymentMethod, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 11);
      const newPaymentMethod = { ...paymentMethod, id: newId };
      setPaymentMethods([...paymentMethods, newPaymentMethod]);
      toast({
        title: "Método de pagamento adicionado",
        description: "Método de pagamento adicionado com sucesso!"
      });
      return newId;
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

  const updatePaymentMethod = async (id: string, paymentMethod: Partial<PaymentMethod>) => {
    try {
      setPaymentMethods(paymentMethods.map(pm => 
        pm.id === id ? { ...pm, ...paymentMethod } : pm
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

  const deletePaymentMethod = async (id: string) => {
    try {
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
    deletePaymentMethod
  };
};
