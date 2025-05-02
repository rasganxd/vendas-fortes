
export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  role?: string; // Add as an optional field
  region?: string; // Add as an optional field
  active?: boolean; // Add as an optional field
}
