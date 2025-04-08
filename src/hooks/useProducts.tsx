
import { Product } from '@/types';
import { productService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';
import { useAppContext } from './useAppContext';

export const loadProducts = async (): Promise<Product[]> => {
  try {
    return await productService.getAll();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }
};

export const useProducts = () => {
  const { products, setProducts } = useAppContext();

  // Function to find the next available code
  const getNextProductCode = (): number => {
    if (products.length === 0) return 1;
    
    // Get the highest existing code and add 1
    const highestCode = Math.max(...products.map(product => product.code || 0));
    return highestCode + 1;
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Assign the next available code if not provided
      const nextCode = product.code || getNextProductCode();
      const productWithCode = { ...product, code: nextCode };
      
      // Add to Firebase
      const id = await productService.add(productWithCode);
      const newProduct = { ...productWithCode, id };
      
      // Update local state
      setProducts([...products, newProduct]);
      toast({
        title: "Produto adicionado",
        description: "Produto adicionado com sucesso!"
      });
      return id;
    } catch (error) {
      console.error("Erro ao adicionar produto:", error);
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
      // Update in Firebase
      await productService.update(id, product);
      // Update local state
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...product } : p
      ));
      toast({
        title: "Produto atualizado",
        description: "Produto atualizado com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar produto:", error);
      toast({
        title: "Erro ao atualizar produto",
        description: "Houve um problema ao atualizar o produto.",
        variant: "destructive"
      });
    }
  };

  const deleteProduct = async (id: string) => {
    try {
      // Delete from Firebase
      await productService.delete(id);
      // Update local state
      setProducts(products.filter(p => p.id !== id));
      toast({
        title: "Produto excluído",
        description: "Produto excluído com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir produto:", error);
      toast({
        title: "Erro ao excluir produto",
        description: "Houve um problema ao excluir o produto.",
        variant: "destructive"
      });
    }
  };

  return {
    products,
    addProduct,
    updateProduct,
    deleteProduct
  };
};
