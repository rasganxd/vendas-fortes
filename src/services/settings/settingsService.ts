
import { AppSettings } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Supabase table name
const SETTINGS_TABLE = 'app_settings';

/**
 * Fetches settings from Supabase
 * @returns Promise<AppSettings | null>
 */
export const fetchSettingsFromFirebase = async (): Promise<AppSettings | null> => {
  try {
    console.log('Fetching settings from Supabase...');
    
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .select('*')
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        console.log('No settings found');
        return null;
      }
      throw error;
    }

    if (data) {
      console.log('Settings found:', data);
      
      return {
        id: data.id,
        companyName: data.company_name || '',
        companyLogo: data.company_logo || '',
        company: data.company || {
          name: '',
          address: '',
          phone: '',
          email: '',
          document: '',
          footer: ''
        },
        createdAt: data.created_at ? new Date(data.created_at) : new Date(),
        updatedAt: data.updated_at ? new Date(data.updated_at) : new Date()
      } as AppSettings;
    } else {
      console.log('No settings found');
      return null;
    }
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
    
    const defaultSettings = {
      company_name: 'Minha Empresa',
      company_logo: '',
      company: {
        name: 'Minha Empresa',
        address: '',
        phone: '',
        email: '',
        document: '',
        footer: '',
      },
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Save to Supabase
    const { data, error } = await supabase
      .from(SETTINGS_TABLE)
      .insert([defaultSettings])
      .select()
      .single();
    
    if (error) {
      throw error;
    }
    
    const result: AppSettings = {
      id: data.id,
      companyName: data.company_name || 'Minha Empresa',
      companyLogo: data.company_logo || '',
      company: data.company || {
        name: 'Minha Empresa',
        address: '',
        phone: '',
        email: '',
        document: '',
        footer: '',
      },
      createdAt: new Date(data.created_at),
      updatedAt: new Date(data.updated_at)
    };
    
    console.log('Default settings created:', result);
    return result;
  } catch (error) {
    console.error('Error creating default settings:', error);
    
    // Return the default settings anyway so the app can continue
    return {
      id: 'local-fallback',
      companyName: 'Minha Empresa',
      companyLogo: '',
      company: {
        name: 'Minha Empresa',
        address: '',
        phone: '',
        email: '',
        document: '',
        footer: '',
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};

/**
 * Updates settings in Supabase
 * @param currentSettings - Current settings object
 * @param newSettings - Partial settings to update
 * @returns Promise<boolean>
 */
export const updateSettingsInFirebase = async (
  currentSettings: AppSettings | null,
  newSettings: Partial<AppSettings>
): Promise<boolean> => {
  try {
    if (!currentSettings?.id) {
      // If no current settings, create default ones first
      await createDefaultSettings();
    }
    
    // Prepare update data with timestamp
    const updateData: any = {
      updated_at: new Date().toISOString()
    };
    
    // Map fields from AppSettings to database schema
    if (newSettings.companyName !== undefined) {
      updateData.company_name = newSettings.companyName;
    }
    if (newSettings.companyLogo !== undefined) {
      updateData.company_logo = newSettings.companyLogo;
    }
    if (newSettings.company !== undefined) {
      updateData.company = newSettings.company;
    }
    if (newSettings.primaryColor !== undefined) {
      updateData.primary_color = newSettings.primaryColor;
    }
    
    // Update in Supabase
    const { error } = await supabase
      .from(SETTINGS_TABLE)
      .update(updateData)
      .eq('id', currentSettings?.id || 'default');
    
    if (error) {
      throw error;
    }
    
    console.log('Settings updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};
