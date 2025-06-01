
import { useState, useCallback, useEffect } from 'react';
import { Product } from '@/types';
import { useProductValidationFixed } from './useProductValidationFixed';

interface UseProductSearchValidationProps {
  products: Product[];
}

export function useProductSearchValidation({ products }: UseProductSearchValidationProps) {
  const [priceValidationErrors, setPriceValidationErrors] = useState<Map<string, string>>(new Map());
  
  const {
    validateProductPrice,
    validateProductDiscount,
    loadDiscountSettings,
    discountSettings
  } = useProductValidationFixed({ products });

  // Load discount settings when component mounts
  useEffect(() => {
    loadDiscountSettings();
  }, [loadDiscountSettings]);

  const validatePrice = useCallback(async (productId: string, price: number): Promise<boolean> => {
    // First validate basic price rules
    const basicValidation = validateProductPrice(productId, price);
    
    if (basicValidation !== true) {
      setPriceValidationErrors(prev => {
        const newMap = new Map(prev);
        newMap.set(productId, basicValidation as string);
        return newMap;
      });
      return false;
    }

    // Then validate discount rules
    const discountValidation = validateProductDiscount(productId, price);
    
    if (discountValidation === true) {
      // Remove error if valid
      setPriceValidationErrors(prev => {
        const newMap = new Map(prev);
        newMap.delete(productId);
        return newMap;
      });
      return true;
    } else {
      // Add error
      setPriceValidationErrors(prev => {
        const newMap = new Map(prev);
        newMap.set(productId, discountValidation as string);
        return newMap;
      });
      return false;
    }
  }, [validateProductPrice, validateProductDiscount]);

  const getPriceValidationError = useCallback((productId: string): string | undefined => {
    return priceValidationErrors.get(productId);
  }, [priceValidationErrors]);

  const isPriceValid = useCallback((productId: string): boolean => {
    return !priceValidationErrors.has(productId);
  }, [priceValidationErrors]);

  const clearValidationErrors = useCallback(() => {
    setPriceValidationErrors(new Map());
  }, []);

  const refreshDiscountSettings = useCallback(async () => {
    await loadDiscountSettings();
    // Clear errors to re-validate with new settings
    clearValidationErrors();
  }, [loadDiscountSettings, clearValidationErrors]);

  return {
    validatePrice,
    getPriceValidationError,
    isPriceValid,
    clearValidationErrors,
    refreshDiscountSettings,
    discountSettings
  };
}
