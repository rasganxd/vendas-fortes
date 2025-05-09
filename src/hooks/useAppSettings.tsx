
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
        // Transform the data to match AppSettings structure
        const fetchedSettings: AppSettings = {
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
          },
          id: settingsData.id
        };
        
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
      
      // Update settings in Supabase
      const { error: updateError } = await supabase
        .from('app_settings')
        .update(supabaseData)
        .eq('id', settings?.id || '');
        
      if (updateError) {
        throw updateError;
      }
      
      setSettings(updatedSettings);
      
      // If theme was updated, apply the new colors
      if (newSettings.theme) {
        applyThemeColors(updatedSettings.theme);
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
