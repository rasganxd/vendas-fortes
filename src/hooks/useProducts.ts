
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/services/supabase/productService';
import { toast } from '@/components/ui/use-toast';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const loadProducts = async () => {
      try {
        setIsLoading(true);
        const data = await productService.getAll();
        setProducts(data);
      } catch (error) {
        console.error('Error loading products:', error);
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

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      const id = await productService.add(product);
      const newProduct = { ...product, id };
      setProducts([...products, newProduct]);
      
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso!"
      });
      
      return id;
    } catch (error) {
      console.error('Error adding product:', error);
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
      setProducts(products.map(p => p.id === id ? { ...p, ...product } : p));
      
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error('Error updating product:', error);
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
      setProducts(products.filter(p => p.id !== id));
      
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error('Error deleting product:', error);
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
