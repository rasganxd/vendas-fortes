
import { Product } from '@/types';

export interface PriceConversion {
  price: number;
  displayText: string;
}

/**
 * Converte o preço entre unidades de um produto
 * 
 * Conceitos:
 * - Unidade principal (mainUnit): embalagem maior (ex: caixa)
 * - Subunidade (subunit): unidade menor (ex: unidade individual)
 * - SubunitRatio: quantas subunidades cabem na unidade principal
 * 
 * Exemplo: Caixa (mainUnit) com 23 unidades (subunit) por R$ 69,00
 * - Preço da caixa: R$ 69,00
 * - Preço por unidade: R$ 69,00 ÷ 23 = R$ 3,00
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

  // Validações básicas
  if (!product.hasSubunit || !product.subunit || !product.subunitRatio) {
    return {
      price: originalPrice,
      displayText: ''
    };
  }

  const mainUnit = product.unit || 'UN';
  const subunit = product.subunit;
  const subunitRatio = product.subunitRatio;

  console.log('🔄 Convertendo preço:', {
    product: product.name,
    fromUnit,
    toUnit,
    originalPrice,
    mainUnit,
    subunit,
    subunitRatio
  });

  // Conversão de unidade principal (caixa) para subunidade (unidade)
  if (fromUnit === mainUnit && toUnit === subunit) {
    // Preço da unidade = preço da caixa ÷ quantidade de unidades na caixa
    const convertedPrice = originalPrice / subunitRatio;
    console.log(`💰 Convertendo ${mainUnit} → ${subunit}: R$ ${originalPrice} ÷ ${subunitRatio} = R$ ${convertedPrice.toFixed(2)}`);
    
    return {
      price: convertedPrice,
      displayText: `1 ${subunit} = R$ ${convertedPrice.toFixed(2).replace('.', ',')} (de uma ${mainUnit} com ${subunitRatio} ${subunit})`
    };
  }

  // Conversão de subunidade (unidade) para unidade principal (caixa)
  if (fromUnit === subunit && toUnit === mainUnit) {
    // Preço da caixa = preço da unidade × quantidade de unidades na caixa
    const convertedPrice = originalPrice * subunitRatio;
    console.log(`💰 Convertendo ${subunit} → ${mainUnit}: R$ ${originalPrice} × ${subunitRatio} = R$ ${convertedPrice.toFixed(2)}`);
    
    return {
      price: convertedPrice,
      displayText: `1 ${mainUnit} = R$ ${convertedPrice.toFixed(2).replace('.', ',')} (${subunitRatio} ${subunit} por ${mainUnit})`
    };
  }

  // Fallback - retorna preço original
  console.warn('⚠️ Conversão não reconhecida:', { fromUnit, toUnit, mainUnit, subunit });
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
 * Calcula o preço correto baseado na unidade selecionada
 * Esta é a função principal que deve ser usada nos componentes
 */
export function calculateUnitPrice(
  product: Product,
  selectedUnit: string
): number {
  if (!product.hasSubunit || !product.subunit || !product.subunitRatio) {
    return product.price;
  }

  const mainUnit = product.unit || 'UN';
  const subunit = product.subunit;
  const subunitRatio = product.subunitRatio;
  
  // Se a unidade selecionada é a subunidade, calcular o preço da subunidade
  if (selectedUnit === subunit) {
    // Preço da unidade = preço da caixa ÷ quantidade de unidades na caixa
    const unitPrice = product.price / subunitRatio;
    console.log(`💰 Preço da ${subunit}: R$ ${product.price} ÷ ${subunitRatio} = R$ ${unitPrice.toFixed(2)}`);
    return unitPrice;
  }
  
  // Se a unidade selecionada é a unidade principal, usar o preço do produto
  if (selectedUnit === mainUnit) {
    return product.price;
  }
  
  // Fallback
  return product.price;
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
