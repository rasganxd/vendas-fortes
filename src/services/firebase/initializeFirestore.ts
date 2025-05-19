import { 
  collection, 
  getDocs, 
  addDoc, 
  enableIndexedDbPersistence, 
  disableNetwork, 
  enableNetwork,
  getFirestore
} from 'firebase/firestore';
import { db } from './config';
import { toast } from 'sonner';

// List of collections that need to be initialized
const requiredCollections = [
  'payments',
  'payment_methods',
  'payment_tables',
  'orders',
  'customers',
  'products',
  'sales_reps',
  'product_categories',
  'product_brands',
  'product_groups'
];

// Maximum retry attempts for initialization
const MAX_RETRIES = 3;
const RETRY_DELAY = 2000; // milliseconds

/**
 * Checks if a collection exists by trying to get documents from it
 * @param collectionName Collection name to check
 * @returns Boolean indicating if collection exists
 */
const collectionExists = async (collectionName: string): Promise<boolean> => {
  try {
    console.log(`initializeFirestore: Checking if collection ${collectionName} exists`);
    const querySnapshot = await getDocs(collection(db, collectionName));
    console.log(`initializeFirestore: Collection ${collectionName} exists with ${querySnapshot.size} docs`);
    // If we can query it, it exists (or will be created by this query)
    return true;
  } catch (error) {
    console.error(`initializeFirestore: Error checking if collection ${collectionName} exists:`, error);
    return false;
  }
};

/**
 * Initializes a collection by adding a temporary document if it doesn't exist
 * @param collectionName Collection name to initialize
 * @param attempt Current retry attempt number
 * @returns Promise resolving to success status
 */
const initializeCollection = async (collectionName: string, attempt = 1): Promise<boolean> => {
  try {
    console.log(`initializeFirestore: Initializing collection: ${collectionName} (attempt ${attempt})`);
    // Check if collection already has documents
    const querySnapshot = await getDocs(collection(db, collectionName));
    
    if (querySnapshot.empty) {
      console.log(`initializeFirestore: Collection ${collectionName} is empty, adding init document`);
      
      // Add a temporary initialization document
      const tempDoc = {
        _temp: true,
        _initialized: new Date(),
        _description: `Temporary document to initialize ${collectionName} collection`
      };
      
      await addDoc(collection(db, collectionName), tempDoc);
      console.log(`initializeFirestore: Collection ${collectionName} initialized with temporary document`);
    } else {
      console.log(`initializeFirestore: Collection ${collectionName} already has ${querySnapshot.size} documents`);
      querySnapshot.forEach((doc) => {
        const data = doc.data();
        if (data._temp) {
          console.log(`initializeFirestore: Found initialization document in ${collectionName}`);
        }
      });
    }
    
    return true;
  } catch (error) {
    console.error(`initializeFirestore: Error initializing collection ${collectionName} (attempt ${attempt}):`, error);
    
    // Implement retry mechanism
    if (attempt < MAX_RETRIES) {
      console.log(`initializeFirestore: Retrying initialization of ${collectionName} in ${RETRY_DELAY}ms...`);
      
      // Wait before retry
      await new Promise(resolve => setTimeout(resolve, RETRY_DELAY));
      
      // Retry with incremented attempt counter
      return initializeCollection(collectionName, attempt + 1);
    }
    
    return false;
  }
};

/**
 * Sets up offline persistence for Firestore
 */
const setupOfflinePersistence = async (): Promise<boolean> => {
  try {
    await enableIndexedDbPersistence(db);
    console.log('Offline persistence enabled for Firestore');
    return true;
  } catch (error: any) {
    if (error.code === 'failed-precondition') {
      // Multiple tabs open, persistence can only be enabled in one tab at a time
      console.warn('Multiple tabs open, offline persistence enabled only in one tab');
      return true;
    } else if (error.code === 'unimplemented') {
      // The current browser does not support all of the features required for persistence
      console.warn('Offline persistence not supported in this browser');
      return true;
    }
    
    console.error('Error enabling offline persistence:', error);
    return false;
  }
};

/**
 * Attempts to fix network connection issues by toggling network
 */
const attemptNetworkRecovery = async (): Promise<void> => {
  try {
    console.log('Attempting network recovery for Firestore...');
    await disableNetwork(db);
    await new Promise(resolve => setTimeout(resolve, 1000));
    await enableNetwork(db);
    console.log('Network reset completed');
  } catch (error) {
    console.error('Error during network recovery attempt:', error);
  }
};

/**
 * Main function to initialize all Firestore collections with better error handling
 */
export const initializeFirestore = async (showToasts = false): Promise<boolean> => {
  console.log('initializeFirestore: Starting Firestore initialization...');
  let overallSuccess = true;
  
  try {
    console.log('initializeFirestore: Firebase config:', db ? 'Firebase initialized' : 'Firebase NOT initialized');
    
    // Enable offline persistence first - this must happen before any other Firestore operations
    const persistenceEnabled = await setupOfflinePersistence();
    
    if (!persistenceEnabled) {
      console.warn('initializeFirestore: Offline persistence could not be enabled, but continuing');
      // Don't return early, still try to initialize collections
    }
    
    // Initialize each required collection
    const results = await Promise.all(
      requiredCollections.map(async (collectionName) => {
        const success = await initializeCollection(collectionName);
        if (!success) {
          console.error(`initializeFirestore: Failed to initialize collection: ${collectionName}`);
          overallSuccess = false;
        }
        return { collectionName, success };
      })
    );
    
    // Log results
    const successful = results.filter(r => r.success).length;
    const failed = results.length - successful;
    
    console.log(`initializeFirestore: Completed: ${successful}/${results.length} collections initialized successfully`);
    
    if (failed > 0) {
      console.warn(`initializeFirestore: ${failed} collections could not be initialized`);
      
      // Try network recovery if some collections failed
      await attemptNetworkRecovery();
      
      if (showToasts) {
        toast.warning(`${failed} coleções não foram inicializadas corretamente. O aplicativo pode não funcionar como esperado.`, {
          duration: 5000,
        });
      }
    } else if (showToasts) {
      toast.success('Inicialização do Firestore concluída com sucesso', {
        duration: 3000,
      });
    }
    
    return overallSuccess;
  } catch (error) {
    console.error('initializeFirestore: Error during Firestore initialization:', error);
    
    if (showToasts) {
      toast.error('Erro na inicialização do Firestore. Verifique a conexão com a internet.', {
        duration: 5000,
      });
    }
    
    return false;
  }
};
