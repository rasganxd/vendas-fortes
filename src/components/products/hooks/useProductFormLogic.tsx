
import { useState, useEffect } from 'react';
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Product } from '@/types';
import { useProductUnits } from './useProductUnits';
import { toast } from "sonner";

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
});

export type ProductFormData = z.infer<typeof productFormSchema>;

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
  
  useEffect(() => {
    if (isEditing && selectedProduct) {
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
      });
    }
  }, [selectedProduct, isEditing, form]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", data);
      
      if (hasSubunit && !isConversionValid) {
        toast("Configuração inválida", {
          description: "A sub-unidade não pode ter mais itens que a unidade principal"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Convert classification IDs from "none" to null and add required fields
      const processedData = {
        ...data,
        price: 0, // Default price - será definido na precificação
        categoryId: data.categoryId === "none" || data.categoryId === "" ? null : data.categoryId,
        groupId: data.groupId === "none" || data.groupId === "" ? null : data.groupId,
        brandId: data.brandId === "none" || data.brandId === "" ? null : data.brandId,
        subunitRatio: hasSubunit && isConversionValid ? subunitRatio : undefined,
      };
      
      console.log("📊 Produto processado para salvar:", processedData);
      
      await onSubmit(processedData);
      toast("Produto salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
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
    handleSubmit
  };
};
