
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
  const [isInitialized, setIsInitialized] = useState(false);
  
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
      code: 0,
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

  // Inicializar formulário baseado no modo de edição
  useEffect(() => {
    if (!isInitialized) {
      if (isEditing && selectedProduct) {
        console.log('🔄 Inicializando formulário para edição:', selectedProduct.name);
        
        // Resetar formulário com dados do produto
        form.reset({
          code: selectedProduct.code || 0,
          name: selectedProduct.name || "",
          cost: selectedProduct.cost || 0,
          unit: selectedProduct.unit || "UN",
          hasSubunit: selectedProduct.hasSubunit || false,
          subunit: selectedProduct.subunit || "",
          stock: selectedProduct.stock || 0,
          categoryId: selectedProduct.categoryId || "",
          groupId: selectedProduct.groupId || "",
          brandId: selectedProduct.brandId || "",
          selectedUnits: [],
          mainUnitId: "",
        });
        
        // Resetar estado das unidades
        setSelectedUnits([]);
        setMainUnitId(null);
      } else {
        console.log('🔄 Inicializando formulário para novo produto');
        
        // Novo produto - gerar próximo código
        const nextCode = products.length > 0 
          ? Math.max(...products.map(p => p.code || 0)) + 1 
          : 1;
        
        form.reset({
          code: nextCode,
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
        
        setSelectedUnits([]);
        setMainUnitId(null);
      }
      
      setIsInitialized(true);
    }
  }, [isEditing, selectedProduct, products, form, isInitialized]);

  // Carregar unidades quando produto mudou e dados estão disponíveis
  useEffect(() => {
    if (isEditing && selectedProduct && productUnits.length > 0 && isInitialized) {
      console.log('📦 Carregando unidades do produto:', productUnits);
      
      // Mapear unidades do produto para o formato do formulário
      const mappedUnits: SelectedUnit[] = productUnits.map(unit => ({
        unitId: unit.id,
        unitValue: unit.value,
        unitLabel: unit.label,
        packageQuantity: unit.packageQuantity,
        isMainUnit: unit.isMainUnit
      }));
      
      console.log('🔄 Unidades mapeadas:', mappedUnits);
      
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
      form.setValue('mainUnitId', mainUnit?.id || "");
      
      console.log('✅ Unidades carregadas no formulário');
    }
  }, [selectedProduct, productUnits, mainUnit, isEditing, form, isInitialized]);

  const addUnit = (unit: { id: string; value: string; label: string; packageQuantity: number }) => {
    console.log("🔄 Adicionando unidade:", unit);
    
    const newUnit: SelectedUnit = {
      unitId: unit.id,
      unitValue: unit.value,
      unitLabel: unit.label,
      packageQuantity: unit.packageQuantity,
      isMainUnit: selectedUnits.length === 0 // Primeira unidade vira principal
    };
    
    const updatedUnits = [...selectedUnits, newUnit];
    setSelectedUnits(updatedUnits);
    
    if (selectedUnits.length === 0) {
      setMainUnitId(unit.id);
      console.log("👑 Definida como unidade principal:", unit.id);
    }
    
    // Atualizar formulário
    form.setValue('selectedUnits', updatedUnits);
    form.setValue('mainUnitId', selectedUnits.length === 0 ? unit.id : mainUnitId || "");
    
    console.log("✅ Unidade adicionada com sucesso");
    toast("Unidade adicionada com sucesso!");
  };

  const removeUnit = (unitId: string) => {
    console.log("🗑️ Removendo unidade:", unitId);
    
    const updatedUnits = selectedUnits.filter(u => u.unitId !== unitId);
    setSelectedUnits(updatedUnits);
    
    // Se removendo unidade principal, definir primeira como principal
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
      form.setValue('mainUnitId', "");
    } else {
      form.setValue('selectedUnits', updatedUnits);
    }
    
    console.log("✅ Unidade removida com sucesso");
  };

  const setAsMainUnit = (unitId: string) => {
    console.log("👑 Definindo unidade principal:", unitId);
    
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
      console.log("📤 Enviando dados do formulário:", data);
      
      // Validações adicionais
      if (!data.selectedUnits || data.selectedUnits.length === 0) {
        toast("É obrigatório selecionar pelo menos uma unidade para o produto");
        setIsSubmitting(false);
        return;
      }
      
      if (!data.mainUnitId) {
        toast("É obrigatório definir uma unidade principal para o produto");
        setIsSubmitting(false);
        return;
      }
      
      if (hasSubunit && !isConversionValid) {
        toast("A sub-unidade não pode ter mais itens que a unidade principal");
        setIsSubmitting(false);
        return;
      }
      
      // Preparar dados processados
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
      
      console.log("📊 Dados processados para envio:", processedData);
      
      await onSubmit(processedData);
      console.log("✅ Produto salvo com sucesso");
      
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
    isLoadingUnits: isLoadingProductUnits && isEditing,
    addUnit,
    removeUnit,
    setAsMainUnit,
    handleSubmit
  };
};
