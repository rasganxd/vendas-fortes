
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
  address?: string; // Add address field
  city?: string; // Add city field
  state?: string; // Add state field
  zip?: string; // Add zip field
}
