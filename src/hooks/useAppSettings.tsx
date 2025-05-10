
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { AppSettings } from '@/types';
import { 
  applyThemeColors, 
  loadCachedTheme 
} from '@/utils/theme-utils';
import { 
  fetchSettingsFromSupabase, 
  createDefaultSettings,
  updateSettingsInSupabase 
} from '@/services/settings/settingsService';

/**
 * Hook for managing application settings
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
        // Apply the theme colors directly
        if (fetchedSettings.theme) {
          console.log("Applying fetched theme colors:", fetchedSettings.theme);
          applyThemeColors(fetchedSettings.theme);
        }
      } else {
        // Create default settings if none exist
        const defaultSettings = await createDefaultSettings();
        setSettings(defaultSettings);
        if (defaultSettings.theme) {
          console.log("Applying default theme colors:", defaultSettings.theme);
          applyThemeColors(defaultSettings.theme);
        }
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err as Error);
      
      // If there's an error fetching from Supabase, try to load from cache
      loadCachedTheme();
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
      
      // If theme was updated, apply the new colors
      if (newSettings.theme) {
        console.log("Applying updated theme colors:", newSettings.theme);
        applyThemeColors(newSettings.theme);
        
        // Directly apply header color for consistency
        setTimeout(() => {
          const sidebarHeader = document.querySelector('.dynamic-sidebar-header') as HTMLElement;
          if (sidebarHeader && newSettings.theme?.primaryColor) {
            sidebarHeader.style.background = newSettings.theme.primaryColor;
            sidebarHeader.style.color = '#ffffff';
          }
        }, 10);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
  };

  // Apply cached theme on mount, before Supabase data is available
  useEffect(() => {
    loadCachedTheme();
    fetchSettings();
    
    // Re-apply theme on window focus to maintain consistency
    const handleFocus = () => {
      if (settings?.theme) {
        console.log("Reapplying theme on focus:", settings.theme);
        applyThemeColors(settings.theme);
        
        // Directly apply header color for consistency
        setTimeout(() => {
          const sidebarHeader = document.querySelector('.dynamic-sidebar-header') as HTMLElement;
          if (sidebarHeader && settings.theme?.primaryColor) {
            sidebarHeader.style.background = settings.theme.primaryColor;
            sidebarHeader.style.color = '#ffffff';
          }
        }, 10);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [fetchSettings, settings?.theme]);

  return {
    settings,
    updateSettings,
    isLoading,
    error,
    refetch: fetchSettings,
    applyThemeColors // Expose this function so it can be called manually if needed
  };
};
