
import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { validateProductDiscount } from '@/context/operations/productOperations';

interface UseProductSearchValidationProps {
  products: Product[];
}

export function useProductSearchValidation({ products }: UseProductSearchValidationProps) {
  const [priceValidationErrors, setPriceValidationErrors] = useState<Map<string, string>>(new Map());

  const validatePrice = useCallback((productId: string, price: number): boolean => {
    const validation = validateProductDiscount(productId, price, products);
    
    if (validation === true) {
      // Remove erro se existir
      setPriceValidationErrors(prev => {
        const newMap = new Map(prev);
        newMap.delete(productId);
        return newMap;
      });
      return true;
    } else {
      // Adiciona erro
      setPriceValidationErrors(prev => {
        const newMap = new Map(prev);
        newMap.set(productId, validation as string);
        return newMap;
      });
      return false;
    }
  }, [products]);

  const getPriceValidationError = useCallback((productId: string): string | undefined => {
    return priceValidationErrors.get(productId);
  }, [priceValidationErrors]);

  const isPriceValid = useCallback((productId: string): boolean => {
    return !priceValidationErrors.has(productId);
  }, [priceValidationErrors]);

  const clearValidationErrors = useCallback(() => {
    setPriceValidationErrors(new Map());
  }, []);

  return {
    validatePrice,
    getPriceValidationError,
    isPriceValid,
    clearValidationErrors
  };
}
