
import { supabase } from '@/integrations/supabase/client';
import { SupabaseSettingsRow } from './settingsTypes';

/**
 * Fetches the most recent settings entry from Supabase
 */
export const fetchLatestSettingsRow = async (): Promise<SupabaseSettingsRow | null> => {
  console.log('Fetching latest settings row from Supabase...');
  
  const { data, error } = await supabase
    .from('app_settings')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  if (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
  
  // Transform the Cloud schema to legacy format
  if (data) {
    return {
      id: data.id,
      company_name: (data.value as any)?.company_name || '',
      company: (data.value as any)?.company || {},
      primary_color: (data.value as any)?.primary_color || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  return null;
};

/**
 * Inserts new settings record into Supabase
 */
export const insertSettingsRow = async (settingsData: any): Promise<SupabaseSettingsRow | null> => {
  console.log('Inserting settings row:', settingsData);
  
  const { data, error } = await supabase
    .from('app_settings')
    .insert({
      key: 'app_settings',
      value: settingsData
    })
    .select()
    .single();
  
  if (error) {
    console.error('Error inserting settings:', error);
    return null;
  }
  
  if (data) {
    return {
      id: data.id,
      company_name: settingsData.company_name || '',
      company: settingsData.company || {},
      primary_color: settingsData.primary_color || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  return null;
};

/**
 * Updates settings record in Supabase
 */
export const updateSettingsRow = async (settingsId: string, updateData: any): Promise<SupabaseSettingsRow | null> => {
  console.log('Updating settings row:', { settingsId, updateData });
  
  const { data, error } = await supabase
    .from('app_settings')
    .update({
      value: updateData,
      updated_at: new Date().toISOString()
    })
    .eq('id', settingsId)
    .select()
    .single();
  
  if (error) {
    console.error('Error updating settings:', error);
    return null;
  }
  
  if (data) {
    return {
      id: data.id,
      company_name: updateData.company_name || '',
      company: updateData.company || {},
      primary_color: updateData.primary_color || '',
      created_at: data.created_at,
      updated_at: data.updated_at
    };
  }
  
  return null;
};

/**
 * Deletes all settings except the one with the given ID
 */
export const deleteOtherSettingsRows = async (): Promise<void> => {
  await supabase
    .from('app_settings')
    .delete()
    .neq('id', '00000000-0000-0000-0000-000000000000');
};

/**
 * Gets the ID of the most recent settings record
 */
export const getLatestSettingsId = async (): Promise<string | null> => {
  const { data } = await supabase
    .from('app_settings')
    .select('id')
    .order('created_at', { ascending: false })
    .limit(1)
    .maybeSingle();
  
  return data?.id || null;
};
