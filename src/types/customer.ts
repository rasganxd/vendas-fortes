
export interface Customer {
  id: string;
  code: number;
  name: string;
  phone: string;
  email: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zipCode?: string; // Keep for backward compatibility, but prefer using zip
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  document?: string;
  visitDays?: string[];
  visitFrequency?: string;
  visitSequence?: number;
  sales_rep_id?: string; // Changed from salesRepId to match usage
  deliveryRouteId?: string;
  sales_rep_name?: string;
  syncPending?: boolean; // Add this property to track sync status
}

export type CustomerFormValues = {
  code: number;
  name: string;
  document: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zipCode?: string; // Keep for backward compatibility, but prefer using zip
  notes: string;
  visitDays: string[];
  visitFrequency: string;
  email: string;
  createdAt: Date;
  updatedAt: Date;
  visitSequence: number;
  sales_rep_id: string; // Changed from sales_rep_id to match interface
};
