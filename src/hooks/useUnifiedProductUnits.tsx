
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { useProductUnitsMapping } from '@/hooks/useProductUnitsMapping';
import { ProductUnitWithMapping } from '@/types/productUnits';

interface UnifiedUnit {
  value: string;
  label: string;
  packageQuantity: number;
  isMainUnit?: boolean;
}

export const useUnifiedProductUnits = (product: Product | null) => {
  const [units, setUnits] = useState<UnifiedUnit[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  const {
    productUnits: mappedUnits,
    mainUnit,
    isLoading: loadingMapped
  } = useProductUnitsMapping(product?.id);

  useEffect(() => {
    if (!product) {
      setUnits([]);
      return;
    }

    setIsLoading(true);

    // Se o produto tem unidades mapeadas (novo sistema), usar elas
    if (mappedUnits && mappedUnits.length > 0) {
      console.log("📋 Usando novo sistema de unidades para produto:", product.name);
      const unifiedUnits: UnifiedUnit[] = mappedUnits.map(unit => ({
        value: unit.value,
        label: unit.label,
        packageQuantity: unit.packageQuantity,
        isMainUnit: unit.isMainUnit
      }));
      setUnits(unifiedUnits);
    } else {
      // Fallback para o sistema antigo
      console.log("📋 Usando sistema antigo de unidades para produto:", product.name);
      const legacyUnits: UnifiedUnit[] = [];
      
      // Adicionar unidade principal
      if (product.unit) {
        legacyUnits.push({
          value: product.unit,
          label: product.unit,
          packageQuantity: 1,
          isMainUnit: true
        });
      }
      
      // Adicionar subunidade se existir
      if (product.hasSubunit && product.subunit && product.subunitRatio) {
        legacyUnits.push({
          value: product.subunit,
          label: `${product.subunit} (R$ ${(product.price / product.subunitRatio).toFixed(2).replace('.', ',')})`,
          packageQuantity: product.subunitRatio,
          isMainUnit: false
        });
      }
      
      setUnits(legacyUnits);
    }

    setIsLoading(false);
  }, [product, mappedUnits, mainUnit]);

  const calculateUnitPrice = (basePrice: number, targetUnit: string): number => {
    if (!product || !targetUnit) return basePrice;

    const targetUnitData = units.find(u => u.value === targetUnit);
    const mainUnitData = units.find(u => u.isMainUnit) || units[0];

    if (!targetUnitData || !mainUnitData) {
      console.log("⚠️ Unidade não encontrada, retornando preço base");
      return basePrice;
    }

    if (targetUnitData.value === mainUnitData.value) {
      return basePrice;
    }

    // Calcular preço usando a lógica unificada
    const conversionFactor = mainUnitData.packageQuantity / targetUnitData.packageQuantity;
    const calculatedPrice = basePrice / conversionFactor;
    
    console.log(`💰 Cálculo de preço unificado:`, {
      product: product.name,
      basePrice,
      targetUnit,
      mainUnitPackage: mainUnitData.packageQuantity,
      targetUnitPackage: targetUnitData.packageQuantity,
      conversionFactor,
      calculatedPrice
    });

    return calculatedPrice;
  };

  return {
    units,
    isLoading: isLoading || loadingMapped,
    calculateUnitPrice,
    hasNewUnits: mappedUnits && mappedUnits.length > 0
  };
};
