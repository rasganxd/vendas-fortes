
import { useState } from 'react';
import { Backup, DeliveryRoute } from '@/types';
import { useAppContext } from './useAppContext';
import { v4 as uuidv4 } from 'uuid';
import { toast } from '@/components/ui/use-toast';

// Define the BackupData interface for type safety
interface BackupData {
  customers: any[];
  products: any[];
  orders: any[];
  payments: any[];
  routes: any[];
  loads: any[];
  salesReps: any[];
  vehicles: any[];
}

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
    const backupData: BackupData = {
      customers,
      products,
      orders,
      payments,
      routes: routes as unknown as DeliveryRoute[],
      loads,
      salesReps,
      vehicles
    };
    
    const newBackup: Backup = {
      id,
      name,
      description: description || '',
      date: new Date(),  // Add the date property
      data: backupData,  // Add the data property
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Store the backup data in localStorage since we can't add it to the Backup type
    localStorage.setItem(`backup_${id}`, JSON.stringify(backupData));
    
    setBackups([...backups, newBackup]);
    toast({
      title: "Backup criado",
      description: `Backup "${name}" criado com sucesso!`,
    });
    return id;
  };

  const restoreBackup = (id: string): void => {
    const backup = backups.find(b => b.id === id);
    if (!backup) return;
    
    // Get backup data from localStorage
    const backupDataString = localStorage.getItem(`backup_${id}`);
    if (!backupDataString) {
      toast({
        title: "Erro ao restaurar",
        description: "Dados do backup não encontrados.",
        variant: "destructive"
      });
      return;
    }
    
    try {
      const backupData: BackupData = JSON.parse(backupDataString);
      
      // Restore data if it exists in the backup
      if (backupData.customers) {
        setCustomers(backupData.customers);
      }
      
      if (backupData.products) {
        setProducts(backupData.products);
      }
      
      if (backupData.orders) {
        setOrders(backupData.orders);
      }
      
      if (backupData.payments) {
        setPayments(backupData.payments);
      }
      
      if (backupData.routes) {
        // Ensure the routes match the DeliveryRoute type
        const deliveryRoutes = backupData.routes as unknown as DeliveryRoute[];
        setRoutes(deliveryRoutes);
      }
      
      if (backupData.loads) {
        setLoads(backupData.loads);
      }
      
      if (backupData.salesReps) {
        setSalesReps(backupData.salesReps);
      }
      
      if (backupData.vehicles) {
        setVehicles(backupData.vehicles);
      }
      
      toast({
        title: "Backup restaurado",
        description: `Backup "${backup.name}" restaurado com sucesso!`,
      });
    } catch (error) {
      console.error("Error restoring backup:", error);
      toast({
        title: "Erro ao restaurar",
        description: "Não foi possível restaurar o backup.",
        variant: "destructive"
      });
    }
  };

  const deleteBackup = (id: string): void => {
    // Remove backup data from localStorage
    localStorage.removeItem(`backup_${id}`);
    
    setBackups(backups.filter(b => b.id !== id));
    toast({
      title: "Backup excluído",
      description: "Backup excluído com sucesso!",
    });
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
