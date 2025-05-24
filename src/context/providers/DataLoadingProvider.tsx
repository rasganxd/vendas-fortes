
import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Customer, Product, ProductBrand, ProductCategory, ProductGroup, SalesRep, Vehicle, DeliveryRoute, Load, Order, Payment, PaymentMethod, PaymentTable } from '@/types';
import { loadCoreData } from '@/context/operations/dataLoading';

interface DataLoadingContextType {
  // Loading states
  isInitialLoading: boolean;
  isLoadingCustomers: boolean;
  isLoadingProducts: boolean;
  
  // Data
  customers: Customer[];
  products: Product[];
  productGroups: ProductGroup[];
  
  // Methods
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>;
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>;
  setProductGroups: React.Dispatch<React.SetStateAction<ProductGroup[]>>;
  generateNextCustomerCode: () => Promise<number>;
  
  // Core loading function
  loadData: () => Promise<void>;
}

const DataLoadingContext = createContext<DataLoadingContextType | undefined>(undefined);

export const useDataLoading = () => {
  const context = useContext(DataLoadingContext);
  if (context === undefined) {
    throw new Error('useDataLoading must be used within a DataLoadingProvider');
  }
  return context;
};

export const DataLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isLoadingCustomers, setIsLoadingCustomers] = useState(false);
  const [isLoadingProducts, setIsLoadingProducts] = useState(false);
  
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [productGroups, setProductGroups] = useState<ProductGroup[]>([]);

  const generateNextCustomerCode = async (): Promise<number> => {
    try {
      // Simple implementation - get max code and add 1
      const maxCode = customers.reduce((max, customer) => Math.max(max, customer.code || 0), 0);
      return maxCode + 1;
    } catch (error) {
      console.error('Error generating customer code:', error);
      return 1;
    }
  };

  const loadData = async () => {
    try {
      setIsInitialLoading(true);
      await loadCoreData(setIsLoadingCustomers, setCustomers, setIsLoadingProducts, setProducts);
    } catch (error) {
      console.error('Error loading core data:', error);
    } finally {
      setIsInitialLoading(false);
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  const value: DataLoadingContextType = {
    isInitialLoading,
    isLoadingCustomers,
    isLoadingProducts,
    customers,
    products,
    productGroups,
    setCustomers,
    setProducts,
    setProductGroups,
    generateNextCustomerCode,
    loadData,
  };

  return (
    <DataLoadingContext.Provider value={value}>
      {children}
    </DataLoadingContext.Provider>
  );
};
