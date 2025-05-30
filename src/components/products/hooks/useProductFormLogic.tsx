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
  })).optional(),
  mainUnitId: z.string().optional(),
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
  const [selectedUnits, setSelectedUnits] = useState<SelectedUnit[]>([]);
  const [mainUnitId, setMainUnitId] = useState<string | null>(null);
  const { units } = useProductUnits();
  
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
  
  // Load existing units when editing - IMPROVED LOGIC
  useEffect(() => {
    if (isEditing && existingUnits && existingUnits.length > 0) {
      console.log("🔄 Carregando unidades existentes para edição:", existingUnits);
      
      const mappedUnits: SelectedUnit[] = existingUnits.map(unit => ({
        unitId: unit.id,
        unitValue: unit.value,
        unitLabel: unit.label,
        packageQuantity: unit.packageQuantity,
        isMainUnit: unit.isMainUnit
      }));
      
      setSelectedUnits(mappedUnits);
      
      if (existingMainUnit) {
        setMainUnitId(existingMainUnit.id);
        console.log("👑 Unidade principal definida:", existingMainUnit.id);
      }
      
      // IMPORTANTE: Atualizar os valores do formulário também
      form.setValue('selectedUnits', mappedUnits);
      form.setValue('mainUnitId', existingMainUnit?.id || null);
      
      console.log("✅ Unidades carregadas com sucesso:", {
        unitsCount: mappedUnits.length,
        mainUnitId: existingMainUnit?.id,
        formValues: form.getValues()
      });
    } else if (!isEditing) {
      // Limpar unidades ao criar novo produto
      console.log("🆕 Criando novo produto - limpando unidades");
      setSelectedUnits([]);
      setMainUnitId(null);
      form.setValue('selectedUnits', []);
      form.setValue('mainUnitId', null);
    }
  }, [isEditing, existingUnits, existingMainUnit, form]);

  // Reset form when product changes - IMPROVED
  useEffect(() => {
    if (isEditing && selectedProduct) {
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
        selectedUnits: selectedUnits, // Manter unidades carregadas
        mainUnitId: mainUnitId, // Manter unidade principal
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
        mainUnitId: null,
      });
    }
  }, [selectedProduct, isEditing, form, products, selectedUnits, mainUnitId]);

  const addUnit = (unit: { id: string; value: string; label: string; packageQuantity: number }) => {
    console.log("🔄 Adicionando unidade ao estado:", unit);
    
    const newUnit: SelectedUnit = {
      unitId: unit.id,
      unitValue: unit.value,
      unitLabel: unit.label,
      packageQuantity: unit.packageQuantity,
      isMainUnit: selectedUnits.length === 0 // Primeira unidade vira principal
    };
    
    const updatedUnits = [...selectedUnits, newUnit];
    setSelectedUnits(updatedUnits);
    
    // Se é a primeira unidade, definir como principal
    if (selectedUnits.length === 0) {
      setMainUnitId(unit.id);
      console.log("👑 Definida como unidade principal:", unit.id);
    }
    
    // Atualizar valores do formulário IMEDIATAMENTE
    form.setValue('selectedUnits', updatedUnits);
    form.setValue('mainUnitId', selectedUnits.length === 0 ? unit.id : mainUnitId);
    
    console.log("✅ Unidade adicionada:", {
      newUnit,
      totalUnits: updatedUnits.length,
      mainUnitId: selectedUnits.length === 0 ? unit.id : mainUnitId,
      formValues: form.getValues()
    });
    
    toast("Unidade adicionada com sucesso!");
  };

  const removeUnit = (unitId: string) => {
    console.log("🗑️ Removendo unidade:", unitId);
    
    const updatedUnits = selectedUnits.filter(u => u.unitId !== unitId);
    setSelectedUnits(updatedUnits);
    
    // Se removendo a unidade principal e ainda há unidades
    if (mainUnitId === unitId && updatedUnits.length > 0) {
      const newMainUnitId = updatedUnits[0].unitId;
      setMainUnitId(newMainUnitId);
      
      // Atualizar isMainUnit no array
      const updatedUnitsWithNewMain = updatedUnits.map(u => ({
        ...u,
        isMainUnit: u.unitId === newMainUnitId
      }));
      setSelectedUnits(updatedUnitsWithNewMain);
      form.setValue('selectedUnits', updatedUnitsWithNewMain);
      form.setValue('mainUnitId', newMainUnitId);
      
      console.log("👑 Nova unidade principal:", newMainUnitId);
    } else if (updatedUnits.length === 0) {
      setMainUnitId(null);
      form.setValue('mainUnitId', null);
    }
    
    form.setValue('selectedUnits', updatedUnits);
    console.log("✅ Unidade removida");
  };

  const setAsMainUnit = (unitId: string) => {
    console.log("👑 Definindo nova unidade principal:", unitId);
    
    const updatedUnits = selectedUnits.map(u => ({
      ...u,
      isMainUnit: u.unitId === unitId
    }));
    setSelectedUnits(updatedUnits);
    setMainUnitId(unitId);
    form.setValue('selectedUnits', updatedUnits);
    form.setValue('mainUnitId', unitId);
    
    console.log("✅ Unidade principal definida");
  };

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("📤 Submetendo dados do formulário:", {
        ...data,
        selectedUnitsCount: selectedUnits.length,
        mainUnitId
      });
      
      if (hasSubunit && !isConversionValid) {
        toast("Configuração inválida", {
          description: "A sub-unidade não pode ter mais itens que a unidade principal"
        });
        setIsSubmitting(false);
        return;
      }
      
      // GARANTIR que as unidades sejam incluídas nos dados
      const processedData = {
        ...data,
        price: 0,
        categoryId: data.categoryId === "none" || data.categoryId === "" ? null : data.categoryId,
        groupId: data.groupId === "none" || data.groupId === "" ? null : data.groupId,
        brandId: data.brandId === "none" || data.brandId === "" ? null : data.brandId,
        subunitRatio: hasSubunit && isConversionValid ? subunitRatio : undefined,
        selectedUnits: selectedUnits, // Usar estado local ao invés do form
        mainUnitId: mainUnitId, // Usar estado local ao invés do form
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
