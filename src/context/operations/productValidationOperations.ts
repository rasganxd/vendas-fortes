
import { Product } from '@/types';

export const validateProductDiscount = (productId: string, discountedPrice: number, products: Product[]): string | boolean => {
  const product = products.find(p => p.id === productId);
  if (!product) return "Produto não encontrado";
  
  if (discountedPrice <= 0) {
    return "O preço com desconto deve ser maior que zero";
  }

  // Basic validation against cost
  if (product.cost && discountedPrice < product.cost) {
    return `Preço não pode ser menor que o custo (R$ ${product.cost.toFixed(2)})`;
  }

  // If no specific discount settings, allow any price above cost
  return true;
};

export const getProductMinimumPrice = (productId: string, products: Product[]): number => {
  const product = products.find(p => p.id === productId);
  if (!product) return 0;
  
  return product.cost || 0;
};

export const validateProductPrice = (productId: string, price: number, products: Product[]): string | boolean => {
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
};
