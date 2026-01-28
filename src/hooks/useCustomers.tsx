
import { useState, useEffect, useCallback } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase/customerService';
import { customerIpcService } from '@/services/customerIpcService';
import { toast } from '@/components/ui/use-toast';
import { useConnection } from '@/context/providers/ConnectionProvider';

// This determines if the app is running in Electron
const isElectron = !!(window as any).electronAPI?.isElectron;

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { isOnline } = useConnection();

  const loadAndSyncCustomers = useCallback(async () => {
    console.log("🔄 [useCustomers] Starting to load and sync customers...", { isElectron, isOnline });
    setIsLoading(true);
    try {
      if (isElectron) {
        console.log("💻 [useCustomers] Running in Electron. Attempting to load from SQLite first.");
        const localData = await customerIpcService.getAll();
        if (localData.length > 0) {
          console.log(`✅ [useCustomers] Loaded ${localData.length} customers from SQLite.`);
          setCustomers(localData);
        }

        if (isOnline) {
          console.log("☁️ [useCustomers] Online. Syncing with Supabase...");
          const supabaseData = await customerService.getAll();
          console.log(`✅ [useCustomers] Fetched ${supabaseData.length} customers from Supabase.`);
          
          await customerIpcService.setAll(supabaseData);
          setCustomers(supabaseData);
          console.log("💾 [useCustomers] Local DB synced with Supabase. UI updated.");
        } else {
          console.log("🔌 [useCustomers] Offline. Using local data.");
          if (localData.length === 0) {
            toast({ title: "Offline e sem dados locais", description: "Conecte-se à internet para baixar os dados dos clientes.", variant: "destructive" });
          }
        }
      } else { // Not in Electron (web browser)
        console.log("🌐 [useCustomers] Running in a web browser.");
        if (isOnline) {
          console.log("☁️ [useCustomers] Online. Fetching from Supabase...");
          const supabaseData = await customerService.getAll();
          setCustomers(supabaseData);
          console.log(`✅ [useCustomers] Loaded ${supabaseData.length} customers from Supabase.`);
        } else {
          console.log("🔌 [useCustomers] Offline. Cannot load data in web mode.");
          toast({ title: "Offline", description: "É preciso estar online para carregar os clientes.", variant: "destructive" });
          setCustomers([]);
        }
      }
    } catch (error) {
       console.error('❌ [useCustomers] Error loading customers:', error);
       toast({
          title: "Erro ao carregar clientes",
          description: "Ocorreu um erro ao carregar os dados dos clientes.",
          variant: "destructive"
        });
    } finally {
      setIsLoading(false);
      console.log("🏁 [useCustomers] Loading process finished.");
    }
  }, [isOnline]);

  useEffect(() => {
    loadAndSyncCustomers();
  }, [loadAndSyncCustomers]);

  const addCustomer = async (customer: Omit<Customer, 'id'>): Promise<string> => {
    console.log("🔄 [useCustomers] addCustomer called with:", customer);
    
    try {
      console.log("🔄 [useCustomers] Adding customer via Supabase...");
      const id = await customerService.add(customer);
      console.log("🔄 [useCustomers] customerService.add returned:", id);
      
      if (!id) {
        console.error("❌ [useCustomers] No ID returned from customerService.add");
        throw new Error("Failed to get ID from database");
      }
      
      // Creating a complete customer object to add to local state
      const newCustomer: Customer = { 
        ...customer, 
        id,
        createdAt: new Date(),
        updatedAt: new Date(),
        active: customer.active ?? true,
      };
      
      if (isElectron) {
        console.log("💾 [useCustomers] Adding new customer to SQLite...");
        await customerIpcService.add(newCustomer);
      }
      
      setCustomers(prev => [...prev, newCustomer].sort((a, b) => (a.name || '').localeCompare(b.name || '')));
      
      console.log("✅ [useCustomers] Customer added successfully:", newCustomer.name);
      toast({ title: "✅ Cliente adicionado", description: `${newCustomer.name} foi adicionado com sucesso!` });
      return id;
    } catch (error) {
      console.error("❌ [useCustomers] Error adding customer:", error);
      toast({ title: "❌ Erro ao adicionar cliente", description: error instanceof Error ? error.message : "Erro desconhecido", variant: "destructive" });
      throw error;
    }
  };

  const updateCustomer = async (id: string, customerUpdate: Partial<Customer>) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "É preciso estar online para atualizar clientes.", variant: "destructive" });
      return;
    }
    try {
      const customerWithTimestamp = { ...customerUpdate, updatedAt: new Date() };
      
      console.log("🔄 [useCustomers] Updating customer via Supabase...");
      await customerService.update(id, customerWithTimestamp);
      
      if (isElectron) {
        console.log("💾 [useCustomers] Updating customer in SQLite...");
        await customerIpcService.update(id, customerWithTimestamp);
      }

      setCustomers(prev => prev.map(c => c.id === id ? { ...c, ...customerWithTimestamp } : c));
      
      toast({ title: "✅ Cliente atualizado" });
    } catch (error) {
      console.error("❌ [useCustomers] Error updating customer:", error);
      toast({ title: "❌ Erro ao atualizar cliente", variant: "destructive" });
    }
  };

  const deleteCustomer = async (id: string) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "É preciso estar online para excluir clientes.", variant: "destructive" });
      return;
    }
    try {
      console.log("🗑️ [useCustomers] Deleting customer from Supabase...");
      await customerService.delete(id);

      if (isElectron) {
        console.log("🗑️ [useCustomers] Deleting customer from SQLite...");
        await customerIpcService.delete(id);
      }

      setCustomers(prev => prev.filter(c => c.id !== id));
      
      toast({ title: "✅ Cliente excluído" });
    } catch (error) {
      console.error("❌ [useCustomers] Error deleting customer:", error);
      toast({ title: "❌ Erro ao excluir cliente", variant: "destructive" });
    }
  };

  const generateNextCustomerCode = async (): Promise<number> => {
    if (isOnline) {
      try {
        return await customerService.generateNextCode();
      } catch (error) {
        console.error('[useCustomers] Error generating customer code from Supabase, using fallback:', error);
      }
    }
    if(isElectron) {
        return customerIpcService.getHighestCode().then(code => code + 1);
    }
    return Math.floor(Math.random() * 10000); // Fallback for web
  };

  return {
    customers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode,
    refreshCustomers: loadAndSyncCustomers
  };
};

export const loadCustomers = async (): Promise<Customer[]> => {
  if (!isElectron) return [];
  try {
    return await customerIpcService.getAll();
  } catch (error) {
    console.error('❌ [loadCustomers] Error loading customers from SQLite:', error);
    return [];
  }
};
