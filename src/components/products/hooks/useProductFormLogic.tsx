
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
  selectedUnits: z.array(z.object({
    unitId: z.string().uuid("ID da unidade deve ser um UUID válido"),
    unitValue: z.string(),
    unitLabel: z.string(),
    packageQuantity: z.number(),
    isMainUnit: z.boolean()
  })).min(1, "Produto deve ter pelo menos uma unidade"),
  mainUnitId: z.string().uuid("ID da unidade principal deve ser um UUID válido"),
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
  const [isInitialized, setIsInitialized] = useState(false);
  const { units } = useProductUnits();
  
  console.log("🔧 useProductFormLogic - Estado inicial:", {
    isEditing,
    selectedProduct: selectedProduct?.name,
    existingUnitsCount: existingUnits.length,
    existingMainUnit: existingMainUnit?.value,
    selectedProductPrice: selectedProduct?.price,
    isInitialized
  });
  
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
  
  // Helper function para validar UUID
  const isValidUUID = useCallback((uuid: string): boolean => {
    if (!uuid || typeof uuid !== 'string') return false;
    const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i;
    return uuidRegex.test(uuid);
  }, []);

  // Helper function para encontrar unidade por valor
  const findUnitByValue = useCallback((value: string) => {
    return units.find(unit => unit.value.toLowerCase() === value.toLowerCase());
  }, [units]);

  // Helper function to validate and convert to SelectedUnit
  const validateAndConvertToSelectedUnit = useCallback((units: any[]): SelectedUnit[] => {
    console.log("🔄 Validando e convertendo unidades:", units);
    
    const validUnits = units
      .map((unit): SelectedUnit | null => {
        let unitId = unit.unitId;
        
        console.log("🔍 Processando unidade:", { original: unit, unitId });
        
        // Se o unitId não é um UUID válido, tentar encontrar por valor
        if (!isValidUUID(unitId)) {
          console.warn("⚠️ unitId inválido detectado:", unitId, "tentando encontrar por valor");
          const foundUnit = findUnitByValue(unitId);
          if (foundUnit) {
            unitId = foundUnit.id;
            console.log("✅ Unidade encontrada por valor:", { originalValue: unit.unitId, foundId: unitId });
          } else {
            console.error("❌ Não foi possível encontrar unidade para valor:", unitId);
            return null;
          }
        }

        // Validar se todos os campos necessários estão presentes
        if (!unitId || !unit.unitValue || !unit.unitLabel || 
            typeof unit.packageQuantity !== 'number' || unit.packageQuantity <= 0 ||
            typeof unit.isMainUnit !== 'boolean') {
          console.warn("⚠️ Unidade com dados inválidos:", unit);
          return null;
        }

        const validUnit = {
          unitId,
          unitValue: unit.unitValue,
          unitLabel: unit.unitLabel,
          packageQuantity: unit.packageQuantity,
          isMainUnit: unit.isMainUnit
        };
        
        console.log("✅ Unidade validada:", validUnit);
        return validUnit;
      })
      .filter((unit): unit is SelectedUnit => unit !== null);
    
    console.log("📊 Resultado da validação:", {
      input: units.length,
      valid: validUnits.length,
      invalid: units.length - validUnits.length,
      validUnits
    });
    
    return validUnits;
  }, [isValidUUID, findUnitByValue]);
  
  // Validar e mapear unidades existentes
  const mappedExistingUnits = useMemo(() => {
    if (!isEditing || !existingUnits?.length) {
      console.log("📋 Sem unidades para mapear:", { isEditing, existingUnitsLength: existingUnits?.length });
      return [];
    }
    
    console.log("🔄 Mapeando unidades existentes:", existingUnits);
    
    const mapped = existingUnits
      .filter((unit): unit is ProductUnitWithMapping & {
        id: string;
        value: string;
        label: string;
        packageQuantity: number;
      } => {
        const isValid = Boolean(unit.id) && 
          isValidUUID(unit.id) &&
          Boolean(unit.value) && 
          Boolean(unit.label) && 
          typeof unit.packageQuantity === 'number' && 
          unit.packageQuantity > 0;
        
        if (!isValid) {
          console.warn("⚠️ Unidade inválida encontrada:", unit);
        }
        
        return isValid;
      })
      .map(unit => {
        const mappedUnit = {
          unitId: unit.id,
          unitValue: unit.value,
          unitLabel: unit.label,
          packageQuantity: unit.packageQuantity,
          isMainUnit: unit.isMainUnit || false
        };
        
        console.log("✅ Unidade mapeada:", mappedUnit);
        return mappedUnit;
      }) as SelectedUnit[];

    console.log("📊 Resultado do mapeamento:", {
      original: existingUnits.length,
      mapped: mapped.length,
      mainUnits: mapped.filter(u => u.isMainUnit).length
    });
    
    return mapped;
  }, [isEditing, existingUnits, isValidUUID]);

  // Inicialização melhorada
  useEffect(() => {
    console.log("🚀 Efeito de inicialização disparado:", {
      isEditing,
      selectedProduct: selectedProduct?.name,
      mappedUnitsCount: mappedExistingUnits.length,
      existingMainUnit: existingMainUnit?.value,
      isInitialized
    });

    if (isEditing && selectedProduct) {
      const mainUnitIdToSet = existingMainUnit?.id || "";
      
      console.log("📝 Resetando formulário para edição:", {
        productName: selectedProduct.name,
        unitsToSet: mappedExistingUnits.length,
        mainUnitId: mainUnitIdToSet,
        preservingPrice: selectedProduct.price
      });
      
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
      
      setIsInitialized(true);
      
      console.log("✅ Formulário resetado com unidades e preço preservado");
    } else if (!isEditing) {
      console.log("🆕 Resetando formulário para novo produto");
      
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
      
      setIsInitialized(true);
    }
  }, [selectedProduct, isEditing, form, products, mappedExistingUnits, existingMainUnit]);

  const addUnit = useCallback((unit: { id: string; value: string; label: string; packageQuantity: number }) => {
    console.log("➕ Adicionando unidade:", unit);
    
    // Validar se o ID da unidade é um UUID válido
    if (!isValidUUID(unit.id)) {
      console.error("❌ ID da unidade inválido:", unit.id);
      toast("Erro: ID da unidade inválido", {
        description: "O ID da unidade deve ser um UUID válido."
      });
      return;
    }
    
    const currentUnits = form.getValues('selectedUnits') || [];
    const validCurrentUnits = validateAndConvertToSelectedUnit(currentUnits);
    
    // Verificar se a unidade já existe
    const unitExists = validCurrentUnits.some(u => u.unitId === unit.id);
    if (unitExists) {
      console.warn("⚠️ Unidade já existe:", unit.id);
      toast("Unidade já adicionada", {
        description: "Esta unidade já foi adicionada ao produto."
      });
      return;
    }
    
    const newUnit: SelectedUnit = {
      unitId: unit.id,
      unitValue: unit.value,
      unitLabel: unit.label,
      packageQuantity: unit.packageQuantity,
      isMainUnit: validCurrentUnits.length === 0
    };
    
    const updatedUnits = [...validCurrentUnits, newUnit];
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    
    if (validCurrentUnits.length === 0) {
      form.setValue('mainUnitId', unit.id, { shouldValidate: true });
      console.log("👑 Primeira unidade definida como principal:", unit.id);
    }
    
    console.log("✅ Unidade adicionada:", {
      newUnit,
      totalUnits: updatedUnits.length
    });
    
    toast("Unidade adicionada com sucesso!");
  }, [form, validateAndConvertToSelectedUnit, isValidUUID]);

  const removeUnit = useCallback((unitId: string) => {
    console.log("🗑️ Removendo unidade:", unitId);
    
    const currentUnits = form.getValues('selectedUnits') || [];
    const validCurrentUnits = validateAndConvertToSelectedUnit(currentUnits);
    const currentMainUnitId = form.getValues('mainUnitId');
    
    const updatedUnits = validCurrentUnits.filter(u => u.unitId !== unitId);
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    
    if (currentMainUnitId === unitId && updatedUnits.length > 0) {
      const newMainUnitId = updatedUnits[0].unitId;
      
      const updatedUnitsWithNewMain = updatedUnits.map(u => ({
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
    toast("Unidade removida com sucesso!");
  }, [form, validateAndConvertToSelectedUnit]);

  const setAsMainUnit = useCallback((unitId: string) => {
    console.log("👑 Definindo nova unidade principal:", unitId);
    
    // Validar se o ID é um UUID válido
    if (!isValidUUID(unitId)) {
      console.error("❌ ID da unidade principal inválido:", unitId);
      toast("Erro: ID da unidade principal inválido");
      return;
    }
    
    const currentUnits = form.getValues('selectedUnits') || [];
    const validCurrentUnits = validateAndConvertToSelectedUnit(currentUnits);
    
    const updatedUnits = validCurrentUnits.map(u => ({
      ...u,
      isMainUnit: u.unitId === unitId
    }));
    
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    form.setValue('mainUnitId', unitId, { shouldValidate: true });
    
    console.log("✅ Unidade principal definida");
    toast("Unidade principal definida com sucesso!");
  }, [form, validateAndConvertToSelectedUnit, isValidUUID]);

  // Validação centralizada
  const validateFormData = useCallback((data: ProductFormData) => {
    console.log("🔍 Validando dados do formulário:", data);
    
    if (!data.selectedUnits || data.selectedUnits.length === 0) {
      throw new Error("Produto deve ter pelo menos uma unidade");
    }

    if (!data.mainUnitId || !isValidUUID(data.mainUnitId)) {
      throw new Error("Produto deve ter uma unidade principal válida definida");
    }

    // Validar UUIDs de todas as unidades
    const invalidUnitIds = data.selectedUnits.filter(u => !isValidUUID(u.unitId));
    if (invalidUnitIds.length > 0) {
      console.error("❌ Unidades com IDs inválidos:", invalidUnitIds);
      throw new Error("Todas as unidades devem ter IDs válidos");
    }

    const mainUnits = data.selectedUnits.filter(u => u.isMainUnit);
    if (mainUnits.length !== 1) {
      throw new Error("Produto deve ter exatamente uma unidade principal");
    }

    // Verificar se a unidade principal marcada corresponde ao mainUnitId
    const mainUnitFromList = mainUnits[0];
    if (mainUnitFromList.unitId !== data.mainUnitId) {
      console.error("❌ Inconsistência entre unidade principal marcada e mainUnitId:", {
        mainUnitFromList: mainUnitFromList.unitId,
        mainUnitId: data.mainUnitId
      });
      throw new Error("Inconsistência na unidade principal");
    }

    const invalidUnits = data.selectedUnits.filter(u => 
      !u.unitId || !u.unitValue || !u.unitLabel || u.packageQuantity <= 0
    );
    
    if (invalidUnits.length > 0) {
      console.error("❌ Unidades inválidas encontradas:", invalidUnits);
      throw new Error("Todas as unidades devem ter informações válidas");
    }
    
    console.log("✅ Dados do formulário válidos");
  }, [isValidUUID]);

  const handleSubmit = useCallback(async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("📤 Submetendo dados do formulário:", data);
      
      // Validar e processar unidades antes da validação final
      const processedUnits = validateAndConvertToSelectedUnit(data.selectedUnits);
      const processedData = {
        ...data,
        selectedUnits: processedUnits
      };
      
      console.log("🔄 Dados processados com unidades validadas:", processedData);
      
      validateFormData(processedData);
      
      // IMPORTANTE: Não forçar preço para 0 - preserve o preço existente ou deixe como está
      const finalData = {
        ...processedData,
        // Preserve o preço existente do produto ou mantenha o valor do formulário
        price: isEditing && selectedProduct ? selectedProduct.price : 0,
        categoryId: processedData.categoryId === "none" || processedData.categoryId === "" ? null : processedData.categoryId,
        groupId: processedData.groupId === "none" || processedData.groupId === "" ? null : processedData.groupId,
        brandId: processedData.brandId === "none" || processedData.brandId === "" ? null : processedData.brandId,
      };
      
      console.log("📊 Dados finais para salvamento (preço preservado):", finalData);
      
      await onSubmit(finalData);
      
    } catch (error: any) {
      console.error("❌ Erro ao salvar produto:", error);
      toast("Erro ao salvar produto", {
        description: error.message || "Tente novamente."
      });
    } finally {
      setIsSubmitting(false);
    }
  }, [onSubmit, validateFormData, validateAndConvertToSelectedUnit, isEditing, selectedProduct]);

  return {
    form,
    units,
    isSubmitting,
    selectedUnits,
    mainUnitId,
    isInitialized,
    addUnit,
    removeUnit,
    setAsMainUnit,
    handleSubmit
  };
};
