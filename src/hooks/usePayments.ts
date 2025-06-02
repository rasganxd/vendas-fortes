
import { useAppContext } from './useAppContext';

export const usePayments = () => {
  const { addPayment: addPaymentContext, updatePayment, deletePayment, payments } = useAppContext();

  const addPayment = async (paymentData: any) => {
    try {
      const id = await addPaymentContext(paymentData);
      return id;
    } catch (error) {
      console.error('Error adding payment:', error);
      throw error;
    }
  };

  return {
    payments,
    addPayment,
    updatePayment,
    deletePayment
  };
};
