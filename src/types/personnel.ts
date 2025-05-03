
export interface SalesRep {
  id: string;
  name: string;
  email: string;
  phone: string;
  document: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  role?: string; // Optional field
  region?: string; // Optional field
  active?: boolean; // Optional field
  code?: number; // Add code property
}
