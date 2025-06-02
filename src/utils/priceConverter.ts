
export const calculateUnitPrice = (product: any, unit: string): number => {
  const basePrice = product.price || product.cost_price * 1.3;
  
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
  const cleanString = priceString.replace(/[^\d,.-]/g, '');
  const numberString = cleanString.replace(',', '.');
  return parseFloat(numberString) || 0;
};
