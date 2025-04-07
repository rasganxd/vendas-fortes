
import { SalesRep } from '@/types';
import { useAppContext } from './useAppContext';

export const useSalesReps = () => {
  const { salesReps, setSalesReps } = useAppContext();

  // Função para gerar ID único
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const addSalesRep = (salesRep: Omit<SalesRep, 'id'>) => {
    const id = generateId();
    const newSalesRep = { ...salesRep, id };
    setSalesReps([...salesReps, newSalesRep]);
    return id;
  };

  const updateSalesRep = (id: string, salesRep: Partial<SalesRep>) => {
    setSalesReps(salesReps.map(s => 
      s.id === id ? { ...s, ...salesRep } : s
    ));
  };

  const deleteSalesRep = (id: string) => {
    setSalesReps(salesReps.filter(s => s.id !== id));
  };

  return {
    salesReps,
    addSalesRep,
    updateSalesRep,
    deleteSalesRep
  };
};
