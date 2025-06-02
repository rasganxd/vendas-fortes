
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from '@/types';
import { useProductUnits } from './useProductUnits';
import { useProductUnitsMapping } from '@/hooks/useProductUnitsMapping';
import { toast } from "sonner";
import { ProductFormUnitsData, SelectedUnit } from '@/types/productFormUnits';

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
  // Atualizado: tornar selectedUnits obrigatório com pelo menos uma unidade
  selectedUnits: z.array(z.object({
    unitId: z.string(),
    unitValue: z.string(),
    unitLabel: z.string(),
    packageQuantity: z.number(),
    isMainUnit: z.boolean()
  })).min(1, {
    message: "É obrigatório selecionar pelo menos uma unidade para o produto."
  }),
  mainUnitId: z.string().min(1, {
    message: "É obrigatório definir uma unidade principal."
  }),
});

export type ProductFormData = z.infer<typeof productFormSchema> & ProductFormUnitsData;

interface UseProductFormLogicProps {
  isEditing: boolean;
  selectedProduct: Product | null;
  products: Product[];
  onSubmit: (data: ProductFormData) => Promise<void>;
}

export const useProductFormLogic = ({
  isEditing,
  selectedProduct,
  products,
  onSubmit
}: UseProductFormLogicProps) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedUnits, setSelectedUnits] = useState<SelectedUnit[]>([]);
  const [mainUnitId, setMainUnitId] = useState<string | null>(null);
  const [isLoadingUnits, setIsLoadingUnits] = useState(false);
  const { units } = useProductUnits();
  
  // Hook para carregar unidades do produto em edição
  const { 
    productUnits, 
    mainUnit, 
    isLoading: isLoadingProductUnits,
    refreshProductUnits 
  } = useProductUnitsMapping(selectedProduct?.id);
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
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
      // Atualizado: inicializar com arrays vazios para novos produtos
      selectedUnits: [],
      mainUnitId: null,
    },
  });
  
  const hasSubunit = form.watch("hasSubunit");
  const selectedUnit = form.watch("unit");
  const selectedSubunit = form.watch("subunit");
  
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

  // Carregar unidades do produto quando em modo de edição
  useEffect(() => {
    if (isEditing && selectedProduct && productUnits.length > 0) {
      console.log('🔄 Carregando unidades do produto para edição:', selectedProduct.name);
      console.log('📦 Unidades encontradas:', productUnits);
      
      setIsLoadingUnits(true);
      
      // Mapear unidades do produto para o formato do formulário
      const mappedUnits: SelectedUnit[] = productUnits.map(unit => ({
        unitId: unit.id,
        unitValue: unit.value,
        unitLabel: unit.label,
        packageQuantity: unit.packageQuantity,
        isMainUnit: unit.isMainUnit
      }));
      
      console.log('🔄 Unidades mapeadas para o formulário:', mappedUnits);
      
      setSelectedUnits(mappedUnits);
      
      // Definir unidade principal
      if (mainUnit) {
        console.log('👑 Definindo unidade principal:', mainUnit.value);
        setMainUnitId(mainUnit.id);
        
        // Atualizar campo legacy do formulário
        form.setValue('unit', mainUnit.value);
      }
      
      // Atualizar valores do formulário
      form.setValue('selectedUnits', mappedUnits);
      form.setValue('mainUnitId', mainUnit?.id || null);
      
      setIsLoadingUnits(false);
      console.log('✅ Unidades carregadas com sucesso no formulário');
    }
  }, [selectedProduct, productUnits, mainUnit, isEditing, form]);
  
  // Reset do formulário quando produto muda
  useEffect(() => {
    if (isEditing && selectedProduct) {
      console.log('🔄 Resetando formulário para produto:', selectedProduct.name);
      
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
        selectedUnits: [],
        mainUnitId: null,
      });
      
      // Resetar estado das unidades
      setSelectedUnits([]);
      setMainUnitId(null);
    }
  }, [selectedProduct, isEditing, form]);

  const addUnit = (unit: { id: string; value: string; label: string; packageQuantity: number }) => {
    console.log("🔄 Adding unit to form state:", unit);
    
    const newUnit: SelectedUnit = {
      unitId: unit.id,
      unitValue: unit.value,
      unitLabel: unit.label,
      packageQuantity: unit.packageQuantity,
      isMainUnit: selectedUnits.length === 0 // First unit becomes main unit
    };
    
    const updatedUnits = [...selectedUnits, newUnit];
    setSelectedUnits(updatedUnits);
    
    if (selectedUnits.length === 0) {
      setMainUnitId(unit.id);
      console.log("👑 Set as main unit:", unit.id);
    }
    
    // Update form values
    form.setValue('selectedUnits', updatedUnits);
    form.setValue('mainUnitId', selectedUnits.length === 0 ? unit.id : mainUnitId);
    
    console.log("✅ Unit added successfully:", {
      newUnit,
      totalUnits: updatedUnits.length,
      mainUnitId: selectedUnits.length === 0 ? unit.id : mainUnitId
    });
    
    toast("Unidade adicionada com sucesso!");
  };

  const removeUnit = (unitId: string) => {
    console.log("🗑️ Removing unit:", unitId);
    
    const updatedUnits = selectedUnits.filter(u => u.unitId !== unitId);
    setSelectedUnits(updatedUnits);
    
    // If removing main unit, set first remaining unit as main
    if (mainUnitId === unitId && updatedUnits.length > 0) {
      const newMainUnitId = updatedUnits[0].unitId;
      setMainUnitId(newMainUnitId);
      const updatedUnitsWithNewMain = updatedUnits.map(u => ({
        ...u,
        isMainUnit: u.unitId === newMainUnitId
      }));
      setSelectedUnits(updatedUnitsWithNewMain);
      form.setValue('selectedUnits', updatedUnitsWithNewMain);
      form.setValue('mainUnitId', newMainUnitId);
    } else if (updatedUnits.length === 0) {
      setMainUnitId(null);
      form.setValue('mainUnitId', null);
    }
    
    form.setValue('selectedUnits', updatedUnits);
    console.log("✅ Unit removed successfully");
  };

  const setAsMainUnit = (unitId: string) => {
    console.log("👑 Setting main unit:", unitId);
    
    const updatedUnits = selectedUnits.map(u => ({
      ...u,
      isMainUnit: u.unitId === unitId
    }));
    setSelectedUnits(updatedUnits);
    setMainUnitId(unitId);
    form.setValue('selectedUnits', updatedUnits);
    form.setValue('mainUnitId', unitId);
    
    console.log("✅ Main unit set successfully");
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("📤 Submitting form data:", data);
      
      // Validação adicional para novos produtos
      if (!isEditing) {
        if (!data.selectedUnits || data.selectedUnits.length === 0) {
          toast("Unidades obrigatórias", {
            description: "É obrigatório selecionar pelo menos uma unidade para o produto"
          });
          setIsSubmitting(false);
          return;
        }
        
        if (!data.mainUnitId) {
          toast("Unidade principal obrigatória", {
            description: "É obrigatório definir uma unidade principal para o produto"
          });
          setIsSubmitting(false);
          return;
        }
      }
      
      if (hasSubunit && !isConversionValid) {
        toast("Configuração inválida", {
          description: "A sub-unidade não pode ter mais itens que a unidade principal"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Include units data in the submission
      const processedData = {
        ...data,
        price: 0,
        categoryId: data.categoryId === "none" || data.categoryId === "" ? null : data.categoryId,
        groupId: data.groupId === "none" || data.groupId === "" ? null : data.groupId,
        brandId: data.brandId === "none" || data.brandId === "" ? null : data.brandId,
        subunitRatio: hasSubunit && isConversionValid ? subunitRatio : undefined,
        selectedUnits,
        mainUnitId,
      };
      
      console.log("📊 Produto processado para salvar:", processedData);
      
      await onSubmit(processedData);
      toast("Produto salvo com sucesso!");
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
    isLoadingUnits: isLoadingUnits || isLoadingProductUnits,
    addUnit,
    removeUnit,
    setAsMainUnit,
    handleSubmit
  };
};
