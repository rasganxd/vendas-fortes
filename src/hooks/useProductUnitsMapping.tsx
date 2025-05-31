
import { useState, useEffect } from 'react';
import { ProductUnitWithMapping } from '@/types/productUnits';
import { productUnitsMappingService } from '@/services/supabase/productUnitsMapping';
import { toast } from 'sonner';

export const useProductUnitsMapping = (productId?: string) => {
  const [productUnits, setProductUnits] = useState<ProductUnitWithMapping[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [mainUnit, setMainUnit] = useState<ProductUnitWithMapping | null>(null);
  const [error, setError] = useState<string | null>(null);

  const loadProductUnits = async (pId: string) => {
    if (!pId) {
      console.log("⚠️ useProductUnitsMapping: ID do produto não fornecido");
      return;
    }
    
    console.log("🔄 useProductUnitsMapping: Carregando unidades para produto:", pId);
    setIsLoading(true);
    setError(null);
    
    try {
      const units = await productUnitsMappingService.getProductUnits(pId);
      console.log("✅ useProductUnitsMapping: Unidades carregadas:", units);
      
      setProductUnits(units);
      const mainUnitFound = units.find(unit => unit.isMainUnit) || null;
      setMainUnit(mainUnitFound);
      
      console.log("👑 useProductUnitsMapping: Unidade principal encontrada:", mainUnitFound?.value || 'Nenhuma');
      
    } catch (error) {
      console.error('❌ useProductUnitsMapping: Erro ao carregar unidades do produto:', error);
      setError('Erro ao carregar unidades do produto');
      toast("Erro ao carregar unidades do produto");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    console.log("🎯 useProductUnitsMapping: Effect disparado com productId:", productId);
    
    if (productId) {
      loadProductUnits(productId);
    } else {
      console.log("🧹 useProductUnitsMapping: Limpando estado (sem productId)");
      setProductUnits([]);
      setMainUnit(null);
      setError(null);
    }
  }, [productId]);

  const addUnitToProduct = async (unitId: string, isMainUnit: boolean = false) => {
    if (!productId) {
      console.error("❌ useProductUnitsMapping: Tentativa de adicionar unidade sem productId");
      return;
    }
    
    console.log("➕ useProductUnitsMapping: Adicionando unidade:", { productId, unitId, isMainUnit });
    
    try {
      await productUnitsMappingService.addUnitToProduct(productId, unitId, isMainUnit);
      await loadProductUnits(productId);
      toast("Unidade adicionada ao produto com sucesso");
    } catch (error) {
      console.error('❌ useProductUnitsMapping: Erro ao adicionar unidade:', error);
      toast("Erro ao adicionar unidade ao produto");
    }
  };

  const removeUnitFromProduct = async (unitId: string) => {
    if (!productId) {
      console.error("❌ useProductUnitsMapping: Tentativa de remover unidade sem productId");
      return;
    }
    
    console.log("🗑️ useProductUnitsMapping: Removendo unidade:", { productId, unitId });
    
    try {
      await productUnitsMappingService.removeUnitFromProduct(productId, unitId);
      await loadProductUnits(productId);
      toast("Unidade removida do produto com sucesso");
    } catch (error) {
      console.error('❌ useProductUnitsMapping: Erro ao remover unidade:', error);
      toast("Erro ao remover unidade do produto");
    }
  };

  const setMainUnitForProduct = async (unitId: string) => {
    if (!productId) {
      console.error("❌ useProductUnitsMapping: Tentativa de definir unidade principal sem productId");
      return;
    }
    
    console.log("👑 useProductUnitsMapping: Definindo unidade principal:", { productId, unitId });
    
    try {
      await productUnitsMappingService.setMainUnit(productId, unitId);
      await loadProductUnits(productId);
      toast("Unidade principal definida com sucesso");
    } catch (error) {
      console.error('❌ useProductUnitsMapping: Erro ao definir unidade principal:', error);
      toast("Erro ao definir unidade principal");
    }
  };

  const calculateUnitPrice = async (basePrice: number, fromUnitId: string, toUnitId: string): Promise<number> => {
    try {
      const factor = await productUnitsMappingService.calculateConversionFactor(fromUnitId, toUnitId);
      return basePrice / factor;
    } catch (error) {
      console.error('❌ useProductUnitsMapping: Erro ao calcular preço da unidade:', error);
      return basePrice;
    }
  };

  return {
    productUnits,
    mainUnit,
    isLoading,
    error,
    addUnitToProduct,
    removeUnitFromProduct,
    setMainUnitForProduct,
    calculateUnitPrice,
    refreshProductUnits: () => productId ? loadProductUnits(productId) : Promise.resolve()
  };
};
