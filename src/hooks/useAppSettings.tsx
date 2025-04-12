
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
        setSettings(settingsSnap.data() as AppSettings);
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
