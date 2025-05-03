
export interface Vehicle {
  id: string;
  name: string;
  type: string;
  licensePlate: string;
  model: string;
  capacity: number;
  active: boolean;
  status?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  driverName?: string; // Add driverName property
}
