
import { Product } from '@/types';

// Função utilitária para calcular preço de unidade usando sistema unificado
export const calculateUnifiedUnitPrice = (
  product: Product, 
  targetUnit: string, 
  units: Array<{ value: string; packageQuantity: number; isMainUnit?: boolean }>
): number => {
  if (!product || !targetUnit || !units.length) {
    return product?.price || 0;
  }

  const targetUnitData = units.find(u => u.value === targetUnit);
  const mainUnitData = units.find(u => u.isMainUnit) || units[0];

  if (!targetUnitData || !mainUnitData) {
    console.log("⚠️ Dados de unidade não encontrados");
    return product.price;
  }

  if (targetUnitData.value === mainUnitData.value) {
    return product.price;
  }

  // Lógica unificada: preço_base / (package_quantity_principal / package_quantity_alvo)
  const conversionFactor = mainUnitData.packageQuantity / targetUnitData.packageQuantity;
  const calculatedPrice = product.price / conversionFactor;
  
  console.log(`💰 Cálculo unificado de preço:`, {
    product: product.name,
    basePrice: product.price,
    targetUnit,
    mainUnitPackage: mainUnitData.packageQuantity,
    targetUnitPackage: targetUnitData.packageQuantity,
    conversionFactor,
    calculatedPrice
  });

  return calculatedPrice;
};
