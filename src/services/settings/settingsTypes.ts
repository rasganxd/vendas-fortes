
import { AppSettings } from '@/types';

export interface SupabaseSettingsRow {
  id: string;
  company_name: string;
  company_logo?: string;
  company: any;
  primary_color: string;
  created_at: string;
  updated_at: string;
}

export interface DefaultCompanyData {
  name: string;
  address: string;
  phone: string;
  email: string;
  document: string;
  footer: string;
}

export interface DefaultSettingsData {
  company_name: string;
  company_logo: string;
  company: DefaultCompanyData;
  primary_color: string;
}
