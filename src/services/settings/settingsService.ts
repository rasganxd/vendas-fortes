
import { supabase } from '@/integrations/supabase/client';
import { AppSettings } from '@/types';

/**
 * Fetches settings from Supabase
 * @returns Promise<AppSettings | null>
 */
export const fetchSettingsFromSupabase = async (): Promise<AppSettings | null> => {
  try {
    console.log('Fetching settings from Supabase...');
    
    // Use .limit(1).single() to get only the first row
    const { data, error } = await supabase
      .from('app_settings')
      .select('*')
      .limit(1)
      .single();
    
    if (error) {
      // If no data found, that's okay - we'll create defaults
      if (error.code === 'PGRST116') {
        console.log('No settings found in database');
        return null;
      }
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
    
    // First check if settings already exist to avoid duplicates
    const existingSettings = await supabase
      .from('app_settings')
      .select('id')
      .limit(1)
      .maybeSingle();
    
    if (existingSettings.data) {
      console.log('Settings already exist, fetching existing ones...');
      return await fetchSettingsFromSupabase() || createFallbackSettings();
    }
    
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
      return createFallbackSettings();
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
    return createFallbackSettings();
  }
};

/**
 * Creates fallback settings when database operations fail
 */
const createFallbackSettings = (): AppSettings => {
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
    
    // Get the settings ID
    let settingsId = currentSettings?.id;
    
    if (!settingsId || settingsId === 'local-fallback') {
      console.log('No valid settings ID, fetching or creating...');
      
      // Try to get existing settings first
      const { data: existingData } = await supabase
        .from('app_settings')
        .select('id')
        .limit(1)
        .maybeSingle();
      
      if (existingData) {
        settingsId = existingData.id;
        console.log('Found existing settings with ID:', settingsId);
      } else {
        // Create new settings
        const newSettingsRecord = await createDefaultSettings();
        settingsId = newSettingsRecord.id;
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
