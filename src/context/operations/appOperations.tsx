
import { useState } from 'react';
import { Customer, Product, Order, Load, ProductGroup, SalesRep, Vehicle, Payment, PaymentMethod, PaymentTable, ProductCategory, ProductBrand, DeliveryRoute, AppSettings, Backup } from '@/types';
import { useAppData } from '../providers/AppDataProvider';
import { 
  addProduct, 
  updateProduct, 
  deleteProduct, 
  validateProductDiscount,
  getMinimumPrice,
  addBulkProducts
} from './productOperations';
import { startNewMonth, startNewDay } from './systemOperations';
import { useCustomers } from '@/hooks/useCustomers';
import { useBackups } from '@/hooks/useBackups';
import { useAppSettings } from '@/hooks/useAppSettings';

// Hook que fornece as operações da aplicação
export function useAppOperations() {
  const { 
    products, 
    setProducts,
    orders
  } = useAppData();
  
  // Use directly from hook (with destructuring to get the specific methods)
  const { 
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  } = useCustomers();
  
  // Hook de backups
  const {
    createBackup: createBackupFunc,
    restoreBackup,
    deleteBackup,
  } = useBackups();
  
  // Hook de configurações
  const { 
    updateSettings: updateSettingsFunc
  } = useAppSettings();
  
  // Operações de produto
  const productOperations = {
    addProduct: async (product: Omit<Product, 'id'>) => {
      console.log("Context: Adding product", product);
      const id = await addProduct(product, products, setProducts);
      console.log("Context: Product added with ID:", id);
      return id;
    },
    updateProduct: (id: string, product: Partial<Product>) => {
      console.log("Context: Updating product", id, product);
      return updateProduct(id, product, products, setProducts);
    },
    deleteProduct: (id: string) => {
      console.log("Context: Deleting product", id);
      return deleteProduct(id, products, setProducts);
    },
    validateProductDiscount: (productId: string, discountedPrice: number) => 
      validateProductDiscount(productId, discountedPrice, products),
    getMinimumPrice: (productId: string) => 
      getMinimumPrice(productId, products),
    addBulkProducts: (productsArray: Omit<Product, 'id'>[]) => {
      console.log("Context: Adding bulk products", productsArray.length);
      return addBulkProducts(productsArray, products, setProducts, () => {});
    }
  };
  
  // Operações de cliente
  const customerOperations = {
    addCustomer,
    updateCustomer,
    deleteCustomer,
    generateNextCustomerCode
  };
  
  // Funções auxiliares para wrapping de tipos
  const createBackup = async (name?: string): Promise<string> => {
    return await Promise.resolve(createBackupFunc(name));
  };

  const updateSettings = async (settings: Partial<any>): Promise<void> => {
    await updateSettingsFunc(settings);
  };
  
  // Operações do sistema
  const systemOperations = {
    updateSettings,
    createBackup,
    restoreBackup: async (id: string): Promise<boolean> => {
      try {
        await restoreBackup(id);
        return true;
      } catch (error) {
        console.error("Error in restoreBackup wrapper:", error);
        return false;
      }
    },
    deleteBackup: async (id: string): Promise<boolean> => {
      try {
        await deleteBackup(id);
        return true;
      } catch (error) {
        console.error("Error in deleteBackup wrapper:", error);
        return false;
      }
    },
    startNewMonth: async () => {
      return await startNewMonth();
    },
    startNewDay: async () => {
      return await startNewDay();
    }
  };
  
  return {
    productOperations,
    customerOperations,
    systemOperations
  };
}
