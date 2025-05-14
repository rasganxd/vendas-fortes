
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
  sales_rep_id?: string;
  sales_rep_name?: string;
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
  sales_rep_id: string;
};
