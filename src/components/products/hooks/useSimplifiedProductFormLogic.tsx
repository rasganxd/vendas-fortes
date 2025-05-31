
import { useState, useEffect, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from '@/types';
import { ProductUnit, ProductUnitsFormData } from '@/types/productUnits';
import { useProductUnits } from './useProductUnits';
import { toast } from "sonner";

const productFormSchema = z.object({
  code: z.number().min(1, "Código deve ser maior que zero"),
  name: z.string().min(2, "Nome deve ter pelo menos 2 caracteres"),
  cost: z.number().min(0, "Custo deve ser maior ou igual a zero"),
  stock: z.number().optional(),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  brandId: z.string().optional(),
  primaryUnitId: z.string().min(1, "Unidade principal é obrigatória"),
});

export type SimplifiedProductFormData = z.infer<typeof productFormSchema> & ProductUnitsFormData;

interface UseSimplifiedProductFormLogicProps {
  isEditing: boolean;
  selectedProduct: Product | null;
  products: Product[];
  onSubmit: (data: SimplifiedProductFormData) => Promise<void>;
  existingUnits?: any[];
  existingMainUnit?: any;
}

export const useSimplifiedProductFormLogic = ({
  isEditing,
  selectedProduct,
  products,
  onSubmit,
  existingUnits = [],
  existingMainUnit = null
}: UseSimplifiedProductFormLogicProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [primaryUnit, setPrimaryUnit] = useState<ProductUnit | null>(null);
  const [secondaryUnits, setSecondaryUnits] = useState<ProductUnit[]>([]);
  
  const { units: allUnits, isLoading: unitsLoading } = useProductUnits();

  console.log("🚀 useSimplifiedProductFormLogic:", {
    isEditing,
    selectedProduct: selectedProduct?.name,
    existingUnitsCount: existingUnits.length,
    primaryUnit: primaryUnit?.value,
    secondaryUnitsCount: secondaryUnits.length,
    isInitialized
  });

  const form = useForm<SimplifiedProductFormData>({
    resolver: zodResolver(productFormSchema),
    mode: "onChange",
    defaultValues: {
      code: isEditing && selectedProduct ? selectedProduct.code : 
        Math.max(...products.map(p => p.code || 0), 0) + 1,
      name: isEditing && selectedProduct ? selectedProduct.name : "",
      cost: isEditing && selectedProduct ? selectedProduct.cost : 0,
      stock: isEditing && selectedProduct ? selectedProduct.stock : 0,
      categoryId: isEditing && selectedProduct ? selectedProduct.categoryId || "" : "",
      groupId: isEditing && selectedProduct ? selectedProduct.groupId || "" : "",
      brandId: isEditing && selectedProduct ? selectedProduct.brandId || "" : "",
      primaryUnitId: "",
    },
  });

  // Mapear unidades existentes para o novo formato
  const mapExistingUnits = useCallback(() => {
    if (!isEditing || !existingUnits.length || !allUnits.length) {
      console.log("📋 Sem unidades para mapear");
      return;
    }

    console.log("🔄 Mapeando unidades existentes:", { existingUnits, allUnits });

    let mappedPrimary: ProductUnit | null = null;
    const mappedSecondary: ProductUnit[] = [];

    for (const existingUnit of existingUnits) {
      const fullUnit = allUnits.find(u => u.id === existingUnit.id);
      if (fullUnit) {
        if (existingUnit.isMainUnit) {
          mappedPrimary = fullUnit;
        } else {
          mappedSecondary.push(fullUnit);
        }
      }
    }

    console.log("✅ Unidades mapeadas:", {
      primary: mappedPrimary?.value,
      secondary: mappedSecondary.map(u => u.value)
    });

    setPrimaryUnit(mappedPrimary);
    setSecondaryUnits(mappedSecondary);
    
    if (mappedPrimary) {
      form.setValue('primaryUnitId', mappedPrimary.id);
    }
  }, [isEditing, existingUnits, allUnits, form]);

  // Inicialização
  useEffect(() => {
    console.log("🔄 Efeito de inicialização:", {
      isEditing,
      unitsLoading,
      allUnitsCount: allUnits.length,
      existingUnitsCount: existingUnits.length
    });

    if (!unitsLoading && allUnits.length > 0) {
      if (isEditing) {
        mapExistingUnits();
      } else {
        // Para produtos novos, resetar tudo
        setPrimaryUnit(null);
        setSecondaryUnits([]);
        form.setValue('primaryUnitId', '');
      }
      setIsInitialized(true);
    }
  }, [isEditing, unitsLoading, allUnits, mapExistingUnits, form]);

  const handlePrimaryUnitChange = useCallback((unit: ProductUnit | null) => {
    console.log("👑 Mudança de unidade principal:", unit?.value);
    
    setPrimaryUnit(unit);
    form.setValue('primaryUnitId', unit?.id || '');
    
    // Se a nova unidade principal estava nas secundárias, remover
    if (unit) {
      setSecondaryUnits(prev => prev.filter(u => u.id !== unit.id));
    }
    
    toast.success("Unidade principal definida!");
  }, [form]);

  const handleAddSecondaryUnit = useCallback((unit: ProductUnit) => {
    console.log("➕ Adicionando unidade secundária:", unit.value);
    
    // Verificar se já existe
    if (secondaryUnits.some(u => u.id === unit.id)) {
      toast.error("Esta unidade já foi adicionada");
      return;
    }
    
    // Verificar se não é a principal
    if (primaryUnit && unit.id === primaryUnit.id) {
      toast.error("Esta unidade já é a principal");
      return;
    }
    
    setSecondaryUnits(prev => [...prev, unit]);
    toast.success(`Unidade ${unit.value} adicionada!`);
  }, [secondaryUnits, primaryUnit]);

  const handleRemoveSecondaryUnit = useCallback((unitId: string) => {
    console.log("🗑️ Removendo unidade secundária:", unitId);
    
    setSecondaryUnits(prev => prev.filter(u => u.id !== unitId));
    toast.success("Unidade removida!");
  }, []);

  const handleSubmit = useCallback(async (data: SimplifiedProductFormData) => {
    setIsSubmitting(true);
    
    try {
      console.log("📤 Submetendo formulário:", {
        data,
        primaryUnit: primaryUnit?.value,
        secondaryUnits: secondaryUnits.map(u => u.value)
      });

      if (!primaryUnit) {
        throw new Error("Unidade principal é obrigatória");
      }

      const finalData: SimplifiedProductFormData = {
        ...data,
        primaryUnit,
        secondaryUnits,
        categoryId: data.categoryId === "" ? null : data.categoryId,
        groupId: data.groupId === "" ? null : data.groupId,
        brandId: data.brandId === "" ? null : data.brandId,
      };

      console.log("📊 Dados finais para salvamento:", finalData);

      await onSubmit(finalData);
      
      toast.success(isEditing ? "Produto atualizado com sucesso!" : "Produto criado com sucesso!");
      
    } catch (error: any) {
      console.error("❌ Erro ao salvar produto:", error);
      toast.error("Erro ao salvar produto: " + (error.message || "Erro desconhecido"));
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, primaryUnit, secondaryUnits, isEditing]);

  return {
    form,
    allUnits,
    isSubmitting,
    isInitialized,
    unitsLoading,
    primaryUnit,
    secondaryUnits,
    handlePrimaryUnitChange,
    handleAddSecondaryUnit,
    handleRemoveSecondaryUnit,
    handleSubmit
  };
};
