
import { collection, getDocs, addDoc, enableIndexedDbPersistence } from 'firebase/firestore';
import { db } from './config';

// List of collections that need to be initialized
const requiredCollections = [
  'payments',
  'payment_methods',
  'payment_tables',
  'orders',
  'customers',
  'products',
  'sales_reps'
];

/**
 * Checks if a collection exists by trying to get documents from it
 * @param collectionName Collection name to check
 * @returns Boolean indicating if collection exists
 */
const collectionExists = async (collectionName: string): Promise<boolean> => {
  try {
    const querySnapshot = await getDocs(collection(db, collectionName));
    // If we can query it, it exists (or will be created by this query)
    return true;
  } catch (error) {
    console.error(`Error checking if collection ${collectionName} exists:`, error);
    return false;
  }
};

/**
 * Initializes a collection by adding a temporary document if it doesn't exist
 * @param collectionName Collection name to initialize
 */
const initializeCollection = async (collectionName: string): Promise<void> => {
  try {
    // Check if collection already has documents
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`Initializing collection: ${collectionName}`);
      
      // Add a temporary initialization document
      const tempDoc = {
        _temp: true,
        _initialized: new Date(),
        _description: `Temporary document to initialize ${collectionName} collection`
      };
      
      await addDoc(collection(db, collectionName), tempDoc);
      console.log(`Collection ${collectionName} initialized with temporary document`);
    } else {
      console.log(`Collection ${collectionName} already has documents, no initialization needed`);
    }
  } catch (error) {
    console.error(`Error initializing collection ${collectionName}:`, error);
  }
};

/**
 * Sets up offline persistence for Firestore
 */
const setupOfflinePersistence = async (): Promise<void> => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled for Firestore');
  } catch (error) {
    console.error('Error enabling offline persistence:', error);
  }
};

/**
 * Main function to initialize all Firestore collections
 */
export const initializeFirestore = async (): Promise<void> => {
  console.log('Starting Firestore initialization...');
  
  try {
    // Enable offline persistence first
    await setupOfflinePersistence();
    
    // Initialize each required collection
    for (const collectionName of requiredCollections) {
      await initializeCollection(collectionName);
    }
    
    console.log('Firestore initialization completed successfully');
  } catch (error) {
    console.error('Error during Firestore initialization:', error);
  }
};

