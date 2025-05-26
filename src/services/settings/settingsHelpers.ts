
import { AppSettings } from '@/types';
import { DefaultCompanyData, DefaultSettingsData, SupabaseSettingsRow } from './settingsTypes';

/**
 * Creates fallback settings when database operations fail
 */
export const createFallbackSettings = (): AppSettings => {
  return {
    id: 'local-fallback',
    company: {
      name: 'Minha Empresa',
      address: '',
      phone: '',
      email: '',
      document: '',
      footer: ''
    },
    theme: {
      primaryColor: '#6B7280'
    }
  };
};

/**
 * Creates default company data
 */
export const createDefaultCompanyData = (): DefaultCompanyData => {
  return {
    name: 'Minha Empresa',
    address: '',
    phone: '',
    email: '',
    document: '',
    footer: ''
  };
};

/**
 * Creates default settings data for database insertion
 */
export const createDefaultSettingsData = (): DefaultSettingsData => {
  const defaultCompany = createDefaultCompanyData();
  
  return {
    company_name: 'Minha Empresa',
    company_logo: '',
    company: defaultCompany,
    primary_color: '#6B7280'
  };
};

/**
 * Converts Supabase row to AppSettings format
 */
export const convertRowToAppSettings = (data: SupabaseSettingsRow): AppSettings => {
  console.log('Converting row to AppSettings:', data);
  
  // Parse the company JSONB field safely
  let companyData;
  try {
    companyData = typeof data.company === 'string' 
      ? JSON.parse(data.company) 
      : data.company || {};
  } catch (e) {
    console.warn('Error parsing company data, using defaults:', e);
    companyData = {};
  }
  
  // Convert to AppSettings format
  return {
    id: data.id,
    company: {
      name: companyData.name || data.company_name || 'Minha Empresa',
      address: companyData.address || '',
      phone: companyData.phone || '',
      email: companyData.email || '',
      document: companyData.document || '',
      footer: companyData.footer || ''
    },
    theme: {
      primaryColor: data.primary_color || '#6B7280'
    }
  };
};

/**
 * Prepares update data for Supabase from partial AppSettings
 */
export const prepareUpdateData = (newSettings: Partial<AppSettings>): any => {
  const updateData: any = {};
  
  if (newSettings.company) {
    updateData.company = newSettings.company;
    updateData.company_name = newSettings.company.name;
    console.log('Updating company data:', newSettings.company);
  }
  
  if (newSettings.theme?.primaryColor) {
    updateData.primary_color = newSettings.theme.primaryColor;
    console.log('Updating theme color:', newSettings.theme.primaryColor);
  }
  
  return updateData;
};
