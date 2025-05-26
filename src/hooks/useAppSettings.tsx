
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
      setError(null);
      
      // Ensure we have settings loaded
      if (!settings) {
        console.log('No settings available, cannot update');
        throw new Error('Configurações não carregadas. Tente novamente.');
      }
      
      console.log('Using current settings for update:', settings);
      
      // Update in Supabase
      const success = await updateSettingsInSupabase(settings, newSettings);
      
      if (success) {
        // Update local state immediately
        const updatedSettings = { ...settings, ...newSettings } as AppSettings;
        setSettings(updatedSettings);
        console.log('Settings updated successfully in hook');
        return true;
      } else {
        throw new Error('Falha ao salvar as configurações no banco de dados');
      }
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
  }, [settings]);

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
