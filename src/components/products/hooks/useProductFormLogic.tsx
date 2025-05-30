
import { useState, useEffect, useMemo, useCallback } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from '@/types';
import { useProductUnits } from './useProductUnits';
import { toast } from "sonner";
import { ProductFormUnitsData, SelectedUnit } from '@/types/productFormUnits';
import { ProductUnitWithMapping } from '@/types/productUnits';

const productFormSchema = z.object({
  code: z.number().min(1, {
    message: "Código deve ser maior que zero.",
  }),
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  cost: z.number().min(0, {
    message: "Custo deve ser maior ou igual a zero.",
  }),
  stock: z.number().optional(),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  brandId: z.string().optional(),
  // New fields for units configuration
  selectedUnits: z.array(z.object({
    unitId: z.string(),
    unitValue: z.string(),
    unitLabel: z.string(),
    packageQuantity: z.number(),
    isMainUnit: z.boolean()
  })).min(1, "Produto deve ter pelo menos uma unidade"),
  mainUnitId: z.string().min(1, "Produto deve ter uma unidade principal"),
});

export type ProductFormData = z.infer<typeof productFormSchema> & ProductFormUnitsData;

interface UseProductFormLogicProps {
  isEditing: boolean;
  selectedProduct: Product | null;
  products: Product[];
  onSubmit: (data: ProductFormData) => Promise<void>;
  existingUnits?: ProductUnitWithMapping[];
  existingMainUnit?: ProductUnitWithMapping | null;
}

export const useProductFormLogic = ({
  isEditing,
  selectedProduct,
  products,
  onSubmit,
  existingUnits = [],
  existingMainUnit = null
}: UseProductFormLogicProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { units } = useProductUnits();
  
  const form = useForm<ProductFormData>({
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
      selectedUnits: [],
      mainUnitId: "",
    },
  });
  
  const selectedUnits = form.watch("selectedUnits") || [];
  const mainUnitId = form.watch("mainUnitId");
  
  // Memoize the mapped units to avoid recalculation
  const mappedExistingUnits = useMemo(() => {
    if (!isEditing || !existingUnits?.length) return [];
    
    return existingUnits
      .filter(unit => unit.id && unit.value && unit.label)
      .map(unit => ({
        unitId: unit.id,
        unitValue: unit.value,
        unitLabel: unit.label,
        packageQuantity: unit.packageQuantity || 1,
        isMainUnit: unit.isMainUnit || false
      }));
  }, [isEditing, existingUnits]);

  // Load existing units when editing (consolidated useEffect)
  useEffect(() => {
    if (isEditing && selectedProduct) {
      console.log("🔄 Resetando formulário para produto:", selectedProduct.name);
      
      const mainUnitIdToSet = existingMainUnit?.id || "";
      
      form.reset({
        code: selectedProduct.code,
        name: selectedProduct.name,
        cost: selectedProduct.cost,
        stock: selectedProduct.stock,
        categoryId: selectedProduct.categoryId || "",
        groupId: selectedProduct.groupId || "",
        brandId: selectedProduct.brandId || "",
        selectedUnits: mappedExistingUnits,
        mainUnitId: mainUnitIdToSet,
      });
      
      console.log("✅ Unidades carregadas no formulário:", {
        unitsCount: mappedExistingUnits.length,
        mainUnitId: mainUnitIdToSet
      });
    } else if (!isEditing) {
      // Reset para novo produto
      form.reset({
        code: Math.max(...products.map(p => p.code || 0), 0) + 1,
        name: "",
        cost: 0,
        stock: 0,
        categoryId: "",
        groupId: "",
        brandId: "",
        selectedUnits: [],
        mainUnitId: "",
      });
    }
  }, [selectedProduct, isEditing, form, products, mappedExistingUnits, existingMainUnit]);

  const addUnit = useCallback((unit: { id: string; value: string; label: string; packageQuantity: number }) => {
    console.log("🔄 Adicionando unidade:", unit);
    
    const currentUnits = form.getValues('selectedUnits') || [];
    const currentMainUnitId = form.getValues('mainUnitId');
    
    const newUnit: SelectedUnit = {
      unitId: unit.id,
      unitValue: unit.value,
      unitLabel: unit.label,
      packageQuantity: unit.packageQuantity,
      isMainUnit: currentUnits.length === 0
    };
    
    const updatedUnits = [...currentUnits, newUnit];
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    
    if (currentUnits.length === 0) {
      form.setValue('mainUnitId', unit.id, { shouldValidate: true });
      console.log("👑 Definida como unidade principal:", unit.id);
    }
    
    console.log("✅ Unidade adicionada:", {
      newUnit,
      totalUnits: updatedUnits.length,
      mainUnitId: currentUnits.length === 0 ? unit.id : currentMainUnitId
    });
    
    toast("Unidade adicionada com sucesso!");
  }, [form]);

  const removeUnit = useCallback((unitId: string) => {
    console.log("🗑️ Removendo unidade:", unitId);
    
    const currentUnits = form.getValues('selectedUnits') || [];
    const currentMainUnitId = form.getValues('mainUnitId');
    
    const updatedUnits = currentUnits.filter(u => u.unitId !== unitId);
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    
    if (currentMainUnitId === unitId && updatedUnits.length > 0) {
      const newMainUnitId = updatedUnits[0].unitId;
      
      const updatedUnitsWithNewMain: SelectedUnit[] = updatedUnits.map(u => ({
        ...u,
        isMainUnit: u.unitId === newMainUnitId
      }));
      
      form.setValue('selectedUnits', updatedUnitsWithNewMain, { shouldValidate: true });
      form.setValue('mainUnitId', newMainUnitId, { shouldValidate: true });
      
      console.log("👑 Nova unidade principal:", newMainUnitId);
    } else if (updatedUnits.length === 0) {
      form.setValue('mainUnitId', "", { shouldValidate: true });
    }
    
    console.log("✅ Unidade removida");
  }, [form]);

  const setAsMainUnit = useCallback((unitId: string) => {
    console.log("👑 Definindo nova unidade principal:", unitId);
    
    const currentUnits = form.getValues('selectedUnits') || [];
    
    const updatedUnits: SelectedUnit[] = currentUnits.map(u => ({
      ...u,
      isMainUnit: u.unitId === unitId
    }));
    
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    form.setValue('mainUnitId', unitId, { shouldValidate: true });
    
    console.log("✅ Unidade principal definida");
  }, [form]);

  const handleSubmit = useCallback(async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("📤 Submetendo dados do formulário:", data);
      
      // Validações centralizadas
      if (!data.selectedUnits || data.selectedUnits.length === 0) {
        toast("Erro de validação", {
          description: "Produto deve ter pelo menos uma unidade"
        });
        return;
      }

      if (!data.mainUnitId) {
        toast("Erro de validação", {
          description: "Produto deve ter uma unidade principal definida"
        });
        return;
      }

      const mainUnits = data.selectedUnits.filter(u => u.isMainUnit);
      if (mainUnits.length !== 1) {
        toast("Erro de validação", {
          description: "Produto deve ter exatamente uma unidade principal"
        });
        return;
      }
      
      const processedData = {
        ...data,
        price: 0,
        categoryId: data.categoryId === "none" || data.categoryId === "" ? null : data.categoryId,
        groupId: data.groupId === "none" || data.groupId === "" ? null : data.groupId,
        brandId: data.brandId === "none" || data.brandId === "" ? null : data.brandId,
      };
      
      console.log("📊 Dados processados para salvamento:", processedData);
      
      await onSubmit(processedData);
      
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error);
      toast("Erro ao salvar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit]);

  return {
    form,
    units,
    isSubmitting,
    selectedUnits,
    mainUnitId,
    addUnit,
    removeUnit,
    setAsMainUnit,
    handleSubmit
  };
};
