
import { useState } from 'react';
import { Product } from '@/types';
import { 
  addProduct as addProductOp, 
  updateProduct as updateProductOp, 
  deleteProduct as deleteProductOp,
  validateProductDiscount as validateProductDiscountOp,
  getMinimumPrice as getMinimumPriceOp,
  addBulkProducts as addBulkProductsOp
} from '@/context/operations/productOperations';
import { toast } from '@/components/ui/use-toast';

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

  const validateProductDiscount = (productId: string, discountedPrice: number): string | boolean => {
    return validateProductDiscountOp(productId, discountedPrice, products);
  };

  const getMinimumPrice = (productId: string): number => {
    return getMinimumPriceOp(productId, products);
  };

  const addBulkProducts = async (productsArray: Omit<Product, 'id'>[]): Promise<string[]> => {
    setIsProcessing(true);
    try {
      return await addBulkProductsOp(productsArray, products, setProducts, setIsUsingMockData);
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice,
    addBulkProducts,
    isProcessing
  };
};
