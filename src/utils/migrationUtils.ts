
import { Order, Customer, Product, SalesRep } from '@/types';
import { orderFirestoreService } from '@/services/firebase/OrderFirestoreService';
import { orderLocalService } from '@/services/local/orderLocalService';
import { toast } from '@/components/ui/use-toast';

/**
 * Migrate orders from LocalStorage to Firebase
 */
export const migrateOrdersToFirebase = async (): Promise<number> => {
  try {
    // Get all orders from LocalStorage
    const localOrders = await orderLocalService.getAll();
    console.log(`Found ${localOrders.length} orders in LocalStorage`);
    
    if (localOrders.length === 0) {
      return 0;
    }
    
    // Migrate to Firebase
    const migratedCount = await orderFirestoreService.migrateFromLocalStorage(localOrders);
    
    console.log(`Successfully migrated ${migratedCount} orders to Firebase`);
    return migratedCount;
  } catch (error) {
    console.error("Error migrating orders to Firebase:", error);
    throw error;
  }
};

/**
 * Run migration for all entities
 */
export const migrateAllDataToFirebase = async (): Promise<void> => {
  try {
    // Start with orders
    const migratedOrdersCount = await migrateOrdersToFirebase();
    
    toast({
      title: "Migração concluída",
      description: `${migratedOrdersCount} pedidos migrados para o Firebase.`
    });
  } catch (error) {
    console.error("Error during migration:", error);
    toast({
      title: "Erro na migração",
      description: "Houve um problema durante a migração dos dados.",
      variant: "destructive"
    });
  }
};
