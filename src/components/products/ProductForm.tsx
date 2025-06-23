
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
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Separator } from '@/components/ui/separator';
import { Package, Ruler, DollarSign, Tags, AlertTriangle } from 'lucide-react';
import { Alert, AlertDescription } from '@/components/ui/alert';

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
  unit: string;
  hasSubunit: boolean;
  subunit?: string;
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
  const currentCost = watch('cost');

  // Generate next product code
  const generateNextCode = () => {
    if (products.length === 0) return 1;
    const maxCode = Math.max(...products.map(p => p.code || 0));
    return maxCode + 1;
  };

  // Check if selling price is lower than cost price
  const isPriceLowerThanCost = () => {
    if (!isEditing || !selectedProduct || !currentCost) return false;
    return selectedProduct.price < currentCost;
  };

  useEffect(() => {
    if (open) {
      console.log('🔄 [ProductForm] Opening form, isEditing:', isEditing, 'selectedProduct:', selectedProduct);
      if (isEditing && selectedProduct) {
        console.log('📝 [ProductForm] Editing product:', selectedProduct);
        console.log('💰 [ProductForm] Setting cost value:', selectedProduct.cost);
        reset({
          code: selectedProduct.code,
          name: selectedProduct.name,
          cost: selectedProduct.cost,
          unit: selectedProduct.unit || 'UN',
          hasSubunit: selectedProduct.hasSubunit || false,
          subunit: selectedProduct.subunit || undefined,
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
          unit: 'UN',
          hasSubunit: false,
          subunit: undefined,
          categoryId: undefined,
          groupId: undefined,
          brandId: undefined,
          stock: 0
        });
      }
    }
  }, [open, isEditing, selectedProduct, reset, products]);

  const onFormSubmit = (data: FormData) => {
    console.log("📋 [ProductForm] Raw form data submitted:", data);
    console.log("💰 [ProductForm] Cost value from form:", data.cost, "Type:", typeof data.cost);
    
    // Ensure cost is a proper number
    const costValue = Number(data.cost);
    console.log("💰 [ProductForm] Converted cost value:", costValue, "Type:", typeof costValue);
    
    // Clean data for submission
    const cleanData = {
      ...data,
      cost: costValue,
      // CORREÇÃO: Só definir price = cost para produtos NOVOS
      // Para produtos existentes, preservar o preço de venda atual
      price: isEditing && selectedProduct ? selectedProduct.price : costValue,
      categoryId: data.categoryId === 'none' ? undefined : data.categoryId,
      groupId: data.groupId === 'none' ? undefined : data.groupId,
      brandId: data.brandId === 'none' ? undefined : data.brandId,
      subunit: data.hasSubunit ? data.subunit : undefined,
    };
    
    console.log("✅ [ProductForm] Clean data for submission:", cleanData);
    console.log("💰 [ProductForm] Final cost value being sent:", cleanData.cost);
    console.log("💲 [ProductForm] Final price value being sent:", cleanData.price);
    onSubmit(cleanData);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-hidden">
        <DialogHeader>
          <DialogTitle className="text-xl">
            {isEditing ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          <div className="max-h-[70vh] overflow-y-auto pr-4 space-y-6">
            
            {/* Alerta se preço for menor que custo */}
            {isPriceLowerThanCost() && (
              <Alert className="border-yellow-200 bg-yellow-50">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <AlertDescription className="text-yellow-800">
                  <strong>Atenção:</strong> O preço de venda atual (R$ {selectedProduct?.price.toFixed(2)}) 
                  é menor que o novo custo (R$ {currentCost?.toFixed(2)}). 
                  O preço de venda será mantido. Você pode ajustá-lo na aba de Precificação se necessário.
                </AlertDescription>
              </Alert>
            )}

            {/* Seção Identificação */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Package className="h-5 w-5 text-blue-600" />
                  Identificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                    <Label htmlFor="name">Nome do Produto</Label>
                    <Input
                      id="name"
                      {...register('name', { required: 'Nome é obrigatório' })}
                      className={errors.name ? 'border-red-500' : ''}
                    />
                    {errors.name && <p className="text-red-500 text-sm mt-1">{errors.name.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção Unidades */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Ruler className="h-5 w-5 text-green-600" />
                  Unidades
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
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
                    <p className="text-sm text-gray-500 mt-1">
                      A proporção será calculada automaticamente baseada nas unidades cadastradas
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Seção Valores e Estoque */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <DollarSign className="h-5 w-5 text-purple-600" />
                  Valores e Estoque
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cost">Preço de Custo (R$)</Label>
                    <Input
                      id="cost"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0.00"
                      {...register('cost', { 
                        required: 'Custo é obrigatório', 
                        min: { value: 0, message: 'Custo deve ser positivo' },
                        valueAsNumber: true
                      })}
                      className={errors.cost ? 'border-red-500' : ''}
                    />
                    {errors.cost && <p className="text-red-500 text-sm mt-1">{errors.cost.message}</p>}
                    {isEditing && selectedProduct && (
                      <p className="text-sm text-gray-500 mt-1">
                        Preço de venda atual: R$ {selectedProduct.price.toFixed(2)}
                        {selectedProduct.price < currentCost && ' (menor que o custo!)'}
                      </p>
                    )}
                    {!isEditing && (
                      <p className="text-sm text-gray-500 mt-1">
                        O preço de venda será definido igual ao custo inicialmente
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <Label htmlFor="stock">Estoque Atual</Label>
                    <Input
                      id="stock"
                      type="number"
                      step="0.01"
                      min="0"
                      placeholder="0"
                      {...register('stock', { min: 0 })}
                      className={errors.stock ? 'border-red-500' : ''}
                    />
                    {errors.stock && <p className="text-red-500 text-sm mt-1">{errors.stock.message}</p>}
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Seção Classificação */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-lg flex items-center gap-2">
                  <Tags className="h-5 w-5 text-orange-600" />
                  Classificação
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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
              </CardContent>
            </Card>
          </div>

          <Separator />
          
          <div className="flex justify-end space-x-2 pt-2">
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
