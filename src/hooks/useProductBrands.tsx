
import { useState, useEffect } from 'react';
import { ProductBrand } from '@/types';
import { toast } from '@/components/ui/use-toast';

export const useProductBrands = () => {
  const [productBrands, setProductBrands] = useState<ProductBrand[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Mock data for product brands
    const initialProductBrands: ProductBrand[] = [
      { id: '1', name: 'Nestlé', description: 'Marca multinacional de alimentos' },
      { id: '2', name: 'Coca-Cola', description: 'Empresa de bebidas' },
      { id: '3', name: 'OMO', description: 'Marca de produtos de limpeza' },
    ];
    
    setProductBrands(initialProductBrands);
    setIsLoading(false);
  }, []);

  const addProductBrand = async (productBrand: Omit<ProductBrand, 'id'>) => {
    try {
      const newId = Math.random().toString(36).substring(2, 11);
      const newProductBrand = { ...productBrand, id: newId };
      setProductBrands([...productBrands, newProductBrand]);
      toast({
        title: "Marca adicionada",
        description: "Marca adicionada com sucesso!"
      });
      return newId;
    } catch (error) {
      console.error("Erro ao adicionar marca:", error);
      toast({
        title: "Erro ao adicionar marca",
        description: "Houve um problema ao adicionar a marca.",
        variant: "destructive"
      });
      return "";
    }
  };

  const updateProductBrand = async (id: string, productBrand: Partial<ProductBrand>) => {
    try {
      setProductBrands(productBrands.map(pb => 
        pb.id === id ? { ...pb, ...productBrand } : pb
      ));
      toast({
        title: "Marca atualizada",
        description: "Marca atualizada com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao atualizar marca:", error);
      toast({
        title: "Erro ao atualizar marca",
        description: "Houve um problema ao atualizar a marca.",
        variant: "destructive"
      });
    }
  };

  const deleteProductBrand = async (id: string) => {
    try {
      setProductBrands(productBrands.filter(pb => pb.id !== id));
      toast({
        title: "Marca excluída",
        description: "Marca excluída com sucesso!"
      });
    } catch (error) {
      console.error("Erro ao excluir marca:", error);
      toast({
        title: "Erro ao excluir marca",
        description: "Houve um problema ao excluir a marca.",
        variant: "destructive"
      });
    }
  };

  return {
    productBrands,
    isLoading,
    addProductBrand,
    updateProductBrand,
    deleteProductBrand
  };
};
