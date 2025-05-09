
import { db } from '@/firebase/config';
import { collection, getDocs, doc, getDoc } from 'firebase/firestore';
import { supabase, toSnakeCase } from '@/services/supabaseService';
import { toast } from '@/components/ui/use-toast';

// Convert Firestore document to Supabase record
const convertFirestoreToSupabase = (doc: any) => {
  const data = doc.data();
  
  // Convert Firestore timestamps to ISO strings (Supabase will accept these)
  const convertedData = { ...data };
  for (const key in convertedData) {
    if (convertedData[key] && convertedData[key].toDate && typeof convertedData[key].toDate === 'function') {
      convertedData[key] = convertedData[key].toDate().toISOString();
    }
  }
  
  return {
    ...convertedData,
    id: doc.id
  };
};

// Migrate a specific collection from Firestore to Supabase
export const migrateCollection = async (
  firestoreCollection: string, 
  supabaseTable: string, 
  transform?: (data: any) => any
): Promise<{success: boolean, count: number}> => {
  try {
    console.log(`Migrating collection ${firestoreCollection} to table ${supabaseTable}...`);
    
    // Get all documents from Firestore collection
    const querySnapshot = await getDocs(collection(db, firestoreCollection));
    
    if (querySnapshot.empty) {
      console.log(`Collection ${firestoreCollection} is empty. Nothing to migrate.`);
      return {success: true, count: 0};
    }
    
    // Convert to Supabase format
    const records = querySnapshot.docs.map(doc => {
      const baseData = convertFirestoreToSupabase(doc);
      return transform ? transform(baseData) : baseData;
    });
    
    // Convert to snake_case (Supabase convention)
    const snakeCaseRecords = records.map(record => toSnakeCase(record));
    
    // Insert into Supabase
    const { error } = await supabase
      .from(supabaseTable)
      .insert(snakeCaseRecords);
      
    if (error) {
      console.error(`Error migrating collection ${firestoreCollection}:`, error);
      return {success: false, count: 0};
    }
    
    console.log(`Migrated ${records.length} records from ${firestoreCollection} to ${supabaseTable}`);
    return {success: true, count: records.length};
  } catch (error) {
    console.error(`Error in migration of collection ${firestoreCollection}:`, error);
    return {success: false, count: 0};
  }
};

// Migrate order items separately (they need special handling)
export const migrateOrderItems = async (): Promise<{success: boolean, count: number}> => {
  try {
    console.log("Migrating order items...");
    
    // Get all orders from Firestore
    const querySnapshot = await getDocs(collection(db, 'orders'));
    let orderItemsCount = 0;
    
    // For each order, extract items and save to order_items table
    for (const orderDoc of querySnapshot.docs) {
      const orderId = orderDoc.id;
      const data = orderDoc.data();
      
      if (data.items && Array.isArray(data.items)) {
        // Prepare items with order ID
        const orderItems = data.items.map(item => ({
          ...item,
          order_id: orderId
        }));
        
        // Insert order items into Supabase
        const { error: itemsError } = await supabase
          .from('order_items')
          .insert(orderItems.map(item => toSnakeCase(item)));
          
        if (itemsError) {
          console.error(`Error migrating items for order ${orderId}:`, itemsError);
        } else {
          orderItemsCount += orderItems.length;
        }
      }
    }
    
    console.log(`Migrated ${orderItemsCount} order items`);
    return {success: true, count: orderItemsCount};
  } catch (error) {
    console.error("Error migrating order items:", error);
    return {success: false, count: 0};
  }
};

// Migrate all data from Firebase to Supabase
export const migrateAllData = async (): Promise<{success: boolean, results: Record<string, any>}> => {
  const results: Record<string, any> = {};
  let allSuccess = true;
  
  try {
    // First migrate the tables without dependencies
    const basicCollections = [
      {firestore: 'customers', supabase: 'customers'},
      {firestore: 'products', supabase: 'products'},
      {firestore: 'salesReps', supabase: 'sales_reps'},
      {firestore: 'vehicles', supabase: 'vehicles'},
      {firestore: 'productGroups', supabase: 'product_groups'},
      {firestore: 'productCategories', supabase: 'product_categories'},
      {firestore: 'productBrands', supabase: 'product_brands'},
      {firestore: 'paymentMethods', supabase: 'payment_methods'},
      {firestore: 'paymentTables', supabase: 'payment_tables'}
    ];
    
    // Migrate basic collections
    for (const collection of basicCollections) {
      const result = await migrateCollection(collection.firestore, collection.supabase);
      results[collection.firestore] = result;
      if (!result.success) {
        allSuccess = false;
      }
    }
    
    // Migrate orders
    const ordersResult = await migrateCollection('orders', 'orders');
    results.orders = ordersResult;
    if (!ordersResult.success) {
      allSuccess = false;
    }
    
    // Migrate order items separately
    const orderItemsResult = await migrateOrderItems();
    results.orderItems = orderItemsResult;
    if (!orderItemsResult.success) {
      allSuccess = false;
    }
    
    // Migrate other complex collections
    const complexCollections = [
      {firestore: 'payments', supabase: 'payments'},
      {firestore: 'loads', supabase: 'loads'},
      {firestore: 'routes', supabase: 'routes'}
    ];
    
    for (const collection of complexCollections) {
      const result = await migrateCollection(collection.firestore, collection.supabase);
      results[collection.firestore] = result;
      if (!result.success) {
        allSuccess = false;
      }
    }
    
    if (allSuccess) {
      toast({
        title: "Migração concluída",
        description: "Todos os dados foram migrados com sucesso para o Supabase!"
      });
    } else {
      toast({
        title: "Migração parcial",
        description: "Alguns dados não puderam ser migrados. Verifique o console para mais detalhes.",
        variant: "destructive"
      });
    }
    
    return {
      success: allSuccess,
      results
    };
  } catch (error) {
    console.error("Fatal error during migration:", error);
    toast({
      title: "Erro na migração",
      description: "Houve um erro durante a migração dos dados. Verifique o console para mais detalhes.",
      variant: "destructive"
    });
    
    return {
      success: false,
      results
    };
  }
};
