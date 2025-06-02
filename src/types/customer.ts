
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
  region?: string;
  category?: string;
  payment_terms?: string;
  credit_limit?: number;
  notes?: string;
  active: boolean;
  sales_rep_id?: string;
  delivery_route_id?: string;
  visit_frequency?: string;
  visit_days?: string[];
  visit_sequence?: number;
  createdAt: Date;
  updatedAt: Date;
}
