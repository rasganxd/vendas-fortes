
export interface Unit {
  id?: string;
  value: string;
  label: string;
  conversionRate: number;
}

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  rate: number;
}
