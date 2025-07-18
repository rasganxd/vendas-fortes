
export interface Customer {
  id: string;
  code: number;
  name: string; // This will be "Nome Fantasia"
  companyName?: string; // This will be "Razão Social"
  phone: string;
  address: string;
  neighborhood?: string; // Novo campo para bairro
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
  visitSequences?: Record<string, number>; // New field for day-specific sequences
  salesRepId?: string; // Changed from sales_rep_id to camelCase
  deliveryRouteId?: string;
  salesRepName?: string;
  syncPending?: boolean; // Add this property to track sync status
  active?: boolean;
  email?: string; // Make email optional for backward compatibility
}

export type CustomerFormValues = {
  code: number;
  name: string; // This will be "Nome Fantasia"
  companyName: string; // This will be "Razão Social"
  document: string;
  phone: string;
  email?: string; // Add email field
  address: string;
  neighborhood?: string; // Novo campo para bairro
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
  visitSequences?: Record<string, number>; // New field for day-specific sequences
  salesRepId: string; // Changed to camelCase
};
