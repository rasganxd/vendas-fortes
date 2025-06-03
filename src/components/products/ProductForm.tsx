
import React, { useEffect } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { useForm } from "react-hook-form";
import { Product, ProductCategory, ProductGroup, ProductBrand } from '@/types';
import { useProductUnits } from './hooks/useProductUnits';
import { formatCurrency } from '@/lib/utils';

interface ProductFormProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  isEditing: boolean;
  selectedProduct: Product | null;
  products: Product[];
  productCategories: ProductCategory[];
  productGroups: ProductGroup[];
  productBrands: ProductBrand[];
  onSubmit: (data: any) => void;
}

interface FormData {
  code: number;
  name: string;
  cost: number;
  price: number;
  unit: string;
  hasSubunit: boolean;
  subunit?: string;
  subunitRatio?: number;
  categoryId?: string;
  groupId?: string;
  brandId?: string;
  stock: number;
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
  const { units, isLoading: unitsLoading } = useProductUnits();
  
  const {
    register,
    handleSubmit,
    reset,
    watch,
    setValue,
    formState: { errors }
  } = useForm<FormData>();

  const hasSubunit = watch('hasSubunit');
  const costValue = watch('cost');

  // Generate next product code
  const generateNextCode = () => {
    if (products.length === 0) return 1;
    const maxCode = Math.max(...products.map(p => p.code || 0));
    return maxCode + 1;
  };

  useEffect(() => {
    if (open) {
      console.log('🔄 [ProductForm] Opening form, isEditing:', isEditing, 'selectedProduct:', selectedProduct);
      if (isEditing && selectedProduct) {
        console.log('📝 [ProductForm] Editing product:', selectedProduct);
        reset({
          code: selectedProduct.code,
          name: selectedProduct.name,
          cost: selectedProduct.cost,
          price: selectedProduct.price,
          unit: selectedProduct.unit || 'UN',
          hasSubunit: selectedProduct.hasSubunit || false,
          subunit: selectedProduct.subunit || undefined,
          subunitRatio: selectedProduct.subunitRatio || 1,
          categoryId: selectedProduct.categoryId || undefined,
          groupId: selectedProduct.groupId || undefined,
          brandId: selectedProduct.brandId || undefined,
          stock: selectedProduct.stock || 0
        });
      } else {
        const nextCode = generateNextCode();
        console.log('➕ [ProductForm] Creating new product with code:', nextCode);
        reset({
          code: nextCode,
          name: '',
          cost: 0,
          price: 0,
          unit: 'UN',
          hasSubunit: false,
          subunit: undefined,
          subunitRatio: 1,
          categoryId: undefined,
          groupId: undefined,
          brandId: undefined,
          stock: 0
        });
      }
    }
  }, [open, isEditing, selectedProduct, reset, products]);

  // Auto-suggest price based on cost
  useEffect(() => {
    if (!isEditing && costValue > 0) {
      const suggestedPrice = costValue * 1.3;
      setValue('price', parseFloat(suggestedPrice.toFixed(2)));
    }
  }, [costValue, isEditing, setValue]);

  const onFormSubmit = (data: FormData) => {
    console.log("📋 [ProductForm] Form data submitted:", data);
    
    // Clean data for submission
    const cleanData = {
      ...data,
      categoryId: data.categoryId === 'none' ? undefined : data.categoryId,
      groupId: data.groupId === 'none' ? undefined : data.groupId,
      brandId: data.brandId === 'none' ? undefined : data.brandId,
      subunit: data.hasSubunit ? data.subunit : undefined,
      subunitRatio: data.hasSubunit ? data.subunitRatio : undefined
    };
    
    console.log("✅ [ProductForm] Clean data for submission:", cleanData);
    onSubmit(cleanData);
  };

  const formatPriceInput = (value: string): number => {
    const numericValue = value.replace(/\D/g, '');
    return parseFloat(numericValue) / 100 || 0;
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{isEditing ? 'Editar Produto' : 'Novo Produto'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="code">Código</Label>
              <Input
                id="code"
                type="number"
                {...register('code', { required: 'Código é obrigatório', min: 1 })}
                className={errors.code ? 'border-red-500' : ''}
              />
              {errors.code && <p className="text-red-500 text-sm mt-1">{errors.code.message}</p>}
            </div>
            <div>
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                step="0.01"
                {...register('stock', { min: 0 })}
                className={errors.stock ? 'border-red-500' : ''}
              />
            </div>
          </div>

          <div>
            <Label htmlFor="name">Nome</Label>
            <Input
              id="name"
              {...register('name', { required: 'Nome é obrigatório' })}
              className={errors.name ? 'border-red-500' : ''}
            />
            {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="cost">Custo</Label>
              <Input
                id="cost"
                {...register('cost', { 
                  required: 'Custo é obrigatório', 
                  min: { value: 0, message: 'Custo deve ser positivo' }
                })}
                onChange={(e) => {
                  const newCost = formatPriceInput(e.target.value);
                  setValue('cost', newCost);
                }}
                value={formatCurrency(costValue || 0)}
                className={errors.cost ? 'border-red-500' : ''}
              />
              {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>}
            </div>
            <div>
              <Label htmlFor="price">Preço de Venda</Label>
              <Input
                id="price"
                {...register('price', { 
                  required: 'Preço de venda é obrigatório', 
                  min: { value: 0, message: 'Preço deve ser positivo' }
                })}
                onChange={(e) => {
                  const newPrice = formatPriceInput(e.target.value);
                  setValue('price', newPrice);
                }}
                value={formatCurrency(watch('price') || 0)}
                className={errors.price ? 'border-red-500' : ''}
              />
              {errors.price && <p className="text-red-500 text-sm mt-1">{errors.price.message}</p>}
            </div>
          </div>

          <div>
            <Label htmlFor="unit">Unidade Principal</Label>
            <Select value={watch('unit') || 'UN'} onValueChange={(value) => setValue('unit', value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma unidade" />
              </SelectTrigger>
              <SelectContent>
                {!unitsLoading && units.map((unit) => (
                  <SelectItem key={unit.code} value={unit.code}>
                    {unit.code} - {unit.description}
                  </SelectItem>
                ))}
                <SelectItem value="UN">UN - Unidade</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex items-center space-x-2">
            <Checkbox
              id="hasSubunit"
              checked={hasSubunit}
              onCheckedChange={(checked) => setValue('hasSubunit', !!checked)}
            />
            <Label htmlFor="hasSubunit">Possui sub-unidade</Label>
          </div>

          {hasSubunit && (
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="subunit">Sub-unidade</Label>
                <Select value={watch('subunit') || ''} onValueChange={(value) => setValue('subunit', value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione uma sub-unidade" />
                  </SelectTrigger>
                  <SelectContent>
                    {!unitsLoading && units.map((unit) => (
                      <SelectItem key={unit.code} value={unit.code}>
                        {unit.code} - {unit.description}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="subunitRatio">Proporção</Label>
                <Input
                  id="subunitRatio"
                  type="number"
                  step="0.01"
                  {...register('subunitRatio', { min: 0.01 })}
                />
              </div>
            </div>
          )}

          <div className="grid grid-cols-3 gap-4">
            <div>
              <Label htmlFor="categoryId">Categoria</Label>
              <Select value={watch('categoryId') || 'none'} onValueChange={(value) => setValue('categoryId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {productCategories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="groupId">Grupo</Label>
              <Select value={watch('groupId') || 'none'} onValueChange={(value) => setValue('groupId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {productGroups.map((group) => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label htmlFor="brandId">Marca</Label>
              <Select value={watch('brandId') || 'none'} onValueChange={(value) => setValue('brandId', value)}>
                <SelectTrigger>
                  <SelectValue placeholder="Marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {productBrands.map((brand) => (
                    <SelectItem key={brand.id} value={brand.id}>
                      {brand.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit">
              {isEditing ? 'Atualizar' : 'Criar'} Produto
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductForm;
