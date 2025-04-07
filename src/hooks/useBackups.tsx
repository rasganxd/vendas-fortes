
import { useState } from 'react';
import { Backup } from '@/types';
import { useAppContext } from './useAppContext';
import { v4 as uuidv4 } from 'uuid';

export const useBackups = () => {
  const { 
    backups, setBackups,
    customers, products, orders, payments,
    routes, loads, salesReps, vehicles
  } = useAppContext();

  // Função para gerar ID único
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
        routes,
        loads,
        salesReps,
        vehicles
      }
    };
    
    setBackups([...backups, newBackup]);
    return id;
  };

  const restoreBackup = (id: string) => {
    const backup = backups.find(b => b.id === id);
    if (!backup) return false;
    
    const { 
      setCustomers, setProducts, setOrders, setPayments, 
      setRoutes, setLoads, setSalesReps, setVehicles 
    } = useAppContext();
    
    setCustomers(backup.data.customers || []);
    setProducts(backup.data.products || []);
    setOrders(backup.data.orders || []);
    setPayments(backup.data.payments || []);
    setRoutes(backup.data.routes || []);
    setLoads(backup.data.loads || []);
    setSalesReps(backup.data.salesReps || []);
    if (backup.data.vehicles) {
      setVehicles(backup.data.vehicles);
    }
    
    return true;
  };

  const deleteBackup = (id: string) => {
    setBackups(backups.filter(b => b.id !== id));
    return true;
  };

  return {
    backups,
    createBackup,
    restoreBackup,
    deleteBackup
  };
};
