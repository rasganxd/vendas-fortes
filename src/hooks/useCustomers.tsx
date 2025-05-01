
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';

export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Loading customers from Firebase");
    const customers = await customerService.getAll();
    console.log("Loaded customers:", customers);
    return customers;
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    return [];
  }
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
  // Initialize customers when component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching customers...");
        const loadedCustomers = await loadCustomers();
        console.log(`Fetched ${loadedCustomers.length} customers:`, loadedCustomers);
        setCustomers(loadedCustomers);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchCustomers();
  }, []);
  
  // Function to generate next available code
  const generateNextCode = (): number => {
    if (customers.length === 0) return 1;
    
    // Find the highest existing code
    const highestCode = customers.reduce(
      (max, customer) => (customer.code && customer.code > max ? customer.code : max), 
      0
    );
    
    // Return the next code in sequence
    return highestCode + 1;
  };
  
  const addCustomer = async (customer: Omit<Customer, 'id'>) => {
    try {
      console.log("Adding customer:", customer);
      
      // If no code is provided, generate one
      if (!customer.code) {
        customer.code = generateNextCode();
      }
      
      // Add to Firebase with code
      const id = await customerService.add(customer);
      console.log("Customer added with ID:", id);
      
      const newCustomer = { ...customer, id } as Customer;
      
      // Update local state
      setCustomers(prev => [...prev, newCustomer]);
      toast({
        title: "Cliente adicionado",
        description: "Cliente adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar cliente:", error);
      toast({
        title: "Erro ao adicionar cliente",
        description: "Houve um problema ao adicionar o cliente.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateCustomer = async (id: string, customer: Partial<Customer>) => {
    try {
      console.log("Updating customer:", id, customer);
      
      // Update in Firebase
      await customerService.update(id, customer);
      
      // Update local state
      const updatedCustomers = customers.map(c => 
        c.id === id ? { ...c, ...customer } : c
      );
      setCustomers(updatedCustomers);
      toast({
        title: "Cliente atualizado",
        description: "Cliente atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar cliente:", error);
      toast({
        title: "Erro ao atualizar cliente",
        description: "Houve um problema ao atualizar o cliente.",
        variant: "destructive"
      });
    }
  };

  const deleteCustomer = async (id: string) => {
    try {
      console.log("Deleting customer:", id);
      
      // Delete from Firebase
      await customerService.delete(id);
      
      // Update local state
      setCustomers(customers.filter(c => c.id !== id));
      toast({
        title: "Cliente excluído",
        description: "Cliente excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao excluir cliente",
        description: "Houve um problema ao excluir o cliente.",
        variant: "destructive"
      });
    }
  };

  return {
    customers,
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCode,
    isLoading,
    setCustomers
  };
};
