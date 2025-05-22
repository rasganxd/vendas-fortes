
import { createContext, useContext } from 'react';

// Create a Context for DataLoading
interface DataLoadingContextType {
  customers: any[];
  products: any[];
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  isUsingMockData: boolean;
  setCustomers: React.Dispatch<React.SetStateAction<any[]>>;
  setProducts: React.Dispatch<React.SetStateAction<any[]>>;
  refreshData: () => Promise<boolean>; // Keep as boolean return type
  clearItemCache: (itemType: string) => Promise<boolean>;
  applyThemeColor?: (color: string) => void; // Add optional theme color function
}

export const DataLoadingContext = createContext<DataLoadingContextType | undefined>(undefined);

// Export the useDataLoading hook
export const useDataLoadingContext = () => {
  const context = useContext(DataLoadingContext);
  if (context === undefined) {
    throw new Error('useDataLoadingContext must be used within a DataLoadingProvider');
  }
  return context;
};
