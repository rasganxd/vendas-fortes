
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
        console.log("=== LOADING CUSTOMERS ===");
        const data = await customerService.getAll();
        console.log("✅ Successfully loaded customers:", data?.length || 0, "items");
        setCustomers(data);
      } catch (error) {
        console.error('❌ Error loading customers:', error);
        toast({
          title: "Erro ao carregar clientes",
          description: "Houve um problema ao carregar os clientes.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadCustomers();
  }, []);

  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      console.log("=== ADDING NEW CUSTOMER ===");
      console.log("Input data:", customer);
      
      // Validate required fields
      if (!customer.name || customer.name.trim() === '') {
        console.error("❌ Validation failed: Name is required");
        toast({
          title: "Erro de validação",
          description: "Nome é obrigatório",
          variant: "destructive"
        });
        return "";
      }
      
      if (!customer.code) {
        console.error("❌ Validation failed: Code is required");
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
        console.error("❌ Validation failed: Code already exists");
        toast({
          title: "Erro de validação",
          description: `Código ${customer.code} já existe`,
          variant: "destructive"
        });
        return "";
      }
      
      // Prepare clean data for insertion with all required fields
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
        sales_rep_id: customer.sales_rep_id || undefined,
        sales_rep_name: customer.sales_rep_name || undefined,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      console.log("📝 Clean customer data for insertion:", cleanCustomer);
      console.log("🚀 Calling customerService.add...");
      
      const id = await customerService.add(cleanCustomer);
      console.log("✅ Customer added to Supabase with ID:", id);
      
      // Create the new customer object for local state
      const newCustomer = { 
        ...cleanCustomer, 
        id
      } as Customer;
      
      // Update local state
      const updatedCustomers = [...customers, newCustomer];
      console.log("📊 Updating local state with", updatedCustomers.length, "customers");
      setCustomers(updatedCustomers);
      
      toast({
        title: "✅ Cliente adicionado",
        description: `${newCustomer.name} foi adicionado com sucesso!`
      });
      
      console.log("=== CUSTOMER ADDITION COMPLETED SUCCESSFULLY ===");
      return id;
    } catch (error) {
      console.error("❌ CRITICAL ERROR adding customer:", error);
      console.error("Error details:", {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        customer
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
      console.log("=== UPDATING CUSTOMER ===");
      console.log("ID:", id, "Data:", customer);
      
      // Ensure code is a number if present
      if (customer.code && typeof customer.code === 'string') {
        customer.code = parseInt(customer.code, 10);
      }
      
      console.log("🚀 Calling customerService.update...");
      await customerService.update(id, customer);
      console.log("✅ Customer updated in Supabase");
      
      // Update local state
      setCustomers(customers.map(c => c.id === id ? { ...c, ...customer } : c));
      
      toast({
        title: "✅ Cliente atualizado",
        description: "Cliente atualizado com sucesso!"
      });
      
      console.log("=== CUSTOMER UPDATE COMPLETED ===");
    } catch (error) {
      console.error("❌ Error updating customer:", error);
      toast({
        title: "❌ Erro ao atualizar cliente",
        description: `Erro: ${error instanceof Error ? error.message : 'Erro desconhecido'}`,
        variant: "destructive"
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      console.log("=== DELETING CUSTOMER ===");
      console.log("ID:", id);
      
      console.log("🚀 Calling customerService.delete...");
      await customerService.delete(id);
      console.log("✅ Customer deleted from Supabase");
      
      // Update local state
      setCustomers(customers.filter(c => c.id !== id));
      
      toast({
        title: "✅ Cliente excluído",
        description: "Cliente excluído com sucesso!"
      });
      
      console.log("=== CUSTOMER DELETION COMPLETED ===");
    } catch (error) {
      console.error("❌ Error deleting customer:", error);
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
      console.error('Error generating customer code:', error);
      return customers.length > 0 ? Math.max(...customers.map(c => c.code || 0)) + 1 : 1;
    }
  };

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
    return await customerService.getAll();
  } catch (error) {
    console.error('Error loading customers:', error);
    return [];
  }
};
