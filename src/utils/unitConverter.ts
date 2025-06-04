
import { Unit } from '@/types/unit';

export class UnitConverter {
  private units: Unit[] = [];
  
  constructor(units: Unit[]) {
    this.units = units;
  }
  
  /**
   * Converte quantidade de uma unidade para outra
   */
  convert(quantity: number, fromUnit: string, toUnit: string): number {
    if (fromUnit === toUnit) return quantity;
    
    const from = this.units.find(u => u.value === fromUnit);
    const to = this.units.find(u => u.value === toUnit);
    
    if (!from || !to) return quantity;
    
    // Conversão simples usando taxas de conversão
    const fromRate = from.conversionRate || 1;
    const toRate = to.conversionRate || 1;
    
    // Converter para unidade base e depois para unidade desejada
    return (quantity * fromRate) / toRate;
  }
  
  /**
   * Calcula o preço unitário baseado na unidade usando fórmula fracionada
   */
  calculateUnitPrice(totalPrice: number, quantity: number, unit: string, baseUnit: string): number {
    const from = this.units.find(u => u.value === baseUnit);
    const to = this.units.find(u => u.value === unit);

    if (!from || !to) return totalPrice / quantity;

    const mainQty = from.conversionRate || 1; // package_quantity da unidade base
    const subQty = to.conversionRate || 1;    // package_quantity da unidade destino

    const factor = mainQty / subQty;

    return (totalPrice / quantity) / factor;
  }
  
  /**
   * Obtém unidades relacionadas (todas as unidades disponíveis)
   */
  getRelatedUnits(unit: string): Unit[] {
    return this.units;
  }
}
