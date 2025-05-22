
import { AppSettings } from '@/types';
import { db } from '@/services/firebase/config';
import { collection, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';

// Firebase collection name
const SETTINGS_COLLECTION = 'app_settings';
const SETTINGS_DOC_ID = 'app_settings';

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
        company: data.company || {
          name: '',
          address: '',
          phone: '',
          email: '',
          document: '',
          footer: ''
        },
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
      company: {
        name: 'Minha Empresa',
        address: '',
        phone: '',
        email: '',
        document: '',
        footer: '',
      },
      createdAt: new Date(),
      updatedAt: new Date()
    };
    
    // Save to Firebase
    await setDoc(doc(db, SETTINGS_COLLECTION, SETTINGS_DOC_ID), defaultSettings);
    
    console.log('Default settings created:', defaultSettings);
    return defaultSettings;
  } catch (error) {
    console.error('Error creating default settings:', error);
    
    // Return the default settings anyway so the app can continue
    return {
      id: 'local-fallback',
      companyName: 'Minha Empresa',
      companyLogo: '',
      company: {
        name: 'Minha Empresa',
        address: '',
        phone: '',
        email: '',
        document: '',
        footer: '',
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
    
    console.log('Settings updated successfully');
    return true;
  } catch (error) {
    console.error('Error updating settings:', error);
    return false;
  }
};
