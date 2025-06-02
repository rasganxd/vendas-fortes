
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
      // Create a dummy progress updater function that matches the expected type
      const progressUpdater = (_progress: number) => {
        // We don't actually use this value, but it satisfies the type requirements
      };
      
      return await addBulkProductsOp(productsArray, products, setProducts, progressUpdater);
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
