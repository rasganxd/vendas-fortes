
import { useState } from 'react';
import { Backup, DeliveryRoute } from '@/types';
import { useAppContext } from './useAppContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

export const useBackups = () => {
  const [backups, setBackups] = useState<Backup[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const { 
    customers, products, orders, payments,
    routes, loads, salesReps, vehicles,
    setCustomers, setProducts, setOrders, setPayments,
    setRoutes, setLoads, setSalesReps, setVehicles
  } = useAppContext();

  // Function to generate unique ID
  const generateId = () => {
    return uuidv4();
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
        routes: routes as unknown as DeliveryRoute[],
        loads,
        salesReps,
        vehicles
      }
    };
    
    setBackups([...backups, newBackup]);
    toast({
      title: "Backup criado",
      description: `Backup "${name}" criado com sucesso!`,
    });
    return id;
  };

  const restoreBackup = (id: string) => {
    const backup = backups.find(b => b.id === id);
    if (!backup) return false;
    
    // Restore data if it exists in the backup
    if (backup.data.customers) {
      setCustomers(backup.data.customers);
    }
    
    if (backup.data.products) {
      setProducts(backup.data.products);
    }
    
    if (backup.data.orders) {
      setOrders(backup.data.orders);
    }
    
    if (backup.data.payments) {
      setPayments(backup.data.payments);
    }
    
    if (backup.data.routes) {
      // Ensure the routes match the DeliveryRoute type
      const deliveryRoutes = backup.data.routes as unknown as DeliveryRoute[];
      setRoutes(deliveryRoutes);
    }
    
    if (backup.data.loads) {
      setLoads(backup.data.loads);
    }
    
    if (backup.data.salesReps) {
      setSalesReps(backup.data.salesReps);
    }
    
    if (backup.data.vehicles) {
      setVehicles(backup.data.vehicles);
    }
    
    toast({
      title: "Backup restaurado",
      description: `Backup "${backup.name}" restaurado com sucesso!`,
    });
    
    return true;
  };

  const deleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
    toast({
      title: "Backup excluído",
      description: "Backup excluído com sucesso!",
    });
    return true;
  };

  return {
    backups,
    isLoading,
    createBackup,
    restoreBackup,
    deleteBackup,
    setBackups
  };
};
