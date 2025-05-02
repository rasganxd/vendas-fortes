
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
        
        // Aplica as cores do tema, se existirem
        if (fetchedSettings.theme?.primaryColor) {
          document.documentElement.style.setProperty('--primary', fetchedSettings.theme.primaryColor);
        }
        if (fetchedSettings.theme?.secondaryColor) {
          document.documentElement.style.setProperty('--secondary', fetchedSettings.theme.secondaryColor);
        }
        if (fetchedSettings.theme?.accentColor) {
          document.documentElement.style.setProperty('--accent', fetchedSettings.theme.accentColor);
        }
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
      return true;
    } catch (err) {
      console.error('Error updating settings:', err);
      setError(err as Error);
      throw err;
    }
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
