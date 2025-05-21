
import { db } from '@/services/firebase/config';
import { collection, getDocs, query, where, deleteDoc, doc } from 'firebase/firestore';
import { initializeFirestore } from '@/services/firebase/initializeFirestore';
import { toast } from 'sonner';

/**
 * Utility function to clear all demo data from localStorage and Firestore
 */
export const clearDemoData = async (showToasts = false): Promise<boolean> => {
  console.log("Clearing all demo data from localStorage and Firestore...");
  let success = true;
  
  // First clear localStorage
  clearLocalStorageData();
  
  // Then try to clear Firestore temporary initialization documents
  try {
    await clearFirestoreInitDocs(showToasts);
  } catch (error) {
    console.error("Error clearing Firestore initialization documents:", error);
    if (showToasts) {
      toast.error("Erro ao limpar documentos de inicialização do Firestore.");
    }
    success = false;
  }
  
  // Try to reinitialize Firestore with clean collections
  try {
    await initializeFirestore(showToasts);
  } catch (error) {
    console.error("Error reinitializing Firestore:", error);
    if (showToasts) {
      toast.error("Erro ao reinicializar o Firestore.");
    }
    success = false;
  }
  
  return success;
};

/**
 * Utility to clear all data from localStorage
 */
const clearLocalStorageData = (): void => {
  // List of keys used for demo data
  const demoDataKeys = [
    'customers',
    'products',
    'orders',
    'sales_reps',
    'app_customers_cache',
    'app_customers_cache_timestamp',
    'app_products_cache',
    'app_products_cache_timestamp',
    'customer_data',
    'product_data',
    'order_data',
    'sync_logs',
    'last_sync', 
    'sync_status'
  ];
  
  // Clear each key
  demoDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Cleared ${key} from localStorage`);
    }
  });
  
  // Ensure all empty arrays are saved for collections to prevent blank entries
  const collectionsToReset = ['customers', 'products', 'orders', 'sales_reps', 'sync_logs'];
  collectionsToReset.forEach(key => {
    localStorage.setItem(key, JSON.stringify([]));
    console.log(`Reset ${key} to empty array`);
  });
  
  console.log("All demo data cleared successfully from localStorage");
};

/**
 * Utility to clear all temporary initialization documents from Firestore
 */
const clearFirestoreInitDocs = async (showToasts = false): Promise<void> => {
  console.log("Clearing temporary initialization documents from Firestore...");
  
  // List of collections to clear temp docs from
  const collections = [
    'payments',
    'payment_methods',
    'payment_tables',
    'orders',
    'customers',
    'products',
    'sales_reps',
    'product_categories',
    'product_brands',
    'product_groups',
    'sync_logs'
  ];
  
  // Process each collection
  for (const collectionName of collections) {
    try {
      console.log(`Clearing temporary docs from ${collectionName}...`);
      const collectionRef = collection(db, collectionName);
      
      // Get all documents in the collection
      const querySnapshot = await getDocs(collectionRef);
      
      // Check if collection is empty
      if (querySnapshot.empty) {
        console.log(`Collection ${collectionName} is empty, no need to clear.`);
        continue;
      }
      
      // Count of deleted docs
      let deletedCount = 0;
      
      // Delete each temporary document
      for (const docSnapshot of querySnapshot.docs) {
        const data = docSnapshot.data();
        
        // Check if it's a temporary initialization document
        if (data._temp === true || data._initialized) {
          await deleteDoc(doc(db, collectionName, docSnapshot.id));
          deletedCount++;
        } else if (Object.keys(data).length === 0) {
          // Also delete empty documents
          await deleteDoc(doc(db, collectionName, docSnapshot.id));
          deletedCount++;
        }
      }
      
      console.log(`Deleted ${deletedCount} temporary documents from ${collectionName}`);
      
      if (showToasts && deletedCount > 0) {
        toast.success(`${deletedCount} documentos temporários foram removidos de ${collectionName}`);
      }
    } catch (error) {
      console.error(`Error clearing temporary docs from ${collectionName}:`, error);
      if (showToasts) {
        toast.error(`Erro ao limpar documentos temporários de ${collectionName}`);
      }
    }
  }
  
  console.log("Finished clearing temporary documents from Firestore");
};

/**
 * Utility to check if the app is using local storage data 
 */
export const isUsingLocalData = (): boolean => {
  // Check for local data keys
  const localKeys = [
    'app_customers_cache',
    'app_products_cache',
    'sales_reps',
    'sync_logs'
  ];
  
  // Return true if any local data key exists in localStorage
  return localKeys.some(key => localStorage.getItem(key) !== null);
};
