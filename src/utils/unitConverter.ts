
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
    
    // Conversão simples usando quantidade na embalagem
    const fromQuantity = from.packageQuantity || 1;
    const toQuantity = to.packageQuantity || 1;
    
    // Converter para unidade base e depois para unidade desejada
    return (quantity * fromQuantity) / toQuantity;
  }
  
  /**
   * Calcula o preço unitário baseado na unidade
   */
  calculateUnitPrice(totalPrice: number, quantity: number, unit: string, baseUnit: string): number {
    const unitData = this.units.find(u => u.value === unit);
    if (!unitData || unit === baseUnit) return totalPrice / quantity;
    
    const packageQuantity = unitData.packageQuantity || 1;
    return (totalPrice / packageQuantity) / quantity;
  }
  
  /**
   * Obtém unidades relacionadas (todas as unidades disponíveis)
   */
  getRelatedUnits(unit: string): Unit[] {
    return this.units;
  }
}
