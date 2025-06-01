
import { useState, useCallback, useEffect } from 'react';
import { productUnitsMappingService } from '@/services/supabase/productUnitsMapping';
import { ProductUnitWithMapping } from '@/types/productUnits';

interface UseProductUnitsValidationProps {
  productId?: string;
}

export function useProductUnitsValidation({ productId }: UseProductUnitsValidationProps) {
  const [productUnits, setProductUnits] = useState<ProductUnitWithMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const loadProductUnits = useCallback(async () => {
    if (!productId) {
      setProductUnits([]);
      return;
    }

    try {
      setIsLoading(true);
      setError(null);
      const units = await productUnitsMappingService.getProductUnits(productId);
      setProductUnits(units);
    } catch (err) {
      console.error('Erro ao carregar unidades do produto:', err);
      setError('Erro ao carregar unidades do produto');
      setProductUnits([]);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  useEffect(() => {
    loadProductUnits();
  }, [loadProductUnits]);

  const getMainUnit = useCallback((): ProductUnitWithMapping | null => {
    return productUnits.find(unit => unit.isMainUnit) || productUnits[0] || null;
  }, [productUnits]);

  const getUnitById = useCallback((unitId: string): ProductUnitWithMapping | null => {
    return productUnits.find(unit => unit.id === unitId) || null;
  }, [productUnits]);

  const validateUnitForProduct = useCallback((unitId: string): boolean => {
    return productUnits.some(unit => unit.id === unitId);
  }, [productUnits]);

  const calculateConversionFactor = useCallback(async (fromUnitId: string, toUnitId: string): Promise<number> => {
    try {
      return await productUnitsMappingService.calculateConversionFactor(fromUnitId, toUnitId);
    } catch (error) {
      console.error('Erro ao calcular fator de conversão:', error);
      return 1;
    }
  }, []);

  return {
    productUnits,
    isLoading,
    error,
    loadProductUnits,
    getMainUnit,
    getUnitById,
    validateUnitForProduct,
    calculateConversionFactor
  };
}
