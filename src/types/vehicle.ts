
export interface Vehicle {
  id: string;
  name: string;
  type: "car" | "van" | "truck" | "motorcycle";
  licensePlate: string;
  plateNumber: string;
  model: string;
  capacity: number;
  active: boolean;
  status?: string;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
  driverName?: string;
  brand?: string;
  year?: number;
}
