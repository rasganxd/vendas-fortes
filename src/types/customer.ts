
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
  zipCode?: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
  document?: string;
  visitDays?: string[];
  visitFrequency?: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  visitSequence?: number;
}

export type CustomerFormValues = {
  code: number;
  name: string;
  document: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  notes: string;
  visitDays: string[];
  visitFrequency: 'weekly' | 'biweekly' | 'monthly' | 'quarterly';
  email: string;
  zip: string;
  createdAt: Date;
  updatedAt: Date;
  visitSequence: number;
};
