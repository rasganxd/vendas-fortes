
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
    if (!isElectron) {
        console.warn("Not in Electron. Skipping SQLite operations.");
        setIsLoading(false);
        return;
    }
    console.log("🔄 [useCustomers] Starting to load and sync customers...");
    setIsLoading(true);
    try {
      // 1. Load from SQLite for instant UI
      const localData = await customerIpcService.getAll();
      if (localData.length > 0) {
        console.log(`✅ [useCustomers] Loaded ${localData.length} customers from SQLite.`);
        setCustomers(localData);
      }

      // 2. If online, sync with Supabase
      if (isOnline) {
        console.log("☁️ [useCustomers] Online. Syncing with Supabase...");
        try {
          const supabaseData = await customerService.getAll();
          console.log(`✅ [useCustomers] Fetched ${supabaseData.length} customers from Supabase.`);
          await customerIpcService.setAll(supabaseData); // Overwrite local with remote source of truth
          setCustomers(supabaseData);
          console.log("💾 [useCustomers] SQLite has been updated with Supabase data.");
        } catch (e) {
          console.error("❌ [useCustomers] Failed to sync with Supabase, continuing with local data.", e);
          toast({
            title: "Falha na sincronização",
            description: "Não foi possível buscar os dados mais recentes. Usando dados locais.",
            variant: "destructive"
          });
        }
      } else {
        console.log("🔌 [useCustomers] Offline. Using local data only.");
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

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    if (!isOnline) {
      toast({ title: "Offline", description: "É preciso estar online para adicionar clientes.", variant: "destructive" });
      return "";
    }
    try {
      console.log("🔄 [useCustomers] Adding customer via Supabase...");
      const id = await customerService.add(customer);
      if (!id) throw new Error("Failed to get ID from Supabase");
      
      const newCustomer: Customer = { 
        ...customer, 
        id,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      if (isElectron) {
        console.log("💾 [useCustomers] Adding new customer to SQLite...");
        // We use setAll with the updated list to ensure consistency, though a dedicated `add` in IPC would also work.
        const updatedList = [...customers, newCustomer];
        await customerIpcService.setAll(updatedList);
      }
      
      setCustomers(prev => [...prev, newCustomer].sort((a, b) => a.name.localeCompare(b.name)));
      
      toast({ title: "✅ Cliente adicionado", description: `${newCustomer.name} foi adicionado.` });
      return id;
    } catch (error) {
      console.error("❌ [useCustomers] Error adding customer:", error);
      toast({ title: "❌ Erro ao adicionar cliente", variant: "destructive" });
      return "";
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
