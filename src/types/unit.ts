
export interface Unit {
  id: string;
  code: string;
  description: string;
  packaging?: string;
  value?: string; // Add value property for compatibility
  label?: string; // Add label property for compatibility
  packageQuantity?: number; // Add packageQuantity property for compatibility
  createdAt: Date;
  updatedAt: Date;
}
