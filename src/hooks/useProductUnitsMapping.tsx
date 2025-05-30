
import { useState, useEffect } from 'react';
import { ProductUnitWithMapping } from '@/types/productUnits';
import { productUnitsMappingService } from '@/services/supabase/productUnitsMapping';
import { toast } from 'sonner';

export const useProductUnitsMapping = (productId?: string) => {
  const [productUnits, setProductUnits] = useState<ProductUnitWithMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mainUnit, setMainUnit] = useState<ProductUnitWithMapping | null>(null);

  const loadProductUnits = async (pId: string) => {
    if (!pId) return;
    
    setIsLoading(true);
    try {
      const units = await productUnitsMappingService.getProductUnits(pId);
      setProductUnits(units);
      setMainUnit(units.find(unit => unit.isMainUnit) || null);
    } catch (error) {
      console.error('Erro ao carregar unidades do produto:', error);
      toast("Erro ao carregar unidades do produto");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (productId) {
      loadProductUnits(productId);
    }
  }, [productId]);

  const addUnitToProduct = async (unitId: string, isMainUnit: boolean = false) => {
    if (!productId) return;
    
    try {
      await productUnitsMappingService.addUnitToProduct(productId, unitId, isMainUnit);
      await loadProductUnits(productId);
      toast("Unidade adicionada ao produto com sucesso");
    } catch (error) {
      console.error('Erro ao adicionar unidade ao produto:', error);
      toast("Erro ao adicionar unidade ao produto");
    }
  };

  const removeUnitFromProduct = async (unitId: string) => {
    if (!productId) return;
    
    try {
      await productUnitsMappingService.removeUnitFromProduct(productId, unitId);
      await loadProductUnits(productId);
      toast("Unidade removida do produto com sucesso");
    } catch (error) {
      console.error('Erro ao remover unidade do produto:', error);
      toast("Erro ao remover unidade do produto");
    }
  };

  const setMainUnitForProduct = async (unitId: string) => {
    if (!productId) return;
    
    try {
      await productUnitsMappingService.setMainUnit(productId, unitId);
      await loadProductUnits(productId);
      toast("Unidade principal definida com sucesso");
    } catch (error) {
      console.error('Erro ao definir unidade principal:', error);
      toast("Erro ao definir unidade principal");
    }
  };

  const calculateUnitPrice = async (basePrice: number, fromUnitId: string, toUnitId: string): Promise<number> => {
    try {
      const factor = await productUnitsMappingService.calculateConversionFactor(fromUnitId, toUnitId);
      return basePrice / factor;
    } catch (error) {
      console.error('Erro ao calcular preço da unidade:', error);
      return basePrice;
    }
  };

  return {
    productUnits,
    mainUnit,
    isLoading,
    addUnitToProduct,
    removeUnitFromProduct,
    setMainUnitForProduct,
    calculateUnitPrice,
    refreshProductUnits: () => productId ? loadProductUnits(productId) : Promise.resolve()
  };
};
