
import { loadCustomers } from "@/hooks/useCustomers";
import { Customer, Product } from '@/types';
import { toast } from "@/components/ui/use-toast";
import { productService } from '@/services/supabase/productService';

/**
 * Loads core application data (customers and products)
 * Modified to use Supabase exclusively
 */
export const loadCoreData = async (
  setIsLoadingCustomers: React.Dispatch<React.SetStateAction<boolean>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setIsLoadingProducts: React.Dispatch<React.SetStateAction<boolean>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    console.log("Fetching core application data from Supabase...");
    
    // Start loading customers
    setIsLoadingCustomers(true);
    let loadedCustomers: Customer[] = [];
    try {
      loadedCustomers = await loadCustomers();
      console.log(`Loaded ${loadedCustomers.length} customers from Supabase`);
      setCustomers(loadedCustomers);
    } catch (error) {
      console.error("Failed to load customers from Supabase:", error);
      setCustomers([]);
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar os clientes.",
        variant: "destructive"
      });
    } finally {
      setIsLoadingCustomers(false);
    }
    
    // Start loading products
    setIsLoadingProducts(true);
    try {
      console.log("About to load products from Supabase...");
      const loadedProducts = await productService.getAll();
      console.log(`Loaded ${loadedProducts.length} products from Supabase`);
      
      // Always make sure we update the state even if empty array
      if (loadedProducts && loadedProducts.length > 0) {
        setProducts(loadedProducts);
        console.log("Set products:", loadedProducts.length);
      } else {
        console.log("No products loaded, using empty array");
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load products from Supabase:", error);
      setProducts([]);
      toast({
        title: "Erro ao carregar produtos",
        description: "Não foi possível carregar os produtos.",
        variant: "destructive"
      });
    } finally {
      console.log("Finished loading products, setting isLoadingProducts to false");
      setIsLoadingProducts(false);
    }
    
    return false;
  } catch (error) {
    console.error("Error loading core data from Supabase:", error);
    toast({
      title: "Erro ao carregar dados",
      description: "Houve um problema ao carregar os dados do sistema.",
      variant: "destructive"
    });
    return false;
  }
};

/**
 * Loads data from localStorage if available - now just clears any demo data
 */
export const loadFromLocalStorage = (
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  // Import clearDemoData to ensure no demo data is used
  import('@/utils/clearDemoData').then(({ clearDemoData }) => {
    clearDemoData();
  });
  
  // Set empty arrays for data
  setCustomers([]);
  setProducts([]);
};
