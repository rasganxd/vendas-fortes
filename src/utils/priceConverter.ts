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
export const calculateUnitPrice = (product: Product, selectedUnit: string): number => {
  console.log('🧮 Calculando preço da unidade:', {
    product: product.name,
    selectedUnit,
    originalPrice: product.price,
    hasSubunit: product.hasSubunit,
    mainUnit: product.unit,
    subunit: product.subunit,
    subunitRatio: product.subunitRatio
  });

  // Validação básica: se não há preço no produto, retornar 0
  if (!product.price || product.price === 0) {
    console.log('⚠️ Produto sem preço válido, retornando 0');
    return 0;
  }

  // Se não há unidade selecionada, usar unidade principal
  if (!selectedUnit) {
    console.log('📝 Sem unidade selecionada, usando preço original');
    return product.price;
  }

  // Se a unidade selecionada é a principal, retornar preço original
  if (selectedUnit === product.unit) {
    console.log('📝 Unidade principal selecionada, retornando preço original:', product.price);
    return product.price;
  }

  // Se o produto tem subunidade e a unidade selecionada é a subunidade
  if (product.hasSubunit && selectedUnit === product.subunit && product.subunitRatio) {
    // Validar subunitRatio para evitar divisão por zero
    if (product.subunitRatio <= 0) {
      console.log('⚠️ SubunitRatio inválido, usando preço original');
      return product.price;
    }
    
    const subunitPrice = product.price / product.subunitRatio;
    console.log('💰 Calculado preço da subunidade:', subunitPrice);
    return subunitPrice;
  }

  // Para outras unidades, verificar se há conversão necessária
  // Por enquanto, retornar o preço original
  console.log('📝 Unidade não reconhecida, retornando preço original:', product.price);
  return product.price;
};

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
