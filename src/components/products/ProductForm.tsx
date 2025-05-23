
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
  stock: z.number().optional(),
  categoryId: z.string().optional(),
  groupId: z.string().optional(),
  brandId: z.string().optional(),
});

// Define a type for the form data
type ProductFormData = z.infer<typeof productFormSchema>;

// Common units for products
export const PRODUCT_UNITS = [
  { value: 'UN', label: 'Unidade (UN)' },
  { value: 'KG', label: 'Quilograma (KG)' },
  { value: 'L', label: 'Litro (L)' },
  { value: 'ML', label: 'Mililitro (ML)' },
  { value: 'CX', label: 'Caixa (CX)' },
  { value: 'PCT', label: 'Pacote (PCT)' },
  { value: 'PAR', label: 'Par (PAR)' },
  { value: 'DUZIA', label: 'Dúzia (DZ)' },
  { value: 'ROLO', label: 'Rolo (RL)' },
  { value: 'METRO', label: 'Metro (M)' }
];

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
  
  // Add debug logging for classification data
  useEffect(() => {
    console.log("ProductForm received productCategories:", productCategories);
    console.log("ProductForm received productGroups:", productGroups);
    console.log("ProductForm received productBrands:", productBrands);
  }, [productCategories, productGroups, productBrands]);
  
  const form = useForm<ProductFormData>({
    resolver: zodResolver(productFormSchema),
    defaultValues: {
      code: isEditing && selectedProduct ? selectedProduct.code : 
        Math.max(...products.map(p => p.code || 0), 0) + 1,
      name: isEditing && selectedProduct ? selectedProduct.name : "",
      cost: isEditing && selectedProduct ? selectedProduct.cost : 0,
      unit: isEditing && selectedProduct ? selectedProduct.unit || "UN" : "UN",
      stock: isEditing && selectedProduct ? selectedProduct.stock : 0,
      categoryId: isEditing && selectedProduct ? selectedProduct.categoryId || "" : "",
      groupId: isEditing && selectedProduct ? selectedProduct.groupId || "" : "",
      brandId: isEditing && selectedProduct ? selectedProduct.brandId || "" : "",
    },
  });

  const handleSubmit = async (data: ProductFormData) => {
    setIsSubmitting(true);
    try {
      console.log("Submitting form data:", data);
      await onSubmit(data);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Check if classifications data is available
  const hasCategories = productCategories && productCategories.length > 0;
  const hasGroups = productGroups && productGroups.length > 0;
  const hasBrands = productBrands && productBrands.length > 0;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[600px]">
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
                    <FormLabel>Unidade</FormLabel>
                    <FormControl>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione a unidade" />
                        </SelectTrigger>
                        <SelectContent>
                          {PRODUCT_UNITS.map(unit => (
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
                      {productCategories === undefined ? (
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
                      {productGroups === undefined ? (
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
                      {productBrands === undefined ? (
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
