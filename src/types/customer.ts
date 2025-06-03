
export interface Customer {
  id: string;
  code: number;
  name: string; // This will be "Nome Fantasia"
  companyName?: string; // This will be "Razão Social"
  phone: string;
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
  salesRepId?: string; // Changed from sales_rep_id to camelCase
  deliveryRouteId?: string;
  salesRepName?: string;
  syncPending?: boolean; // Add this property to track sync status
  creditLimit?: number; // Added missing field
  paymentTerms?: string; // Added missing field
  region?: string; // Added missing field
  category?: string; // Added missing field
}

export type CustomerFormValues = {
  code: number;
  name: string; // This will be "Nome Fantasia"
  companyName: string; // This will be "Razão Social"
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
  createdAt: Date;
  updatedAt: Date;
  visitSequence: number;
  salesRepId: string; // Changed to camelCase
  creditLimit?: number; // Added missing field
  paymentTerms?: string; // Added missing field
  region?: string; // Added missing field
  category?: string; // Added missing field
};
