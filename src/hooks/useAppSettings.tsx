
import { useState, useEffect, useCallback } from 'react';
import { AppSettings, Theme } from '@/types';
import { 
  applyThemeColors, 
  loadCachedTheme 
} from '@/utils/theme-utils';
import { 
  fetchSettingsFromFirebase, 
  createDefaultSettings,
  updateSettingsInFirebase 
} from '@/services/settings/settingsService';

/**
 * Hook for managing application settings with optimized theme handling
 */
export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  /**
   * Fetches settings from Firebase or initializes defaults
   */
  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
      // Try to fetch existing settings
      const fetchedSettings = await fetchSettingsFromFirebase();
      
      if (fetchedSettings) {
        setSettings(fetchedSettings);
        // Apply the theme colors if present
        if (fetchedSettings.theme) {
          // Ensure both naming conventions are supported
          const themeWithBothStyles = ensureThemeProperties(fetchedSettings.theme);
          applyThemeColors(themeWithBothStyles);
        }
      } else {
        // Create default settings if none exist
        const defaultSettings = await createDefaultSettings();
        setSettings(defaultSettings);
        if (defaultSettings.theme) {
          // Ensure both naming conventions are supported
          const themeWithBothStyles = ensureThemeProperties(defaultSettings.theme);
          applyThemeColors(themeWithBothStyles);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err as Error);
      
      // If there's an error fetching from Firebase, try to load from cache
      loadCachedTheme();
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Helper to ensure theme has both naming convention properties
   */
  const ensureThemeProperties = (theme: Theme): Theme & {
    primaryColor?: string;
    secondaryColor?: string;
    accentColor?: string;
  } => {
    return {
      ...theme,
      // Ensure both naming conventions are present
      primary: theme.primary,
      secondary: theme.secondary,
      accent: theme.accent,
      primaryColor: theme.primaryColor || theme.primary,
      secondaryColor: theme.secondaryColor || theme.secondary,
      accentColor: theme.accentColor || theme.accent
    };
  };

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
      
      // Update in Firebase
      await updateSettingsInFirebase(settings, newSettings);
      
      // Update local state
      setSettings(updatedSettings);
      
      // If theme was updated, apply the new colors
      if (newSettings.theme) {
        // Ensure both naming conventions are present
        const themeWithBothStyles = ensureThemeProperties(newSettings.theme as Theme);
        applyThemeColors(themeWithBothStyles);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
  };

  // Apply cached theme on mount, before Firebase data is available
  useEffect(() => {
    loadCachedTheme();
    fetchSettings();
  }, [fetchSettings]);

  return {
    settings,
    updateSettings,
    isLoading,
    error,
    refetch: fetchSettings,
    applyThemeColors // Expose this function so it can be called manually if needed
  };
};
