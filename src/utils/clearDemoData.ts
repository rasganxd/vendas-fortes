
/**
 * Utility function to clear all demo data from localStorage
 */
export const clearDemoData = () => {
  console.log("Clearing all demo data from localStorage...");
  
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
    'mockCustomers',
    'mockProducts',
    'mockOrders',
    'mockSalesReps'
  ];
  
  // Clear each key
  demoDataKeys.forEach(key => {
    if (localStorage.getItem(key)) {
      localStorage.removeItem(key);
      console.log(`Cleared ${key} from localStorage`);
    }
  });
  
  console.log("All demo data cleared successfully");
};
