
import { ProductUnitWithMapping } from '@/types/productUnits';
import { productUnitsMappingService } from '@/services/supabase/productUnitsMapping';

export interface UnitPriceCalculation {
  unitId: string;
  unitValue: string;
  unitLabel: string;
  price: number;
  conversionFactor: number;
  isMainUnit: boolean;
}

export const unitConversionUtils = {
  // Calcular preços para todas as unidades de um produto
  async calculateAllUnitPrices(
    productUnits: ProductUnitWithMapping[],
    basePrice: number
  ): Promise<UnitPriceCalculation[]> {
    const mainUnit = productUnits.find(unit => unit.isMainUnit);
    if (!mainUnit) return [];

    const calculations: UnitPriceCalculation[] = [];

    for (const unit of productUnits) {
      let price = basePrice;
      let conversionFactor = 1;

      if (!unit.isMainUnit) {
        conversionFactor = await productUnitsMappingService.calculateConversionFactor(
          mainUnit.id,
          unit.id
        );
        price = basePrice / conversionFactor;
      }

      calculations.push({
        unitId: unit.id,
        unitValue: unit.value,
        unitLabel: unit.label,
        price,
        conversionFactor,
        isMainUnit: unit.isMainUnit
      });
    }

    return calculations;
  },

  // Converter preço de uma unidade para outra
  async convertPrice(
    fromUnitId: string,
    toUnitId: string,
    price: number
  ): Promise<number> {
    if (fromUnitId === toUnitId) return price;

    const conversionFactor = await productUnitsMappingService.calculateConversionFactor(
      fromUnitId,
      toUnitId
    );

    return price / conversionFactor;
  },

  // Formatar informação de conversão para exibição
  formatConversionInfo(
    fromUnit: ProductUnitWithMapping,
    toUnit: ProductUnitWithMapping,
    conversionFactor: number
  ): string {
    if (conversionFactor === 1) {
      return `1 ${fromUnit.value} = 1 ${toUnit.value}`;
    }

    if (conversionFactor > 1) {
      return `1 ${fromUnit.value} = ${conversionFactor} ${toUnit.value}`;
    } else {
      const inverse = 1 / conversionFactor;
      return `${inverse} ${fromUnit.value} = 1 ${toUnit.value}`;
    }
  }
};
