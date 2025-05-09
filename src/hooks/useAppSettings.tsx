
import { useState, useEffect, useCallback } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { AppSettings } from '@/types';
import { supabase } from '@/integrations/supabase/client';

// Cache key for storing theme colors in localStorage
const THEME_COLORS_CACHE_KEY = 'app-theme-colors';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);
  
  // Improved function to apply theme colors with better error handling
  const applyThemeColors = useCallback((theme?: AppSettings['theme']) => {
    if (!theme) {
      console.log('No theme colors to apply');
      return;
    }
    
    console.log('Applying theme colors:', theme);
    
    try {
      // Store in local storage for persistence
      localStorage.setItem(THEME_COLORS_CACHE_KEY, JSON.stringify(theme));
      
      // Convert hex to HSL and apply to CSS variables
      if (theme.primaryColor) {
        const primaryHsl = convertHexToHSL(theme.primaryColor);
        document.documentElement.style.setProperty('--primary', primaryHsl);
        document.documentElement.style.setProperty('--sidebar-primary', primaryHsl);
        // Also update some other variables to create cohesive look
        document.documentElement.style.setProperty('--ring', primaryHsl);
      }
      
      if (theme.secondaryColor) {
        const secondaryHsl = convertHexToHSL(theme.secondaryColor);
        document.documentElement.style.setProperty('--secondary', secondaryHsl);
      }
      
      if (theme.accentColor) {
        const accentHsl = convertHexToHSL(theme.accentColor);
        document.documentElement.style.setProperty('--accent', accentHsl);
      }
      
      // Force a repaint to ensure the changes are applied
      const body = document.body;
      const display = body.style.display;
      body.style.display = 'none';
      void body.offsetHeight; // This triggers a reflow
      body.style.display = display || '';
      
      console.log('Theme colors applied successfully');
    } catch (err) {
      console.error('Error applying theme colors:', err);
    }
  }, []);

  // Function to load cached theme from localStorage
  const loadCachedTheme = useCallback(() => {
    try {
      const cachedTheme = localStorage.getItem(THEME_COLORS_CACHE_KEY);
      if (cachedTheme) {
        const parsedTheme = JSON.parse(cachedTheme) as AppSettings['theme'];
        console.log('Loaded cached theme colors:', parsedTheme);
        applyThemeColors(parsedTheme);
      }
    } catch (err) {
      console.error('Error loading cached theme:', err);
    }
  }, [applyThemeColors]);

  const fetchSettings = useCallback(async () => {
    try {
      setIsLoading(true);
      
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
        const fetchedSettings = settingsData as AppSettings;
        setSettings(fetchedSettings);
        
        // Apply theme colors
        applyThemeColors(fetchedSettings.theme);
      } else {
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
        const { error: insertError } = await supabase
          .from('app_settings')
          .insert(defaultSettings);
          
        if (insertError) {
          console.error("Error inserting default settings:", insertError);
        }
        
        setSettings(defaultSettings);
        
        // Apply default theme colors
        applyThemeColors(defaultSettings.theme);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err as Error);
      
      // If there's an error fetching from Supabase, try to load from cache
      loadCachedTheme();
    } finally {
      setIsLoading(false);
    }
  }, [applyThemeColors, loadCachedTheme]);

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const updatedSettings = { ...settings, ...newSettings };
      
      // Update settings in Supabase
      const { error: updateError } = await supabase
        .from('app_settings')
        .update(updatedSettings)
        .eq('id', settings?.id || 'default');
        
      if (updateError) {
        throw updateError;
      }
      
      setSettings(updatedSettings);
      
      // If theme was updated, apply the new colors
      if (newSettings.theme) {
        applyThemeColors(newSettings.theme);
      }
      
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
  };
  
  // Improved hex to HSL conversion with better handling of different hex formats
  const convertHexToHSL = (hex: string): string => {
    try {
      // Remove the # if present
      hex = hex.replace(/^#/, '');
      
      // Handle different hex formats (3 or 6 digits)
      let r, g, b;
      
      if (hex.length === 3) {
        r = parseInt(hex[0] + hex[0], 16) / 255;
        g = parseInt(hex[1] + hex[1], 16) / 255;
        b = parseInt(hex[2] + hex[2], 16) / 255;
      } else if (hex.length === 6) {
        r = parseInt(hex.slice(0, 2), 16) / 255;
        g = parseInt(hex.slice(2, 4), 16) / 255;
        b = parseInt(hex.slice(4, 6), 16) / 255;
      } else {
        console.error('Invalid hex color format:', hex);
        return '210 100% 50%'; // Default blue as fallback
      }
      
      const max = Math.max(r, g, b);
      const min = Math.min(r, g, b);
      let h = 0;
      let s = 0;
      const l = (max + min) / 2;
      
      if (max !== min) {
        const d = max - min;
        s = l > 0.5 ? d / (2 - max - min) : d / (max + min);
        
        switch (max) {
          case r:
            h = (g - b) / d + (g < b ? 6 : 0);
            break;
          case g:
            h = (b - r) / d + 2;
            break;
          case b:
            h = (r - g) / d + 4;
            break;
        }
        
        h = Math.round(h * 60);
      }
      
      s = Math.round(s * 100);
      const lightness = Math.round(l * 100);
      
      return `${h} ${s}% ${lightness}%`;
    } catch (err) {
      console.error('Error converting hex to HSL:', err);
      return '210 100% 50%'; // Default blue as fallback
    }
  };

  // Apply cached theme on mount, before Supabase data is available
  useEffect(() => {
    loadCachedTheme();
    fetchSettings();
    
    // Re-apply theme on window focus to maintain consistency
    const handleFocus = () => {
      if (settings?.theme) {
        applyThemeColors(settings.theme);
      }
    };
    
    window.addEventListener('focus', handleFocus);
    return () => {
      window.removeEventListener('focus', handleFocus);
    };
  }, [loadCachedTheme, fetchSettings, applyThemeColors, settings?.theme]);

  return {
    settings,
    updateSettings,
    isLoading,
    error,
    refetch: fetchSettings,
    applyThemeColors // Expose this function so it can be called manually if needed
  };
};
