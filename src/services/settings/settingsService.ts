
import { supabase } from '@/integrations/supabase/client';
import { AppSettings } from '@/types';

/**
 * Fetches settings from Supabase
 * @returns Promise<AppSettings | null>
 */
export const fetchSettingsFromSupabase = async (): Promise<AppSettings | null> => {
  try {
    console.log('Fetching settings from Supabase...');
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .maybeSingle();
    
    if (error) {
      console.error('Error fetching app settings:', error);
      return null;
    }
    
    if (data) {
      console.log('Settings found:', data);
      
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
    }
    
    console.log('No settings found in database');
    return null;
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
};

/**
 * Creates default settings if none exist
 * @returns Promise<AppSettings>
 */
export const createDefaultSettings = async (): Promise<AppSettings> => {
  try {
    console.log('Creating default settings...');
    const defaultCompany = {
      name: 'Minha Empresa',
      address: '',
      phone: '',
      email: '',
      document: '',
      footer: ''
    };
    
    const defaultSettings = {
      company_name: 'Minha Empresa',
      company_logo: '',
      company: defaultCompany,
      primary_color: '#6B7280'
    };
    
    console.log('Inserting default settings:', defaultSettings);
    
    // Save to Supabase
    const { data, error } = await supabase
      .from('app_settings')
      .insert(defaultSettings)
      .select()
      .single();
    
    if (error) {
      console.error('Error creating default settings:', error);
      throw error;
    }
    
    console.log('Default settings created:', data);
    
    return {
      id: data.id,
      company: defaultCompany,
      theme: {
        primaryColor: '#6B7280'
      }
    };
  } catch (error) {
    console.error('Error creating default settings:', error);
    // Return the default settings anyway so the app can continue
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
  }
};

/**
 * Updates settings in Supabase
 * @param currentSettings - Current settings object
 * @param newSettings - Partial settings to update
 * @returns Promise<boolean>
 */
export const updateSettingsInSupabase = async (
  currentSettings: AppSettings | null, 
  newSettings: Partial<AppSettings>
): Promise<boolean> => {
  try {
    console.log('updateSettingsInSupabase called with:', { currentSettings, newSettings });
    
    // If no current settings or using fallback, fetch/create real settings first
    let settingsId = currentSettings?.id;
    
    if (!settingsId || settingsId === 'local-fallback') {
      console.log('No valid settings ID, fetching or creating...');
      const existingSettings = await fetchSettingsFromSupabase();
      
      if (existingSettings) {
        settingsId = existingSettings.id;
        console.log('Found existing settings with ID:', settingsId);
      } else {
        console.log('Creating new settings...');
        const defaultSettings = await createDefaultSettings();
        settingsId = defaultSettings.id;
        console.log('Created new settings with ID:', settingsId);
      }
    }
    
    // Prepare update data
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
    
    console.log('Final update data:', updateData, 'for ID:', settingsId);
    
    // Update in Supabase
    const { data, error } = await supabase
      .from('app_settings')
      .update(updateData)
      .eq('id', settingsId)
      .select()
      .single();
    
    if (error) {
      console.error('Error updating settings:', error);
      return false;
    }
    
    console.log('Settings updated successfully:', data);
    return true;
  } catch (error) {
    console.error('Error in updateSettingsInSupabase:', error);
    return false;
  }
};
