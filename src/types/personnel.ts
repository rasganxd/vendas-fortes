
export type SalesRepRole = 'sales' | 'manager' | 'admin' | 'driver';

export interface SalesRep {
  id: string;
  code?: number;
  name: string;
  email: string;
  phone: string;
  document: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  notes: string;
  role: SalesRepRole;
  region?: string;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
  visitDay?: string; // Day of the week for visits
}
