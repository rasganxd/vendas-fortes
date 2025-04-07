
import { Backup } from '@/types';
import { useAppContext } from './useAppContext';

export const useBackups = () => {
  const { 
    backups, setBackups,
    customers, products, orders, payments,
    routes, loads, salesReps
  } = useAppContext();

  // Função para gerar ID único
  const generateId = () => {
    return Math.random().toString(36).substring(2, 10);
  };

  const createBackup = (name: string, description?: string) => {
    const id = generateId();
    const newBackup: Backup = {
      id,
      name,
      description,
      date: new Date(),
      data: {
        customers,
        products,
        orders,
        payments,
        routes,
        loads,
        salesReps
      }
    };
    
    setBackups([...backups, newBackup]);
    return id;
  };

  const restoreBackup = (id: string) => {
    const backup = backups.find(b => b.id === id);
    if (!backup) return;
    
    const { 
      setCustomers, setProducts, setOrders, setPayments, 
      setRoutes, setLoads, setSalesReps 
    } = useAppContext();
    
    setCustomers(backup.data.customers || []);
    setProducts(backup.data.products || []);
    setOrders(backup.data.orders || []);
    setPayments(backup.data.payments || []);
    setRoutes(backup.data.routes || []);
    setLoads(backup.data.loads || []);
    setSalesReps(backup.data.salesReps || []);
  };

  const deleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
  };

  return {
    backups,
    createBackup,
    restoreBackup,
    deleteBackup
  };
};
