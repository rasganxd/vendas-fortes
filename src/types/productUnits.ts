
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
