
import { Customer } from '@/types';

/**
 * Hook for generating customer codes
 */
export const useCustomerCodeGenerator = (customers: Customer[]) => {
  const generateNextCode = (): number => {
    if (customers.length === 0) return 1;
    
    const highestCode = customers.reduce(
      (max, customer) => (customer.code && customer.code > max ? customer.code : max), 
      0
    );
    
    return highestCode + 1;
  };

  return {
    generateNextCode,
    generateNextCustomerCode: generateNextCode // Alias for backward compatibility
  };
};
