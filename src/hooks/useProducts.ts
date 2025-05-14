import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/supabase/productService';
import { toast } from '@/components/ui/use-toast';
import { transformProductData, transformArray } from '@/utils/dataTransformers';

// Export this for compatibility with existing code
export const fetchProducts = async (): Promise<Product[]> => {
  try {
    const result = await productService.getAll();
    if (Array.isArray(result)) {
      return transformArray(result, transformProductData) as Product[];
    }
    console.error('Product fetch did not return an array:', result);
    return [];
  } catch (error) {
    console.error('Error fetching products:', error);
    throw error;
  }
};

// Export the fetchProducts function as loadProducts for backward compatibility
export const loadProducts = fetchProducts;

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      setIsLoading(true);
      try {
        const productsData = await fetchProducts();
        setProducts(productsData);
      } catch (error) {
        console.error("Error loading products:", error);
        toast({
          title: "Erro ao carregar produtos",
          description: "Houve um problema ao carregar os produtos.",
          variant: "destructive"
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadProducts();
  }, []);

  const addProduct = async (product: Omit<Product, 'id'>): Promise<string> => {
    try {
      const id = await productService.add(product);
      const newProduct = { ...product, id } as Product;
      setProducts(prev => [...prev, newProduct]);
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Error adding product:", error);
      toast({
        title: "Erro ao adicionar produto",
        description: "Houve um problema ao adicionar o produto.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProduct = async (id: string, product: Partial<Product>) => {
    try {
      await productService.update(id, product);
      setProducts(prev =>
        prev.map(p => (p.id === id ? { ...p, ...product } : p))
      );
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Error updating product:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Houve um problema ao atualizar o produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Error deleting product:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Houve um problema ao excluir o produto.",
        variant: "destructive"
      });
    }
  };
  
  return {
    products,
    isLoading,
    addProduct,
    updateProduct,
    deleteProduct,
    setProducts
  };
};
