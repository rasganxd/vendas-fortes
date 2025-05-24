
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
      
      // Try to fetch existing settings
      const fetchedSettings = await fetchSettingsFromSupabase();
      
      if (fetchedSettings) {
        setSettings(fetchedSettings);
      } else {
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
  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      if (!settings?.id) {
        await fetchSettings();
      }
      
      // Merge existing and new settings
      const updatedSettings = { ...settings, ...newSettings } as AppSettings;
      
      // Update in Supabase
      await updateSettingsInSupabase(settings, newSettings);
      
      // Update local state
      setSettings(updatedSettings);
      
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
  };

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
