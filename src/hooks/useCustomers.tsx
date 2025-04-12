
import { useState } from 'react';
import { Customer } from '@/types';
import { customerService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';

export const loadCustomers = async (): Promise<Customer[]> => {
  try {
    return await customerService.getAll();
  } catch (error) {
    console.error("Erro ao carregar clientes:", error);
    return [];
  }
};

export const useCustomers = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  
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
      // If no code is provided, generate one
      if (!customer.code) {
        customer.code = generateNextCode();
      }
      
      // Add to Firebase with code
      const id = await customerService.add(customer);
      const newCustomer = { ...customer, id } as Customer;
      
      // Update local state
      setCustomers([...customers, newCustomer]);
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
