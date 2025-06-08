
import { useState } from 'react';
import { Product } from '@/types';
import { 
  addProduct as addProductOp, 
  updateProduct as updateProductOp, 
  deleteProduct as deleteProductOp,
  validateProductDiscount as validateProductDiscountOp,
  getMaximumDiscount as getMaximumDiscountOp,
  getMinimumEffectivePrice as getMinimumEffectivePriceOp,
  addBulkProducts as addBulkProductsOp
} from '@/context/operations/productOperations';

export const useProductOperations = (
  products: Product[],
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>,
  setIsUsingMockData: React.Dispatch<React.SetStateAction<boolean>>
) => {
  const [isProcessing, setIsProcessing] = useState(false);

  const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    setIsProcessing(true);
    try {
      const id = await addProductOp(product, products, setProducts);
      return id;
    } finally {
      setIsProcessing(false);
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>): Promise<void> => {
    setIsProcessing(true);
    try {
      await updateProductOp(id, product, products, setProducts);
    } finally {
      setIsProcessing(false);
    }
  };

  const deleteProduct = async (id: string): Promise<void> => {
    setIsProcessing(true);
    try {
      await deleteProductOp(id, products, setProducts);
    } finally {
      setIsProcessing(false);
    }
  };

  const validateProductDiscount = (productId: string, discountPercent: number): string | boolean => {
    return validateProductDiscountOp(productId, discountPercent, products);
  };

  const getMaximumDiscount = (productId: string): number => {
    return getMaximumDiscountOp(productId, products);
  };

  const getMinimumEffectivePrice = (productId: string): number => {
    return getMinimumEffectivePriceOp(productId, products);
  };

  const addBulkProducts = async (productsArray: Omit<Product, 'id'>[]): Promise<string[]> => {
    setIsProcessing(true);
    try {
      console.log(`🔄 [useProductOperations] Starting bulk import of ${productsArray.length} products...`);
      console.log(`📊 [useProductOperations] Current products count: ${products.length}`);
      
      // Create a progress updater function
      const progressUpdater = (progress: number) => {
        console.log(`📈 [useProductOperations] Bulk import progress: ${progress.toFixed(1)}%`);
      };
      
      // Call the bulk import operation with proper state management
      const result = await addBulkProductsOp(productsArray, products, setProducts, progressUpdater);
      
      console.log(`✅ [useProductOperations] Bulk import completed. Created ${result.length} products`);
      
      return result;
    } catch (error) {
      console.error('❌ [useProductOperations] Bulk import failed:', error);
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMaximumDiscount,
    getMinimumEffectivePrice,
    addBulkProducts,
    isProcessing
  };
};
