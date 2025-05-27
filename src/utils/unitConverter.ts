
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
    
    // Se ambas têm a mesma unidade base, converter diretamente
    if (from.baseUnit === to.baseUnit) {
      const fromRate = from.conversionRate || 1;
      const toRate = to.conversionRate || 1;
      return (quantity * fromRate) / toRate;
    }
    
    // Se uma é base da outra
    if (from.baseUnit === toUnit) {
      return quantity * (from.conversionRate || 1);
    }
    
    if (to.baseUnit === fromUnit) {
      return quantity / (to.conversionRate || 1);
    }
    
    return quantity;
  }
  
  /**
   * Calcula o preço unitário baseado na unidade
   */
  calculateUnitPrice(totalPrice: number, quantity: number, unit: string, baseUnit: string): number {
    const unitData = this.units.find(u => u.value === unit);
    if (!unitData || unit === baseUnit) return totalPrice / quantity;
    
    const conversionRate = unitData.conversionRate || 1;
    return (totalPrice / conversionRate) / quantity;
  }
  
  /**
   * Obtém unidades relacionadas (mesma base)
   */
  getRelatedUnits(unit: string): Unit[] {
    const unitData = this.units.find(u => u.value === unit);
    if (!unitData) return [];
    
    const baseUnit = unitData.baseUnit || unit;
    return this.units.filter(u => u.baseUnit === baseUnit || u.value === baseUnit);
  }
}
