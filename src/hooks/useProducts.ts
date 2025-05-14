import { useQuery } from "@tanstack/react-query";
import { productService } from "@/services/supabase";
import { Product } from "@/types";
import { transformProductData } from "@/utils/dataTransformers";

// Simple UUID validation function
const isValidUuid = (id: string): boolean => {
  const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
  return uuidRegex.test(id);
};

const staleTime = 5 * 60 * 1000; // 5 minutes

export const useProducts = () => {
  return useQuery({
    queryKey: ['products'],
    queryFn: async () => {
      const { data, error } = await productService.getAll();

      if (error) {
        console.error("Error fetching products:", error);
        throw new Error(`Failed to fetch products: ${error.message}`);
      }

      return data.map(transformProductData) as Product[];
    },
    staleTime: staleTime,
  });
};

export const useProduct = (id: string) => {
  return useQuery({
    queryKey: ['products', id],
    queryFn: async () => {
      if (!isValidUuid(id)) {
        throw new Error("Invalid Product ID");
      }

      const { data, error } = await productService.getById(id);

      if (error) {
        console.error(`Error fetching product with ID ${id}:`, error);
        throw new Error(`Failed to fetch product with ID ${id}: ${error.message}`);
      }

      return transformProductData(data) as Product;
    },
    staleTime: staleTime,
    enabled: !!id, // only run query if ID is set
  });
};
