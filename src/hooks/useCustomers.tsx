
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/services/supabase/customerService';
import { toast } from '@/components/ui/use-toast';

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadCustomers = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 [useCustomers] Starting to load customers...");
        
        const data = await customerService.getAll();
        console.log("✅ [useCustomers] Raw data from service:", data);
        console.log("📊 [useCustomers] Data length:", data?.length || 0);
        
        if (data && Array.isArray(data)) {
          console.log("✅ [useCustomers] Setting customers state with", data.length, "customers");
          setCustomers(data);
          
          // Log first customer for debugging
          if (data.length > 0) {
            console.log("👤 [useCustomers] First customer:", data[0]);
          }
        } else {
          console.warn("⚠️ [useCustomers] Invalid data format received:", typeof data);
          setCustomers([]);
        }
      } catch (error) {
        console.error('❌ [useCustomers] Error loading customers:', error);
        console.error('❌ [useCustomers] Error details:', {
          message: error instanceof Error ? error.message : 'Unknown error',
          stack: error instanceof Error ? error.stack : undefined
        });
        
        setCustomers([]);
        toast({
          title: "Erro ao carregar clientes",
          description: "Houve um problema ao carregar os clientes. Verifique o console para mais detalhes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
        console.log("🏁 [useCustomers] Loading completed");
      }
    };

    loadCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      console.log("🔄 [useCustomers] Starting customer creation...");
      console.log("📝 [useCustomers] Input customer data:", customer);
      console.log("📊 [useCustomers] Current customers count:", customers.length);
      
      // Validate required fields
      if (!customer.name || customer.name.trim() === '') {
        console.error("❌ [useCustomers] Validation failed: Name is required");
        toast({
          title: "Erro de validação",
          description: "Nome é obrigatório",
          variant: "destructive"
        });
        return "";
      }
      
      if (!customer.code) {
        console.error("❌ [useCustomers] Validation failed: Code is required");
        toast({
          title: "Erro de validação", 
          description: "Código é obrigatório",
          variant: "destructive"
        });
        return "";
      }
      
      // Check for duplicate code
      const existingWithSameCode = customers.find(c => c.code === customer.code);
      if (existingWithSameCode) {
        console.error("❌ [useCustomers] Validation failed: Code already exists");
        toast({
          title: "Erro de validação",
          description: `Código ${customer.code} já existe`,
          variant: "destructive"
        });
        return "";
      }
      
      // Prepare clean data for insertion
      const cleanCustomer: Omit<Customer, 'id'> = {
        code: typeof customer.code === 'string' ? parseInt(customer.code, 10) : customer.code,
        name: customer.name.trim(),
        phone: customer.phone || '',
        email: customer.email || '',
        address: customer.address || '',
        city: customer.city || '',
        state: customer.state || '',
        zip: customer.zip || '',
        document: customer.document || '',
        notes: customer.notes || '',
        visitDays: customer.visitDays || [],
        visitFrequency: customer.visitFrequency || '',
        visitSequence: customer.visitSequence || 0,
        salesRepId: customer.salesRepId || undefined,
        salesRepName: customer.salesRepName || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("📝 [useCustomers] Clean customer data:", cleanCustomer);
      
      console.log("🔄 [useCustomers] Calling customerService.add...");
      const id = await customerService.add(cleanCustomer);
      console.log("✅ [useCustomers] Customer added with ID:", id);
      
      if (!id || id === "") {
        throw new Error("Customer ID not returned from service");
      }
      
      // Create the new customer object for local state
      const newCustomer = { 
        ...cleanCustomer, 
        id
      } as Customer;
      
      // Update local state
      console.log("🔄 [useCustomers] Updating local state...");
      const updatedCustomers = [...customers, newCustomer];
      console.log("📊 [useCustomers] Updating local state with", updatedCustomers.length, "customers");
      setCustomers(updatedCustomers);
      
      console.log("🎉 [useCustomers] Customer creation completed successfully!");
      toast({
        title: "✅ Cliente adicionado",
        description: `${newCustomer.name} foi adicionado com sucesso!`
      });
      
      return id;
    } catch (error) {
      console.error("❌ [useCustomers] Error adding customer:", error);
      console.error("❌ [useCustomers] Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        customer: customer
      });
      toast({
        title: "❌ Erro ao adicionar cliente",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
      return "";
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      console.log("🔄 [useCustomers] Updating customer:", id, customer);
      
      // Ensure code is a number if present
      if (customer.code && typeof customer.code === 'string') {
        customer.code = parseInt(customer.code, 10);
      }
      
      // Ensure updatedAt is set
      const customerWithTimestamp = {
        ...customer,
        updatedAt: new Date()
      };
      
      await customerService.update(id, customerWithTimestamp);
      console.log("✅ [useCustomers] Customer updated in Supabase");
      
      // Update local state
      setCustomers(customers.map(c => c.id === id ? { ...c, ...customerWithTimestamp } : c));
      
      toast({
        title: "✅ Cliente atualizado",
        description: "Cliente atualizado com sucesso!"
      });
    } catch (error) {
      console.error("❌ [useCustomers] Error updating customer:", error);
      toast({
        title: "❌ Erro ao atualizar cliente",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      console.log("🗑️ [useCustomers] Deleting customer:", id);
      
      await customerService.delete(id);
      console.log("✅ [useCustomers] Customer deleted from Supabase");
      
      // Update local state
      setCustomers(customers.filter(c => c.id !== id));
      
      toast({
        title: "✅ Cliente excluído",
        description: "Cliente excluído com sucesso!"
      });
    } catch (error) {
      console.error("❌ [useCustomers] Error deleting customer:", error);
      toast({
        title: "❌ Erro ao excluir cliente",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const generateNextCustomerCode = async (): Promise<number> => {
    try {
      return await customerService.generateNextCode();
    } catch (error) {
      console.error('[useCustomers] Error generating customer code:', error);
      return customers.length > 0 ? Math.max(...customers.map(c => c.code || 0)) + 1 : 1;
    }
  };

  console.log("🔍 [useCustomers] Current state - customers:", customers.length, "loading:", isLoading);

  return {
    customers,
    isLoading,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  };
};

// Export function for backward compatibility
export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("🔄 [loadCustomers] Loading customers...");
    const result = await customerService.getAll();
    console.log("✅ [loadCustomers] Loaded", result?.length || 0, "customers");
    return result;
  } catch (error) {
    console.error('❌ [loadCustomers] Error loading customers:', error);
    return [];
  }
};
