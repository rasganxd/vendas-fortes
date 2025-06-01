
import { Product } from '@/types';

export interface ProductValidationResult {
  isValid: boolean;
  error?: string;
}

export const validateProductData = (product: Partial<Product>): ProductValidationResult => {
  // Check required fields
  if (!product.name || product.name.trim() === '') {
    return { isValid: false, error: 'Nome do produto é obrigatório' };
  }

  if (!product.price || product.price <= 0) {
    return { isValid: false, error: 'Preço deve ser maior que zero' };
  }

  // Validate price against cost
  if (product.cost && product.price < product.cost) {
    return { 
      isValid: false, 
      error: `Preço (R$ ${product.price.toFixed(2)}) não pode ser menor que o custo (R$ ${product.cost.toFixed(2)})` 
    };
  }

  // Validate stock values
  if (product.stock !== undefined && product.stock < 0) {
    return { isValid: false, error: 'Estoque não pode ser negativo' };
  }

  if (product.minStock !== undefined && product.minStock < 0) {
    return { isValid: false, error: 'Estoque mínimo não pode ser negativo' };
  }

  return { isValid: true };
};

export const validatePriceChange = (
  currentPrice: number, 
  newPrice: number, 
  cost?: number
): ProductValidationResult => {
  if (newPrice <= 0) {
    return { isValid: false, error: 'Preço deve ser maior que zero' };
  }

  if (cost && newPrice < cost) {
    return { 
      isValid: false, 
      error: `Preço (R$ ${newPrice.toFixed(2)}) não pode ser menor que o custo (R$ ${cost.toFixed(2)})` 
    };
  }

  return { isValid: true };
};

export const calculatePriceMargin = (price: number, cost: number): number => {
  if (!cost || cost === 0) return 0;
  return ((price - cost) / cost) * 100;
};

export const suggestPrice = (cost: number, marginPercentage: number): number => {
  if (!cost || cost <= 0) return 0;
  return cost * (1 + marginPercentage / 100);
};
