
import { Product } from '@/types';

export interface PriceConversion {
  price: number;
  displayText: string;
}

/**
 * Converte o preço entre unidades de um produto
 */
export function convertPriceBetweenUnits(
  product: Product,
  fromUnit: string,
  toUnit: string,
  originalPrice: number
): PriceConversion {
  // Se for a mesma unidade, não há conversão
  if (fromUnit === toUnit) {
    return {
      price: originalPrice,
      displayText: ''
    };
  }

  const mainUnit = product.unit || 'UN';
  const subunit = product.subunit;
  const subunitRatio = product.subunitRatio || 1;

  // Conversão de unidade principal para subunidade
  if (fromUnit === mainUnit && toUnit === subunit) {
    const convertedPrice = originalPrice / subunitRatio;
    return {
      price: convertedPrice,
      displayText: `1 ${subunit} = R$ ${convertedPrice.toFixed(2).replace('.', ',')} (${subunitRatio} ${subunit} por ${mainUnit})`
    };
  }

  // Conversão de subunidade para unidade principal
  if (fromUnit === subunit && toUnit === mainUnit) {
    const convertedPrice = originalPrice * subunitRatio;
    return {
      price: convertedPrice,
      displayText: `1 ${mainUnit} = R$ ${convertedPrice.toFixed(2).replace('.', ',')} (${subunitRatio} ${subunit} por ${mainUnit})`
    };
  }

  // Fallback - retorna preço original
  return {
    price: originalPrice,
    displayText: ''
  };
}

/**
 * Calcula a conversão de quantidade entre unidades
 */
export function calculateQuantityConversion(
  product: Product,
  quantity: number,
  fromUnit: string,
  toUnit: string
): string {
  if (fromUnit === toUnit || !product.hasSubunit) {
    return '';
  }

  const mainUnit = product.unit || 'UN';
  const subunit = product.subunit;
  const subunitRatio = product.subunitRatio || 1;

  // Conversão de subunidade para unidade principal
  if (fromUnit === subunit && toUnit === mainUnit) {
    const convertedQty = quantity / subunitRatio;
    return `${quantity} ${subunit} = ${convertedQty.toFixed(3)} ${mainUnit}`;
  }

  // Conversão de unidade principal para subunidade
  if (fromUnit === mainUnit && toUnit === subunit) {
    const convertedQty = quantity * subunitRatio;
    return `${quantity} ${mainUnit} = ${convertedQty} ${subunit}`;
  }

  return '';
}

/**
 * Converte string de preço brasileiro para número
 */
export function parseBrazilianPrice(priceString: string): number {
  if (!priceString) return 0;
  
  // Remove espaços e converte vírgula para ponto
  const cleanPrice = priceString.replace(/\s/g, '').replace(',', '.');
  const parsed = parseFloat(cleanPrice);
  
  return isNaN(parsed) ? 0 : parsed;
}

/**
 * Formata número para exibição de preço brasileiro
 */
export function formatBrazilianPrice(price: number): string {
  if (price === 0) return '';
  return price.toFixed(2).replace('.', ',');
}
