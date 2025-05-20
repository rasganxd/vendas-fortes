
import { loadCustomers } from "@/hooks/useCustomers";
import { fetchProducts } from "@/hooks/useProducts";
import { loadOrders } from "@/hooks/useOrders";
import { Customer, Product, Order } from '@/types';
import { toast } from "@/components/ui/use-toast";

/**
 * Loads core application data (customers and products)
 * Modified to use Firebase exclusively
 */
export const loadCoreData = async (
  setIsLoadingCustomers: React.Dispatch<React.SetStateAction<boolean>>,
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setIsUsingMockData: React.Dispatch<React.SetStateAction<boolean>>,
  setIsLoadingProducts: React.Dispatch<React.SetStateAction<boolean>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  try {
    console.log("Fetching core application data from Firebase...");
    
    // Start loading customers
    setIsLoadingCustomers(true);
    let loadedCustomers: Customer[] = [];
    try {
      loadedCustomers = await loadCustomers();
      console.log(`Loaded ${loadedCustomers.length} customers from Firebase`);
      setCustomers(loadedCustomers);
    } catch (error) {
      console.error("Failed to load customers from Firebase:", error);
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
      console.log("About to load products from Firebase...");
      const loadedProducts = await fetchProducts();
      console.log(`Loaded ${loadedProducts.length} products from Firebase`);
      
      // Always make sure we update the state even if empty array
      if (loadedProducts && loadedProducts.length > 0) {
        setProducts(loadedProducts);
        console.log("Set products:", loadedProducts.length);
      } else {
        console.log("No products loaded, using empty array");
        setProducts([]);
      }
    } catch (error) {
      console.error("Failed to load products from Firebase:", error);
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
    
    // We're no longer using mock data
    setIsUsingMockData(false);
    return false;
  } catch (error) {
    console.error("Error loading core data from Firebase:", error);
    toast({
      title: "Erro ao carregar dados",
      description: "Houve um problema ao carregar os dados do sistema.",
      variant: "destructive"
    });
    setIsUsingMockData(false);
    return false;
  }
};

/**
 * Loads data from localStorage if available - now just clears any mock data
 */
export const loadFromLocalStorage = (
  setCustomers: React.Dispatch<React.SetStateAction<Customer[]>>,
  setProducts: React.Dispatch<React.SetStateAction<Product[]>>
) => {
  // Import clearDemoData to ensure no mock data is used
  import('@/utils/clearDemoData').then(({ clearDemoData }) => {
    clearDemoData();
  });
};
