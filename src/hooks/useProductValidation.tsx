
import { useState, useCallback } from 'react';
import { Product } from '@/types';
import { productDiscountService } from '@/services/supabase/productDiscountService';

interface UseProductValidationProps {
  products: Product[];
}

export function useProductValidation({ products }: UseProductValidationProps) {
  const [discountSettings, setDiscountSettings] = useState<Record<string, number>>({});
  const [isLoadingDiscounts, setIsLoadingDiscounts] = useState(false);

  const loadDiscountSettings = useCallback(async () => {
    setIsLoadingDiscounts(true);
    try {
      const settings = await productDiscountService.getAllDiscounts();
      setDiscountSettings(settings);
      return settings;
    } catch (error) {
      console.error('Erro ao carregar configurações de desconto:', error);
      return {};
    } finally {
      setIsLoadingDiscounts(false);
    }
  }, []);

  const validateProductPrice = useCallback((productId: string, price: number): string | boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return "Produto não encontrado";
    
    if (price <= 0) {
      return "O preço deve ser maior que zero";
    }

    // Check against cost
    if (product.cost && price < product.cost) {
      return `Preço não pode ser menor que o custo (R$ ${product.cost.toFixed(2)})`;
    }

    return true;
  }, [products]);

  const validateProductDiscount = useCallback(async (productId: string, discountedPrice: number): Promise<string | boolean> => {
    const product = products.find(p => p.id === productId);
    if (!product) return "Produto não encontrado";
    
    if (discountedPrice <= 0) {
      return "O preço com desconto deve ser maior que zero";
    }

    // Get current discount settings
    const maxDiscountPercentage = discountSettings[productId] || 0;
    
    if (maxDiscountPercentage > 0 && product.price) {
      const minAllowedPrice = product.price * (1 - maxDiscountPercentage / 100);
      
      if (discountedPrice < minAllowedPrice) {
        return `Preço muito baixo. Mínimo permitido: R$ ${minAllowedPrice.toFixed(2)} (desconto máximo: ${maxDiscountPercentage}%)`;
      }
    }

    return true;
  }, [products, discountSettings]);

  const getMaxDiscountPercentage = useCallback((productId: string): number => {
    return discountSettings[productId] || 0;
  }, [discountSettings]);

  const getMinimumPrice = useCallback((productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    const maxDiscount = discountSettings[productId] || 0;
    
    if (maxDiscount > 0 && product.price) {
      return product.price * (1 - maxDiscount / 100);
    }
    
    return product.cost || 0;
  }, [products, discountSettings]);

  return {
    validateProductPrice,
    validateProductDiscount,
    getMaxDiscountPercentage,
    getMinimumPrice,
    loadDiscountSettings,
    discountSettings,
    isLoadingDiscounts
  };
}
