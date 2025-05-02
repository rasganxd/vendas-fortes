import { useState } from 'react';
import { ProductBrand } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useProductBrands = () => {
  const currentDate = new Date();
  
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([
    { 
      id: '1', 
      name: 'Coca-Cola', 
      description: 'Bebidas Coca-Cola',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate 
    },
    { 
      id: '2', 
      name: 'Ambev', 
      description: 'Cervejas e refrigerantes',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate 
    },
    { 
      id: '3', 
      name: 'Nestlé', 
      description: 'Alimentos e bebidas',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate 
    },
    { 
      id: '4', 
      name: 'Unilever', 
      description: 'Produtos de limpeza e higiene',
      notes: '',
      createdAt: currentDate,
      updatedAt: currentDate 
    }
  ]);
  const [isLoading, setIsLoading] = useState(false);

  const addProductBrand = async (brand: Omit<ProductBrand, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 9);
      const newBrand: ProductBrand = { 
        ...brand, 
        id: newId,
        notes: brand.notes || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      setProductBrands([...productBrands, newBrand]);
      toast({
        title: "Marca adicionada",
        description: "Marca de produto adicionada com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar marca:", error);
      toast({
        title: "Erro ao adicionar",
        description: "Não foi possível adicionar a marca de produtos.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductBrand = async (id: string, brand: Partial<ProductBrand>) => {
    try {
      setProductBrands(
        productBrands.map(pb => (pb.id === id ? { 
          ...pb, 
          ...brand,
          updatedAt: new Date()
        } : pb))
      );
      toast({
        title: "Marca atualizada",
        description: "Marca de produto atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar marca:", error);
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar a marca de produtos.",
        variant: "destructive"
      });
    }
  };

  const deleteProductBrand = async (id: string) => {
    try {
      setProductBrands(productBrands.filter(pb => pb.id !== id));
      toast({
        title: "Marca excluída",
        description: "Marca de produto excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir a marca de produtos.",
        variant: "destructive"
      });
    }
  };

  return {
    productBrands,
    isLoading,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand,
    setProductBrands
  };
};
