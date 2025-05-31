
export interface ProductUnit {
  id: string;
  value: string;
  label: string;
  packageQuantity: number;
}

export interface ProductUnitMapping {
  id: string;
  productId: string;
  unitId: string;
  isMainUnit: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductUnitWithMapping extends ProductUnit {
  isMainUnit: boolean;
}

export interface UnitConversionFactor {
  fromUnitId: string;
  toUnitId: string;
  factor: number;
}

// Nova estrutura simplificada para o formulário
export interface ProductUnitsFormData {
  primaryUnit: ProductUnit | null;
  secondaryUnits: ProductUnit[];
}

// Compatibilidade com o sistema antigo
export interface SelectedUnit {
  unitId: string;
  unitValue: string;
  unitLabel: string;
  packageQuantity: number;
  isMainUnit: boolean;
}

export interface ProductFormUnitsData {
  selectedUnits: SelectedUnit[];
  mainUnitId: string;
}
