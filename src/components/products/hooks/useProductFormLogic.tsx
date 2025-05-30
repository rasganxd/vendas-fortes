
import { useState, useEffect } from 'react';
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
  unit: z.string(),
  hasSubunit: z.boolean().optional(),
  subunit: z.string().optional(),
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
    mode: "onChange", // Validar em tempo real
    defaultValues: {
      code: isEditing && selectedProduct ? selectedProduct.code : 
        Math.max(...products.map(p => p.code || 0), 0) + 1,
      name: isEditing && selectedProduct ? selectedProduct.name : "",
      cost: isEditing && selectedProduct ? selectedProduct.cost : 0,
      unit: isEditing && selectedProduct ? selectedProduct.unit || "UN" : "UN",
      hasSubunit: isEditing && selectedProduct ? selectedProduct.hasSubunit || false : false,
      subunit: isEditing && selectedProduct ? selectedProduct.subunit || "" : "",
      stock: isEditing && selectedProduct ? selectedProduct.stock : 0,
      categoryId: isEditing && selectedProduct ? selectedProduct.categoryId || "" : "",
      groupId: isEditing && selectedProduct ? selectedProduct.groupId || "" : "",
      brandId: isEditing && selectedProduct ? selectedProduct.brandId || "" : "",
      selectedUnits: [],
      mainUnitId: "",
    },
  });
  
  const hasSubunit = form.watch("hasSubunit");
  const selectedUnit = form.watch("unit");
  const selectedSubunit = form.watch("subunit");
  const selectedUnits = form.watch("selectedUnits") || [];
  const mainUnitId = form.watch("mainUnitId");
  
  const calculateSubunitRatio = () => {
    if (!selectedUnit || !selectedSubunit || !hasSubunit) return null;
    
    const mainUnitData = units.find(u => u.value === selectedUnit);
    const subUnitData = units.find(u => u.value === selectedSubunit);
    
    if (!mainUnitData || !subUnitData) return null;
    
    const mainPackageQty = mainUnitData.packageQuantity || 1;
    const subPackageQty = subUnitData.packageQuantity || 1;
    
    if (subPackageQty > mainPackageQty) {
      return null;
    }
    
    return Math.floor(mainPackageQty / subPackageQty);
  };
  
  const subunitRatio = calculateSubunitRatio();
  const isConversionValid = subunitRatio !== null && subunitRatio > 0;
  
  // Load existing units when editing
  useEffect(() => {
    if (isEditing && existingUnits && existingUnits.length > 0) {
      console.log("🔄 Carregando unidades existentes para edição:", existingUnits);
      
      // Ensure all required properties are present and properly typed
      const mappedUnits: SelectedUnit[] = existingUnits
        .filter(unit => unit.id && unit.value && unit.label) // Filter out invalid units
        .map(unit => ({
          unitId: unit.id,
          unitValue: unit.value,
          unitLabel: unit.label,
          packageQuantity: unit.packageQuantity || 1,
          isMainUnit: unit.isMainUnit || false
        }));
      
      const mainUnitIdToSet = existingMainUnit?.id || "";
      
      form.setValue('selectedUnits', mappedUnits);
      form.setValue('mainUnitId', mainUnitIdToSet);
      
      console.log("✅ Unidades carregadas no formulário:", {
        unitsCount: mappedUnits.length,
        mainUnitId: mainUnitIdToSet
      });
    } else if (!isEditing) {
      // Limpar unidades ao criar novo produto
      console.log("🆕 Criando novo produto - limpando unidades");
      form.setValue('selectedUnits', []);
      form.setValue('mainUnitId', "");
    }
  }, [isEditing, existingUnits, existingMainUnit, form]);

  // Reset form when product changes
  useEffect(() => {
    if (selectedProduct) {
      console.log("🔄 Resetando formulário para produto:", selectedProduct.name);
      
      form.reset({
        code: selectedProduct.code,
        name: selectedProduct.name,
        cost: selectedProduct.cost,
        unit: selectedProduct.unit || "UN",
        hasSubunit: selectedProduct.hasSubunit || false,
        subunit: selectedProduct.subunit || "",
        stock: selectedProduct.stock,
        categoryId: selectedProduct.categoryId || "",
        groupId: selectedProduct.groupId || "",
        brandId: selectedProduct.brandId || "",
        selectedUnits: [], // Será carregado pelo useEffect das unidades
        mainUnitId: "", // Será carregado pelo useEffect das unidades
      });
    } else if (!isEditing) {
      // Reset para novo produto
      form.reset({
        code: Math.max(...products.map(p => p.code || 0), 0) + 1,
        name: "",
        cost: 0,
        unit: "UN",
        hasSubunit: false,
        subunit: "",
        stock: 0,
        categoryId: "",
        groupId: "",
        brandId: "",
        selectedUnits: [],
        mainUnitId: "",
      });
    }
  }, [selectedProduct, isEditing, form, products]);

  const addUnit = (unit: { id: string; value: string; label: string; packageQuantity: number }) => {
    console.log("🔄 Adicionando unidade:", unit);
    
    const currentUnits = form.getValues('selectedUnits') || [];
    const currentMainUnitId = form.getValues('mainUnitId');
    
    const newUnit: SelectedUnit = {
      unitId: unit.id,
      unitValue: unit.value,
      unitLabel: unit.label,
      packageQuantity: unit.packageQuantity,
      isMainUnit: currentUnits.length === 0 // Primeira unidade vira principal
    };
    
    const updatedUnits = [...currentUnits, newUnit];
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    
    // Se é a primeira unidade, definir como principal
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
  };

  const removeUnit = (unitId: string) => {
    console.log("🗑️ Removendo unidade:", unitId);
    
    const currentUnits = form.getValues('selectedUnits') || [];
    const currentMainUnitId = form.getValues('mainUnitId');
    
    const updatedUnits = currentUnits.filter(u => u.unitId !== unitId);
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    
    // Se removendo a unidade principal e ainda há unidades
    if (currentMainUnitId === unitId && updatedUnits.length > 0) {
      const newMainUnitId = updatedUnits[0].unitId;
      
      // Atualizar isMainUnit no array
      const updatedUnitsWithNewMain: SelectedUnit[] = updatedUnits.map(u => ({
        unitId: u.unitId,
        unitValue: u.unitValue,
        unitLabel: u.unitLabel,
        packageQuantity: u.packageQuantity,
        isMainUnit: u.unitId === newMainUnitId
      }));
      
      form.setValue('selectedUnits', updatedUnitsWithNewMain, { shouldValidate: true });
      form.setValue('mainUnitId', newMainUnitId, { shouldValidate: true });
      
      console.log("👑 Nova unidade principal:", newMainUnitId);
    } else if (updatedUnits.length === 0) {
      form.setValue('mainUnitId', "", { shouldValidate: true });
    }
    
    console.log("✅ Unidade removida");
  };

  const setAsMainUnit = (unitId: string) => {
    console.log("👑 Definindo nova unidade principal:", unitId);
    
    const currentUnits = form.getValues('selectedUnits') || [];
    
    const updatedUnits: SelectedUnit[] = currentUnits.map(u => ({
      unitId: u.unitId,
      unitValue: u.unitValue,
      unitLabel: u.unitLabel,
      packageQuantity: u.packageQuantity,
      isMainUnit: u.unitId === unitId
    }));
    
    form.setValue('selectedUnits', updatedUnits, { shouldValidate: true });
    form.setValue('mainUnitId', unitId, { shouldValidate: true });
    
    console.log("✅ Unidade principal definida");
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("📤 Submetendo dados do formulário:", data);
      
      // Validações adicionais
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
      
      if (hasSubunit && !isConversionValid) {
        toast("Configuração inválida", {
          description: "A sub-unidade não pode ter mais itens que a unidade principal"
        });
        return;
      }
      
      const processedData = {
        ...data,
        price: 0,
        categoryId: data.categoryId === "none" || data.categoryId === "" ? null : data.categoryId,
        groupId: data.groupId === "none" || data.groupId === "" ? null : data.groupId,
        brandId: data.brandId === "none" || data.brandId === "" ? null : data.brandId,
        subunitRatio: hasSubunit && isConversionValid ? subunitRatio : undefined,
      };
      
      console.log("📊 Dados processados para salvamento:", processedData);
      
      await onSubmit(processedData);
      
    } catch (error) {
      console.error("❌ Erro ao salvar produto:", error);
      toast("Erro ao salvar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return {
    form,
    units,
    isSubmitting,
    hasSubunit,
    selectedUnit,
    selectedSubunit,
    subunitRatio,
    isConversionValid,
    selectedUnits,
    mainUnitId,
    addUnit,
    removeUnit,
    setAsMainUnit,
    handleSubmit
  };
};
