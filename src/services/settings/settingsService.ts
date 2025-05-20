
import { AppSettings, Theme } from '@/types';
import { db } from '@/services/firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { v4 as uuidv4 } from 'uuid';

// Firebase collection name
const SETTINGS_COLLECTION = 'app_settings';
const SETTINGS_DOC_ID = 'app_settings';

// Local storage keys for caching theme
const THEME_CACHE_KEY = 'app_theme_cache';

/**
 * Fetches settings from Firebase
 * @returns Promise<AppSettings | null>
 */
export const fetchSettingsFromFirebase = async (): Promise<AppSettings | null> => {
  try {
    console.log('Fetching settings from Firebase...');
    const docRef = doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID);
    const docSnap = await getDoc(docRef);

    if (docSnap.exists()) {
      console.log('Settings found:', docSnap.data());
      
      // Convert Firebase timestamp to Date objects
      const data = docSnap.data();
      
      return {
        id: docSnap.id,
        companyName: data.companyName || '',
        companyLogo: data.companyLogo || '',
        theme: data.theme || null,
        createdAt: data.createdAt ? new Date(data.createdAt.seconds * 1000) : new Date(),
        updatedAt: data.updatedAt ? new Date(data.updatedAt.seconds * 1000) : new Date()
      } as AppSettings;
    } else {
      console.log('No settings found');
      return null;
    }
  } catch (error) {
    console.error('Error fetching app settings:', error);
    return null;
  }
};

/**
 * Creates default settings if none exist
 * @returns Promise<AppSettings>
 */
export const createDefaultSettings = async (): Promise<AppSettings> => {
  try {
    console.log('Creating default settings...');
    
    const defaultSettings: AppSettings = {
      id: SETTINGS_DOC_ID,
      companyName: 'Minha Empresa',
      companyLogo: '',
      theme: {
        primary: '#1C64F2',
        secondary: '#047481',
        accent: '#0694A2'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to Firebase
    await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), defaultSettings);
    
    // Cache the theme
    cacheTheme(defaultSettings.theme);
    
    console.log('Default settings created:', defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error creating default settings:', error);
    
    // Return the default settings anyway so the app can continue
    return {
      id: 'local-fallback',
      companyName: 'Minha Empresa',
      companyLogo: '',
      theme: {
        primary: '#1C64F2',
        secondary: '#047481',
        accent: '#0694A2'
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
  }
};

/**
 * Updates settings in Firebase
 * @param currentSettings - Current settings object
 * @param newSettings - Partial settings to update
 * @returns Promise<boolean>
 */
export const updateSettingsInFirebase = async (
  currentSettings: AppSettings | null,
  newSettings: Partial<AppSettings>
): Promise<boolean> => {
  try {
    if (!currentSettings?.id) {
      // If no current settings, create default ones first
      await createDefaultSettings();
    }
    
    // Prepare update data with timestamp
    const updateData = {
      ...newSettings,
      updatedAt: new Date()
    };
    
    // Update in Firebase
    await updateDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), updateData);
    
    // If theme was updated, cache it
    if (newSettings.theme) {
      cacheTheme(newSettings.theme);
    }
    
    console.log('Settings updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};

/**
 * Cache theme in localStorage for offline use
 * @param theme - Theme object
 */
export const cacheTheme = (theme: Theme | null): void => {
  if (theme) {
    localStorage.setItem(THEME_CACHE_KEY, JSON.stringify(theme));
  }
};

/**
 * Load theme from cache
 * @returns Theme | null
 */
export const loadCachedTheme = (): Theme | null => {
  try {
    const cachedTheme = localStorage.getItem(THEME_CACHE_KEY);
    if (cachedTheme) {
      return JSON.parse(cachedTheme);
    }
    return null;
  } catch (error) {
    console.error('Error loading cached theme:', error);
    return null;
  }
};
