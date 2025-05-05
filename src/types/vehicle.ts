
export interface Vehicle {
  id: string;
  name: string;
  type: "car" | "van" | "truck" | "motorcycle";
  licensePlate: string;
  model: string;
  capacity: number;
  active: boolean;
  status?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  driverName?: string; 
}
