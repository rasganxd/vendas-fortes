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
import { Loader2 } from 'lucide-react';
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
  
  // Log classification data for debugging
  useEffect(() => {
    if (open) {
      console.log("🔍 ProductForm - Classification data received:");
      console.log("📂 Categories:", productCategories?.length || 0, productCategories);
      console.log("📦 Groups:", productGroups?.length || 0, productGroups);
      console.log("🏷️ Brands:", productBrands?.length || 0, productBrands);
    }
  }, [open, productCategories, productGroups, productBrands]);

  // Get next available product code
  const getNextProductCode = () => {
    if (products.length === 0) return 1;
    return Math.max(...products.map(p => p.code || 0), 0) + 1;
  };

  // Get default values for the form
  const getDefaultValues = () => {
    if (isEditing && selectedProduct) {
      return {
        code: selectedProduct.code,
        name: selectedProduct.name,
        cost: selectedProduct.cost,
        unit: selectedProduct.unit || "UN",
        hasSubunit: selectedProduct.hasSubunit || false,
        subunit: selectedProduct.subunit || "",
        stock: selectedProduct.stock,
        categoryId: selectedProduct.categoryId || "none",
        groupId: selectedProduct.groupId || "none",
        brandId: selectedProduct.brandId || "none",
      };
    } else {
      return {
        code: getNextProductCode(),
        name: "",
        cost: 0,
        unit: "UN",
        hasSubunit: false,
        subunit: "",
        stock: 0,
        categoryId: "none",
        groupId: "none",
        brandId: "none",
      };
    }
  };
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: getDefaultValues(),
  });
  
  // Watch hasSubunit to show/hide subunit fields
  const hasSubunit = form.watch("hasSubunit");
  const selectedUnit = form.watch("unit");
  const selectedSubunit = form.watch("subunit");
  
  // Get conversion rate for subunit
  const getSubunitConversionRate = () => {
    if (!selectedSubunit) return 1;
    const subunitData = units.find(u => u.value === selectedSubunit);
    return subunitData?.conversionRate || 1;
  };
  
  // Reset form when dialog opens/closes or when editing state changes
  useEffect(() => {
    if (open) {
      const defaultValues = getDefaultValues();
      console.log("🔄 Resetting form with values:", defaultValues);
      form.reset(defaultValues);
    }
  }, [open, isEditing, selectedProduct, products]);

  // Reset form completely when dialog closes
  useEffect(() => {
    if (!open) {
      console.log("🧹 Dialog closed, clearing form");
      setTimeout(() => {
        form.reset(getDefaultValues());
      }, 100);
    }
  }, [open]);

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", data);
      
      // Convert "none" values back to null/undefined for database
      const processedData = {
        ...data,
        categoryId: data.categoryId === "none" ? undefined : data.categoryId,
        groupId: data.groupId === "none" ? undefined : data.groupId,
        brandId: data.brandId === "none" ? undefined : data.brandId,
        subunitRatio: hasSubunit && data.subunit ? getSubunitConversionRate() : undefined
      };
      
      await onSubmit(processedData);
      
      // Reset form after successful submission
      if (!isEditing) {
        form.reset(getDefaultValues());
      }
      
      toast("Produto salvo com sucesso!");
    } catch (error) {
      console.error("Erro ao salvar produto:", error);
      toast("Erro ao salvar produto. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDialogClose = (newOpen: boolean) => {
    if (!newOpen) {
      // Reset form when closing
      form.reset(getDefaultValues());
    }
    onOpenChange(newOpen);
  };

  // Check if classifications data is loading or available
  const isLoadingClassifications = !productCategories || !productGroups || !productBrands;
  const hasCategories = Array.isArray(productCategories) && productCategories.length > 0;
  const hasGroups = Array.isArray(productGroups) && productGroups.length > 0;
  const hasBrands = Array.isArray(productBrands) && productBrands.length > 0;

  return (
    <Dialog open={open} onOpenChange={handleDialogClose}>
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
                      <Select onValueChange={field.onChange} value={field.value}>
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
                        Ex: Produto vendido em caixas que contêm unidades
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
                  
                  {selectedSubunit && (
                    <div className="text-sm text-gray-600 p-3 bg-blue-50 rounded-md">
                      <p className="font-medium">Taxa de Conversão:</p>
                      <p>1 {selectedUnit} = {getSubunitConversionRate()} {selectedSubunit}</p>
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
                                <SelectItem key={category.id} value={category.id}>
                                  {category.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                Nenhuma categoria encontrada
                              </SelectItem>
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
                                <SelectItem key={group.id} value={group.id}>
                                  {group.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                Nenhum grupo encontrado
                              </SelectItem>
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
                                <SelectItem key={brand.id} value={brand.id}>
                                  {brand.name}
                                </SelectItem>
                              ))
                            ) : (
                              <SelectItem value="no-data" disabled>
                                Nenhuma marca encontrada
                              </SelectItem>
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
              <Button type="submit" disabled={isSubmitting}>
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
