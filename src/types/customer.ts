
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
}
