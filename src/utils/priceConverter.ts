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
  originalPrice: number,
  units: Array<{ id: string; code: string; package_quantity?: number }>
): PriceConversion {
  if (fromUnit === toUnit) {
    return {
      price: originalPrice,
      displayText: ''
    };
  }

  const mainUnit = units.find(u => u.id === product.main_unit_id);
  const subUnit = units.find(u => u.id === product.sub_unit_id);

  if (!mainUnit || !subUnit || !mainUnit.package_quantity || mainUnit.package_quantity <= 0) {
    return {
      price: originalPrice,
      displayText: ''
    };
  }

  const conversionRate = mainUnit.package_quantity;

  // Conversão de unidade principal → subunidade
  if (fromUnit === mainUnit.code && toUnit === subUnit.code) {
    const convertedPrice = originalPrice / conversionRate;
    return {
      price: convertedPrice,
      displayText: `1 ${subUnit.code} = R$ ${convertedPrice.toFixed(2).replace('.', ',')} (taxa: ${conversionRate})`
    };
  }

  // Conversão de subunidade → unidade principal
  if (fromUnit === subUnit.code && toUnit === mainUnit.code) {
    const convertedPrice = originalPrice * conversionRate;
    return {
      price: convertedPrice,
      displayText: `1 ${mainUnit.code} = R$ ${convertedPrice.toFixed(2).replace('.', ',')} (taxa: ${conversionRate})`
    };
  }

  return {
    price: originalPrice,
    displayText: ''
  };
}

/**
 * Converte quantidade entre unidades
 */
export function calculateQuantityConversion(
  product: Product,
  quantity: number,
  fromUnit: string,
  toUnit: string,
  units: Array<{ id: string; code: string; package_quantity?: number }>
): string {
  if (fromUnit === toUnit || !product.sub_unit_id) return '';

  const mainUnit = units.find(u => u.id === product.main_unit_id);
  const subUnit = units.find(u => u.id === product.sub_unit_id);

  if (!mainUnit || !subUnit || !mainUnit.package_quantity || mainUnit.package_quantity <= 0) return '';

  const conversionRate = mainUnit.package_quantity;

  // Subunidade → principal
  if (fromUnit === subUnit.code && toUnit === mainUnit.code) {
    const convertedQty = quantity / conversionRate;
    return `${quantity} ${subUnit.code} = ${convertedQty.toFixed(3)} ${mainUnit.code}`;
  }

  // Principal → subunidade
  if (fromUnit === mainUnit.code && toUnit === subUnit.code) {
    const convertedQty = quantity * conversionRate;
    return `${quantity} ${mainUnit.code} = ${convertedQty} ${subUnit.code}`;
  }

  return '';
}

/**
 * Converte string de preço brasileiro para número
 */
export function parseBrazilianPrice(priceString: string): number {
  if (!priceString) return 0;
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
