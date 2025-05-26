
import { AppSettings } from '@/types';
import { 
  fetchLatestSettingsRow, 
  insertSettingsRow, 
  updateSettingsRow, 
  deleteOtherSettingsRows,
  getLatestSettingsId 
} from './settingsQueries';
import { 
  createFallbackSettings, 
  createDefaultSettingsData, 
  convertRowToAppSettings, 
  prepareUpdateData 
} from './settingsHelpers';

/**
 * Fetches settings from Supabase
 * @returns Promise<AppSettings | null>
 */
export const fetchSettingsFromSupabase = async (): Promise<AppSettings | null> => {
  try {
    console.log('Fetching settings from Supabase...');
    
    const data = await fetchLatestSettingsRow();
    
    if (data) {
      console.log('Settings found:', data);
      return convertRowToAppSettings(data);
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
    
    // First delete any existing settings to avoid duplicates
    await deleteOtherSettingsRows();
    
    const defaultSettings = createDefaultSettingsData();
    
    // Save to Supabase
    const data = await insertSettingsRow(defaultSettings);
    
    if (!data) {
      console.error('Failed to create default settings');
      return createFallbackSettings();
    }
    
    console.log('Default settings created:', data);
    
    return {
      id: data.id,
      company: defaultSettings.company,
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
    console.log('🔄 updateSettingsInSupabase called with:', { 
      currentSettingsId: currentSettings?.id, 
      newSettings 
    });
    
    let settingsId = currentSettings?.id;
    
    // If no valid ID, get the most recent settings
    if (!settingsId || settingsId === 'local-fallback') {
      console.log('No valid settings ID, fetching most recent...');
      
      const existingId = await getLatestSettingsId();
      
      if (existingId) {
        settingsId = existingId;
        console.log('Found existing settings with ID:', settingsId);
      } else {
        // Create new settings
        const newSettingsRecord = await createDefaultSettings();
        settingsId = newSettingsRecord.id;
        console.log('Created new settings with ID:', settingsId);
      }
    }
    
    // Prepare update data
    const updateData = prepareUpdateData(newSettings);
    console.log('📝 Final update data:', updateData, 'for ID:', settingsId);
    
    // Update in Supabase
    const data = await updateSettingsRow(settingsId, updateData);
    
    if (!data) {
      console.error('❌ Failed to update settings in database');
      return false;
    }
    
    console.log('✅ Settings updated successfully in database:', data);
    return true;
  } catch (error) {
    console.error('❌ Error in updateSettingsInSupabase:', error);
    return false;
  }
};
