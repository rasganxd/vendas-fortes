
export interface Customer {
  id: string;
  code?: number;
  name: string;
  email?: string;
  phone?: string;
  document?: string;
  company_name?: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  zipCode?: string; // Alias for compatibility
  region?: string;
  category?: string;
  payment_terms?: string;
  credit_limit?: number;
  notes?: string;
  active: boolean;
  sales_rep_id?: string;
  salesRepId?: string; // Alias for compatibility
  delivery_route_id?: string;
  visit_frequency?: string;
  visit_days?: string[];
  visit_sequence?: number;
  visitSequence?: number; // Alias for compatibility
  createdAt: Date;
  updatedAt: Date;
}

export interface CustomerFormValues {
  code: number;
  name: string;
  companyName: string;
  document: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  zipCode: string;
  notes: string;
  visitDays: string[];
  visitFrequency: string;
  visitSequence: number;
  email: string;
  salesRepId: string;
  createdAt: Date;
  updatedAt: Date;
  active: boolean;
}
