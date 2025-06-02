
import { Product } from '@/types';

export const validateProductDiscount = (
  productId: string,
  price: number,
  products: Product[]
): string | true => {
  const product = products.find(p => p.id === productId);
  
  if (!product) {
    return 'Produto não encontrado';
  }

  const costPrice = product.cost_price || 0;
  
  if (price < costPrice) {
    return `Preço não pode ser menor que o custo (R$ ${costPrice.toFixed(2)})`;
  }

  return true;
};

export const calculateUnitPrice = (product: Product, unit: string): number => {
  const basePrice = product.price || product.cost_price * 1.3;
  
  // If unit matches subunit and has ratio, calculate proportional price
  if (product.hasSubunit && product.subunit === unit && product.subunitRatio) {
    return basePrice / product.subunitRatio;
  }
  
  return basePrice;
};

export const formatBrazilianPrice = (price: number): string => {
  return price.toLocaleString('pt-BR', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2
  });
};

export const parseBrazilianPrice = (priceString: string): number => {
  // Remove non-numeric characters except comma and dot
  const cleanString = priceString.replace(/[^\d,.-]/g, '');
  
  // Replace comma with dot for parsing
  const numberString = cleanString.replace(',', '.');
  
  return parseFloat(numberString) || 0;
};
