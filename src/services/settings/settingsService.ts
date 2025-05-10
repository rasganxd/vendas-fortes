
import { supabase } from '@/integrations/supabase/client';
import { AppSettings } from '@/types';

/**
 * Fetches application settings from Supabase
 * @returns Promise with settings data
 */
export async function fetchSettingsFromSupabase(): Promise<AppSettings | null> {
  // Fetch settings from Supabase
  const { data: settingsData, error: fetchError } = await supabase
    .from('app_settings')
    .select('*')
    .limit(1)
    .single();
    
  if (fetchError && fetchError.code !== 'PGRST116') { // Not found error code
    throw fetchError;
  }
  
  if (settingsData) {
    // Transform the data to match AppSettings structure
    return {
      id: settingsData.id,
      company: {
        name: settingsData.company_name || '',
        address: settingsData.company_address || '',
        phone: settingsData.company_phone || '',
        email: settingsData.company_email || '',
        document: settingsData.company_document || '',
        footer: settingsData.company_footer || 'Para qualquer suporte: (11) 9999-8888'
      },
      theme: {
        primaryColor: settingsData.primary_color || '#1C64F2',
        secondaryColor: settingsData.secondary_color || '#047481',
        accentColor: settingsData.accent_color || '#0694A2'
      }
    };
  }

  return null;
}

/**
 * Creates default settings in Supabase
 * @returns Promise with default settings
 */
export async function createDefaultSettings(): Promise<AppSettings> {
  // Initialize with default settings if none exist
  const defaultSettings: AppSettings = {
    company: {
      name: '',
      address: '',
      phone: '',
      email: '',
      document: '',
      footer: 'Para qualquer suporte: (11) 9999-8888'
    },
    theme: {
      primaryColor: '#1C64F2',
      secondaryColor: '#047481',
      accentColor: '#0694A2'
    }
  };
  
  // Try to insert default settings
  const { data: newSettings, error: insertError } = await supabase
    .from('app_settings')
    .insert({
      company_name: defaultSettings.company.name,
      company_address: defaultSettings.company.address,
      company_phone: defaultSettings.company.phone,
      company_email: defaultSettings.company.email,
      company_document: defaultSettings.company.document,
      company_footer: defaultSettings.company.footer,
      primary_color: defaultSettings.theme.primaryColor,
      secondary_color: defaultSettings.theme.secondaryColor,
      accent_color: defaultSettings.theme.accentColor
    })
    .select();
    
  if (insertError) {
    console.error("Error inserting default settings:", insertError);
  } else if (newSettings && newSettings.length > 0) {
    defaultSettings.id = newSettings[0].id;
  }
  
  return defaultSettings;
}

/**
 * Updates settings in Supabase
 * @param settings - Current settings object with ID
 * @param newSettings - Partial settings to update
 */
export async function updateSettingsInSupabase(
  settings: AppSettings | null,
  newSettings: Partial<AppSettings>
): Promise<void> {
  // Convert to Supabase format
  const supabaseData: Record<string, any> = {};
  
  if (newSettings.company) {
    if (newSettings.company.name !== undefined) supabaseData.company_name = newSettings.company.name;
    if (newSettings.company.address !== undefined) supabaseData.company_address = newSettings.company.address;
    if (newSettings.company.phone !== undefined) supabaseData.company_phone = newSettings.company.phone;
    if (newSettings.company.email !== undefined) supabaseData.company_email = newSettings.company.email;
    if (newSettings.company.document !== undefined) supabaseData.company_document = newSettings.company.document;
    if (newSettings.company.footer !== undefined) supabaseData.company_footer = newSettings.company.footer;
  }
  
  if (newSettings.theme) {
    if (newSettings.theme.primaryColor !== undefined) supabaseData.primary_color = newSettings.theme.primaryColor;
    if (newSettings.theme.secondaryColor !== undefined) supabaseData.secondary_color = newSettings.theme.secondaryColor;
    if (newSettings.theme.accentColor !== undefined) supabaseData.accent_color = newSettings.theme.accentColor;
  }
  
  // Update settings in Supabase if we have an id
  if (settings?.id) {
    const { error: updateError } = await supabase
      .from('app_settings')
      .update(supabaseData)
      .eq('id', settings.id);
      
    if (updateError) {
      throw updateError;
    }
  } else {
    // Insert if no id exists yet
    const { error: insertError } = await supabase
      .from('app_settings')
      .insert(supabaseData);
      
    if (insertError) {
      throw insertError;
    }
  }
}
