
export interface Unit {
  value: string;
  label: string;
  conversionRate?: number;
  baseUnit?: string;
  isBaseUnit?: boolean;
}

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  rate: number;
}
