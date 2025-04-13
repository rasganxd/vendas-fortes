
import { useState, useEffect } from 'react';
import { Product } from '@/types';
import { productService } from '@/firebase/firestoreService';
import { toast } from '@/components/ui/use-toast';

// Função para carregar produtos
export const loadProducts = async (): Promise<Product[]> => {
  try {
    return await productService.getAll();
  } catch (error) {
    console.error("Erro ao carregar produtos:", error);
    return [];
  }
};

export const useProducts = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Inicializar produtos quando o componente for montado
  useEffect(() => {
    const fetchProducts = async () => {
      try {
        setIsLoading(true);
        const loadedProducts = await loadProducts();
        setProducts(loadedProducts);
      } catch (error) {
        console.error("Erro ao carregar produtos:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchProducts();
  }, []);

  // Função para encontrar o próximo código disponível
  const getNextProductCode = (): number => {
    if (products.length === 0) return 1;
    
    // Obter o código mais alto existente e adicionar 1
    const highestCode = Math.max(...products.map(product => product.code || 0));
    return highestCode + 1;
  };

  const addProduct = async (product: Omit<Product, 'id'>) => {
    try {
      // Garantir que o produto tenha um código - se não for fornecido, atribuir o próximo disponível
      const productCode = product.code || getNextProductCode();
      const productWithCode = { ...product, code: productCode };
      
      // Adicionar ao Firebase
      const id = await productService.add(productWithCode);
      const newProduct = { ...productWithCode, id };
      
      // Atualizar o estado local
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
      // Nunca permitir que o código seja indefinido ou nulo ao atualizar
      const updateData = { ...product };
      if (updateData.code === undefined || updateData.code === null) {
        const existingProduct = products.find(p => p.id === id);
        if (existingProduct && existingProduct.code) {
          updateData.code = existingProduct.code;
        }
      }
      
      // Atualizar no Firebase
      await productService.update(id, updateData);
      
      // Atualizar o estado local
      setProducts(products.map(p => 
        p.id === id ? { ...p, ...updateData } : p
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
      // Excluir do Firebase
      await productService.delete(id);
      // Atualizar o estado local
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

  // Auxiliar para validar se um desconto é permitido para um produto
  const validateProductDiscount = (productId: string, discountedPrice: number): boolean => {
    const product = products.find(p => p.id === productId);
    if (!product) return true; // Se o produto não for encontrado, permitir (padrão mais seguro)
    
    // Se nenhum desconto máximo definido, permitir qualquer preço
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) return true;
    
    // Se o preço for 0, não permitir (provavelmente um erro)
    if (product.price <= 0) return false;
    
    // Calcular o percentual de desconto real
    const discountPercentage = ((product.price - discountedPrice) / product.price) * 100;
    
    // Verificar se o desconto está dentro da faixa permitida - usando toFixed(2) para comparação precisa
    return parseFloat(discountPercentage.toFixed(2)) <= parseFloat(product.maxDiscountPercentage.toFixed(2));
  };

  // Auxiliar para calcular o preço mínimo com base no desconto máximo
  const getMinimumPrice = (productId: string): number => {
    const product = products.find(p => p.id === productId);
    if (!product) return 0;
    
    if (product.maxDiscountPercentage === undefined || product.maxDiscountPercentage === null) {
      return 0; // Sem preço mínimo se nenhum desconto máximo definido
    }
    
    // Calcular o preço mínimo com base na porcentagem máxima de desconto
    const minimumPrice = product.price * (1 - (product.maxDiscountPercentage / 100));
    return parseFloat(minimumPrice.toFixed(2)); // Arredondar para 2 casas decimais
  };

  return {
    products,
    isLoading,
    setProducts,
    addProduct,
    updateProduct,
    deleteProduct,
    validateProductDiscount,
    getMinimumPrice
  };
};
