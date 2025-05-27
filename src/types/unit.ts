
export interface Unit {
  value: string;
  label: string;
  conversionRate: number;
}

export interface UnitConversion {
  fromUnit: string;
  toUnit: string;
  rate: number;
}
