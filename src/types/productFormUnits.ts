
export interface SelectedUnit {
  unitId: string;
  unitValue: string;
  unitLabel: string;
  packageQuantity: number;
  isMainUnit: boolean;
}

export interface ProductFormUnitsData {
  selectedUnits: SelectedUnit[];
  mainUnitId: string | null;
}
