import React, { useState, useEffect } from 'react';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Checkbox } from '@/components/ui/checkbox';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Loader2, AlertCircle } from 'lucide-react';
import { Product, ProductCategory, ProductGroup, ProductBrand } from '@/types';
import { formatCurrency } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { useProductUnits } from './hooks/useProductUnits';

// Define a schema for the product form
const productFormSchema = z.object({
  code: z.number().min(1, {
    message: "Código deve ser maior que zero.",
  }),
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres.",
  }),
  cost: z.number(),
  unit: z.string(),
  hasSubunit: z.boolean().optional(),
  subunit: z.string().optional(),
  stock: z.number().optional(),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  brandId: z.string().optional(),
});

// Define a type for the form data
type ProductFormData = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  selectedProduct: Product | null;
  products: Product[];
  productCategories: ProductCategory[];
  productGroups: ProductGroup[];
  productBrands: ProductBrand[];
  onSubmit: (data: ProductFormData) => Promise<void>;
}

const ProductForm: React.FC<ProductFormProps> = ({
  open,
  onOpenChange,
  isEditing,
  selectedProduct,
  products,
  productCategories,
  productGroups,
  productBrands,
  onSubmit
}) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { units } = useProductUnits();
  
  // Add debug logging for classification data
  useEffect(() => {
    console.log("ProductForm received productCategories:", productCategories?.length || 0, "items");
    console.log("ProductForm received productGroups:", productGroups?.length || 0, "items");
    console.log("ProductForm received productBrands:", productBrands?.length || 0, "items");
    
    // Log the actual data for debugging
    if (productGroups?.length === 0) {
      console.log("No product groups received");
    } else {
      console.log("First few product groups:", productGroups?.slice(0, 3));
    }
    
    if (productBrands?.length === 0) {
      console.log("No product brands received");
    } else {
      console.log("First few product brands:", productBrands?.slice(0, 3));
    }
  }, [productCategories, productGroups, productBrands]);
  
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
  
  // Watch hasSubunit to show/hide subunit fields
  const hasSubunit = form.watch("hasSubunit");
  const selectedUnit = form.watch("unit");
  const selectedSubunit = form.watch("subunit");
  
  // Calculate correct subunit ratio
  const calculateSubunitRatio = () => {
    if (!selectedUnit || !selectedSubunit || !hasSubunit) return null;
    
    const mainUnitData = units.find(u => u.value === selectedUnit);
    const subUnitData = units.find(u => u.value === selectedSubunit);
    
    if (!mainUnitData || !subUnitData) return null;
    
    const mainPackageQty = mainUnitData.packageQuantity || 1;
    const subPackageQty = subUnitData.packageQuantity || 1;
    
    // Validation: subunit cannot have more items than main unit
    if (subPackageQty > mainPackageQty) {
      return null;
    }
    
    // Calculate how many subunits fit in one main unit
    return Math.floor(mainPackageQty / subPackageQty);
  };
  
  const subunitRatio = calculateSubunitRatio();
  const isConversionValid = subunitRatio !== null && subunitRatio > 0;
  
  // Get package quantity for the main unit (not subunit)
  const getMainUnitPackageQuantity = () => {
    if (!selectedUnit) return 1;
    const unitData = units.find(u => u.value === selectedUnit);
    return unitData?.packageQuantity || 1;
  };
  
  // Update form values when selected product changes
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
      
      // Validate subunit configuration
      if (hasSubunit && !isConversionValid) {
        toast("Configuração inválida", {
          description: "A sub-unidade não pode ter mais itens que a unidade principal"
        });
        setIsSubmitting(false);
        return;
      }
      
      // Configure subunit_ratio correctly with proper calculation
      const formDataWithConversion = {
        ...data,
        subunitRatio: hasSubunit && isConversionValid ? subunitRatio : undefined
      };
      
      console.log("📊 Configuração do produto:", {
        unit: data.unit,
        subunit: data.subunit,
        hasSubunit,
        subunitRatio: formDataWithConversion.subunitRatio,
        mainUnitPackageQuantity: units.find(u => u.value === selectedUnit)?.packageQuantity,
        subUnitPackageQuantity: units.find(u => u.value === selectedSubunit)?.packageQuantity,
        calculatedRatio: subunitRatio
      });
      
      await onSubmit(formDataWithConversion);
      toast("Produto salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast("Erro ao salvar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if classifications data is available
  const hasCategories = Array.isArray(productCategories) && productCategories.length > 0;
  const hasGroups = Array.isArray(productGroups) && productGroups.length > 0;
  const hasBrands = Array.isArray(productBrands) && productBrands.length > 0;
  
  // Loading state for classifications
  const isLoadingClassifications = productCategories === undefined || productGroups === undefined || productBrands === undefined;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{isEditing ? "Editar" : "Adicionar"} Produto</DialogTitle>
          <DialogDescription>
            {isEditing ? "Edite os dados do produto abaixo" : "Preencha os dados do novo produto abaixo"}
          </DialogDescription>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="code"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Código</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Código do produto" {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nome</FormLabel>
                    <FormControl>
                      <Input placeholder="Nome do produto" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="cost"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Preço de Custo</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="Preço de custo" 
                        value={formatCurrency(field.value)} 
                        onChange={(e) => {
                          // Remove all non-numeric characters
                          const numericValue = e.target.value.replace(/\D/g, '');
                          // Convert to number and divide by 100 to get decimal value
                          field.onChange(parseFloat(numericValue) / 100 || 0);
                        }}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="unit"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Unidade Principal</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {units.map(unit => (
                            <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            {/* Subunit Configuration */}
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <FormField
                control={form.control}
                name="hasSubunit"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>
                        Este produto tem sub-unidade?
                      </FormLabel>
                      <p className="text-sm text-gray-600">
                        Ex: Produto vendido em caixas que contêm unidades menores
                      </p>
                    </div>
                  </FormItem>
                )}
              />

              {hasSubunit && (
                <div className="space-y-4">
                  <FormField
                    control={form.control}
                    name="subunit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Sub-unidade</FormLabel>
                        <FormControl>
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger>
                              <SelectValue placeholder="Selecione a sub-unidade" />
                            </SelectTrigger>
                            <SelectContent>
                              {units.map(unit => (
                                <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {selectedUnit && selectedSubunit && (
                    <div className="space-y-3">
                      {isConversionValid ? (
                        <div className="text-sm text-gray-700 p-3 bg-blue-50 rounded-md border border-blue-200">
                          <p className="font-medium text-blue-800">Conversão Calculada:</p>
                          <p className="text-blue-700">
                            1 {selectedUnit} contém {subunitRatio} {selectedSubunit}
                          </p>
                          <p className="text-xs mt-1 text-blue-600">
                            Baseado nas quantidades: {selectedUnit} ({units.find(u => u.value === selectedUnit)?.packageQuantity}) ÷ {selectedSubunit} ({units.find(u => u.value === selectedSubunit)?.packageQuantity})
                          </p>
                        </div>
                      ) : (
                        <div className="text-sm text-red-700 p-3 bg-red-50 rounded-md border border-red-200">
                          <div className="flex items-start gap-2">
                            <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                            <div>
                              <p className="font-medium text-red-800">Configuração Inválida</p>
                              <p className="text-red-700">
                                A sub-unidade ({selectedSubunit}: {units.find(u => u.value === selectedSubunit)?.packageQuantity}) não pode ter mais itens que a unidade principal ({selectedUnit}: {units.find(u => u.value === selectedUnit)?.packageQuantity})
                              </p>
                              <p className="text-xs mt-1 text-red-600">
                                Ajuste as quantidades das unidades em Configurações → Unidades
                              </p>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              )}
            </div>
            
            <div className="grid grid-cols-1 gap-4">
              <FormField
                control={form.control}
                name="stock"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Estoque</FormLabel>
                    <FormControl>
                      <Input type="number" placeholder="Estoque" {...field} 
                        onChange={(e) => field.onChange(parseInt(e.target.value, 10) || 0)} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Categoria</FormLabel>
                    <FormControl>
                      {isLoadingClassifications ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <SelectTrigger>
                            <SelectValue placeholder="Categoria" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {hasCategories ? (
                              productCategories.map(category => (
                                <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-categories" disabled>Nenhuma categoria cadastrada</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="groupId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Grupo</FormLabel>
                    <FormControl>
                      {isLoadingClassifications ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <SelectTrigger>
                            <SelectValue placeholder="Grupo" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhum</SelectItem>
                            {hasGroups ? (
                              productGroups.map(group => (
                                <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-groups" disabled>Nenhum grupo cadastrado</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Marca</FormLabel>
                    <FormControl>
                      {isLoadingClassifications ? (
                        <Skeleton className="h-10 w-full" />
                      ) : (
                        <Select onValueChange={field.onChange} value={field.value || "none"}>
                          <SelectTrigger>
                            <SelectValue placeholder="Marca" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="none">Nenhuma</SelectItem>
                            {hasBrands ? (
                              productBrands.map(brand => (
                                <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-brands" disabled>Nenhuma marca cadastrada</SelectItem>
                            )}
                          </SelectContent>
                        </Select>
                      )}
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            <DialogFooter>
              <Button type="submit" disabled={isSubmitting || (hasSubunit && !isConversionValid)}>
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar"
                )}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
