
import { useState, useEffect } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { mockCustomers } from '@/data/mock/customers';

export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    console.log("Loading customers from Firebase");
    const customers = await customerService.getAll();
    console.log("Loaded customers:", customers);
    
    if (customers && customers.length > 0) {
      return customers;
    } else {
      console.log("No customers found in Firebase, using mock data");
      return mockCustomers;
    }
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    console.log("Using mock customers data instead");
    return mockCustomers;
  }
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isUsingMockData, setIsUsingMockData] = useState(false);
  
  // Initialize customers when component mounts
  useEffect(() => {
    const fetchCustomers = async () => {
      try {
        setIsLoading(true);
        console.log("Fetching customers...");
        const loadedCustomers = await loadCustomers();
        console.log(`Fetched ${loadedCustomers.length} customers:`, loadedCustomers);
        
        // Check if we're using mock data
        setIsUsingMockData(loadedCustomers === mockCustomers);
        
        setCustomers(loadedCustomers);
      } catch (error) {
        console.error("Erro ao carregar clientes:", error);
        // Fallback to mock data
        setCustomers(mockCustomers);
        setIsUsingMockData(true);
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
      
      let id = "";
      
      // Try to add to Firebase first
      try {
        id = await customerService.add(customer);
        console.log("Customer added to Firebase with ID:", id);
      } catch (firebaseError) {
        console.error("Failed to add customer to Firebase:", firebaseError);
        
        // If Firebase fails, generate a local ID and mark as using mock data
        id = `local-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
        setIsUsingMockData(true);
        console.log("Generated local ID for customer:", id);
        
        // Store updated mock data in localStorage
        const updatedMockCustomers = [...mockCustomers, { ...customer, id }];
        localStorage.setItem('mockCustomers', JSON.stringify(updatedMockCustomers));
      }
      
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
      
      // Try Firebase first
      try {
        await customerService.update(id, customer);
        console.log("Customer updated in Firebase");
      } catch (firebaseError) {
        console.error("Failed to update customer in Firebase:", firebaseError);
        setIsUsingMockData(true);
        
        // If Firebase fails, update mock data in localStorage
        const updatedCustomers = customers.map(c => 
          c.id === id ? { ...c, ...customer } : c
        );
        localStorage.setItem('mockCustomers', JSON.stringify(updatedCustomers));
      }
      
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
      
      // Try Firebase first
      try {
        await customerService.delete(id);
        console.log("Customer deleted from Firebase");
      } catch (firebaseError) {
        console.error("Failed to delete customer from Firebase:", firebaseError);
        setIsUsingMockData(true);
        
        // If Firebase fails, update mock data in localStorage
        const remainingCustomers = customers.filter(c => c.id !== id);
        localStorage.setItem('mockCustomers', JSON.stringify(remainingCustomers));
      }
      
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
    setCustomers,
    isUsingMockData
  };
};
