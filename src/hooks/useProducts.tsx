
import { useState, useEffect } from 'react';
import { Product } from '@/types/product';
import { productService } from '@/services/supabase/productService';
import { toast } from 'sonner';

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const loadProducts = async () => {
    try {
      setIsLoading(true);
      const data = await productService.getAll();
      setProducts(data);
    } catch (error) {
      console.error('Erro ao carregar produtos:', error);
      toast.error('Erro ao carregar produtos');
    } finally {
      setIsLoading(false);
    }
  };

  const createProduct = async (product: Omit<Product, 'id' | 'createdAt' | 'updatedAt'>) => {
    try {
      const newProduct = await productService.create(product);
      setProducts(prev => [...prev, newProduct]);
      toast.success('Produto criado com sucesso');
      return newProduct;
    } catch (error) {
      console.error('Erro ao criar produto:', error);
      toast.error('Erro ao criar produto');
      throw error;
    }
  };

  const updateProduct = async (id: string, product: Partial<Omit<Product, 'id' | 'createdAt' | 'updatedAt'>>) => {
    try {
      const updatedProduct = await productService.update(id, product);
      setProducts(prev => prev.map(p => p.id === id ? updatedProduct : p));
      toast.success('Produto atualizado com sucesso');
      return updatedProduct;
    } catch (error) {
      console.error('Erro ao atualizar produto:', error);
      toast.error('Erro ao atualizar produto');
      throw error;
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      await productService.delete(id);
      setProducts(prev => prev.filter(p => p.id !== id));
      toast.success('Produto excluído com sucesso');
    } catch (error) {
      console.error('Erro ao excluir produto:', error);
      toast.error('Erro ao excluir produto');
      throw error;
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  return {
    products,
    isLoading,
    createProduct,
    updateProduct,
    deleteProduct,
    refreshProducts: loadProducts
  };
};
