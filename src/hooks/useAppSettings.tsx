
import { useState, useEffect } from 'react';
import { useAppContext } from '@/hooks/useAppContext';
import { AppSettings } from '@/types';
import { db } from '@/firebase/config';
import { doc, getDoc, setDoc } from 'firebase/firestore';

export const useAppSettings = () => {
  const [settings, setSettings] = useState<AppSettings | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const fetchSettings = async () => {
    try {
      setIsLoading(true);
      const settingsRef = doc(db, 'settings', 'appSettings');
      const settingsSnap = await getDoc(settingsRef);
      
      if (settingsSnap.exists()) {
        const fetchedSettings = settingsSnap.data() as AppSettings;
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
        await setDoc(settingsRef, defaultSettings);
        setSettings(defaultSettings);
        
        // Apply default theme colors
        applyThemeColors(defaultSettings.theme);
      }
    } catch (err) {
      console.error('Error fetching settings:', err);
      setError(err as Error);
    } finally {
      setIsLoading(false);
    }
  };

  const updateSettings = async (newSettings: Partial<AppSettings>) => {
    try {
      const settingsRef = doc(db, 'settings', 'appSettings');
      const updatedSettings = { ...settings, ...newSettings };
      await setDoc(settingsRef, updatedSettings);
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
  
  // Helper function to apply theme colors to CSS variables
  const applyThemeColors = (theme?: AppSettings['theme']) => {
    if (!theme) return;
    
    console.log('Applying theme colors:', theme);
    
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
    document.body.style.display = 'none';
    document.body.offsetHeight; // This triggers a reflow
    document.body.style.display = '';
  };
  
  // Convert hex color to HSL format for CSS variables
  const convertHexToHSL = (hex: string): string => {
    // Remove the # if present
    hex = hex.replace(/^#/, '');
    
    // Parse the hex values
    const r = parseInt(hex.slice(0, 2), 16) / 255;
    const g = parseInt(hex.slice(2, 4), 16) / 255;
    const b = parseInt(hex.slice(4, 6), 16) / 255;
    
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
  };

  useEffect(() => {
    fetchSettings();
  }, []);

  return {
    settings,
    updateSettings,
    isLoading,
    error,
    refetch: fetchSettings
  };
};
