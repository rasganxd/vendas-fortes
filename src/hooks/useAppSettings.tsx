
import { useState, useEffect, useCallback } from 'react';
import { AppSettings } from '@/types';
import { 
  fetchSettingsFromSupabase, 
  createDefaultSettings,
  updateSettingsInSupabase 
} from '@/services/settings/settingsService';

/**
 * Hook for managing application settings without theme handling
 */
export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches settings from Supabase or initializes defaults
   */
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      setError(null);
      console.log('Fetching settings...');
      
      // Try to fetch existing settings
      const fetchedSettings = await fetchSettingsFromSupabase();
      
      if (fetchedSettings) {
        console.log('Settings loaded:', fetchedSettings);
        setSettings(fetchedSettings);
      } else {
        console.log('Creating default settings...');
        // Create default settings if none exist
        const defaultSettings = await createDefaultSettings();
        setSettings(defaultSettings);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Updates application settings
   * @param newSettings - Partial settings to update
   */
  const updateSettings = useCallback(async (newSettings: Partial<AppSettings>) => {
    try {
      console.log('updateSettings called with:', newSettings);
      
      // Wait for settings to be loaded if they're not ready yet
      let currentSettings = settings;
      if (!currentSettings && !isLoading) {
        console.log('Settings not loaded, fetching first...');
        await fetchSettings();
        // After fetching, we need to get the updated settings from state
        // Since this is async, we'll refetch from the service directly
        currentSettings = await fetchSettingsFromSupabase();
      }
      
      // If still no settings after fetch, create defaults
      if (!currentSettings) {
        console.log('No settings found, creating defaults...');
        currentSettings = await createDefaultSettings();
      }
      
      console.log('Using current settings for update:', currentSettings);
      
      // Update in Supabase
      const success = await updateSettingsInSupabase(currentSettings, newSettings);
      
      if (success) {
        // Update local state
        const updatedSettings = { ...currentSettings, ...newSettings } as AppSettings;
        setSettings(updatedSettings);
        console.log('Settings updated successfully in hook');
        return true;
      } else {
        throw new Error('Failed to update settings in Supabase');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
  }, [settings, isLoading, fetchSettings]);

  // Load settings on mount
  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    updateSettings,
    isLoading,
    error,
    refetch: fetchSettings
  };
};
