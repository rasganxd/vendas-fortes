import { toast } from '@/components/ui/use-toast';
import { db } from '@/services/firebase/config';
import { Customer, Product, ProductCategory, ProductBrand, ProductGroup, SalesRep, Vehicle, DeliveryRoute, PaymentTable } from '@/types';
import { collection, getDocs, addDoc, Timestamp } from 'firebase/firestore';

/**
 * Migrate data from localStorage to Firebase
 */
export const migrateLocalStorageToFirebase = async (): Promise<void> => {
  try {
    toast({
      title: "Iniciando migração",
      description: "Migrando dados do localStorage para o Firebase..."
    });

    // Migrate customers
    await migrateCollection('customers');
    
    // Migrate products
    await migrateCollection('products');
    
    // Migrate product categories
    await migrateCollection('product_categories');
    
    // Migrate product brands
    await migrateCollection('product_brands');
    
    // Migrate product groups
    await migrateCollection('product_groups');
    
    // Migrate sales reps
    await migrateCollection('sales_reps');
    
    // Migrate payment tables
    await migrateCollection('payment_tables');
    
    // Migrate delivery routes
    await migrateCollection('delivery_routes');

    toast({
      title: "Migração concluída",
      description: "Todos os dados foram migrados para o Firebase com sucesso!"
    });
  } catch (error) {
    console.error("Error in migration:", error);
    toast({
      variant: "destructive",
      title: "Erro na migração",
      description: `Houve um problema ao migrar os dados: ${error instanceof Error ? error.message : 'Erro desconhecido'}`
    });
  }
};

/**
 * Migrate a specific collection from localStorage to Firebase
 * @param collectionName The name of the collection to migrate
 */
const migrateCollection = async (collectionName: string): Promise<void> => {
  try {
    console.log(`Migrating ${collectionName}...`);
    
    // Get data from localStorage
    const storageKey = `app_${collectionName}`;
    const data = localStorage.getItem(storageKey);
    
    if (!data) {
      console.log(`No data found for ${collectionName}`);
      return;
    }
    
    const items = JSON.parse(data);
    
    if (!Array.isArray(items) || items.length === 0) {
      console.log(`No items to migrate for ${collectionName}`);
      return;
    }
    
    console.log(`Found ${items.length} items for ${collectionName}`);
    
    // Check if items already exist in Firebase
    const firestoreCollection = collection(db, collectionName);
    const existingDocs = await getDocs(firestoreCollection);
    
    if (!existingDocs.empty) {
      console.log(`Collection ${collectionName} already has data in Firebase. Skipping...`);
      return;
    }
    
    // Convert dates and migrate data
    for (const item of items) {
      const processedItem = convertDatesToTimestamps(item);
      await addDoc(firestoreCollection, processedItem);
    }
    
    console.log(`Successfully migrated ${items.length} items to ${collectionName} in Firebase`);
  } catch (error) {
    console.error(`Error migrating ${collectionName}:`, error);
    throw error;
  }
};

/**
 * Convert JavaScript Date objects to Firestore Timestamps
 */
const convertDatesToTimestamps = (obj: any): any => {
  const result: any = {};
  
  for (const key in obj) {
    const value = obj[key];
    
    if (value instanceof Date || (typeof value === 'string' && !isNaN(Date.parse(value)))) {
      // Convert Date objects or date strings to Firestore Timestamps
      result[key] = Timestamp.fromDate(new Date(value));
    } else if (value && typeof value === 'object' && !Array.isArray(value)) {
      // Recursively convert dates in nested objects
      result[key] = convertDatesToTimestamps(value);
    } else if (Array.isArray(value)) {
      // Convert dates in arrays
      result[key] = value.map(item => {
        if (item && typeof item === 'object') {
          return convertDatesToTimestamps(item);
        }
        return item;
      });
    } else {
      // Keep other values as is
      result[key] = value;
    }
  }
  
  return result;
};

/**
 * This file is now simplified since we're using Firebase directly and not migrating data
 */

export const migrateOrdersToFirebase = async (): Promise<number> => {
  // Since we're not migrating data anymore, this just returns 0
  return 0;
};

export const migrateAllDataToFirebase = async (): Promise<void> => {
  toast({
    title: "Firebase Integração",
    description: "O aplicativo agora está usando o Firebase diretamente. Não é necessária migração."
  });
};
