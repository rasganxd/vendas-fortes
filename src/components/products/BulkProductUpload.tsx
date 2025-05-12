import React, { useState } from 'react';
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle 
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { toast } from '@/components/ui/use-toast';
import { ProductCategory, ProductGroup, ProductBrand } from '@/types';
import { CustomScrollArea } from '@/components/ui/custom-scroll-area';
import { useAppContext } from '@/hooks/useAppContext';
import { Checkbox } from '@/components/ui/checkbox';

// Common units for products
const PRODUCT_UNITS = [
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

interface BulkProductUploadProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const BulkProductUpload = ({
  open,
  onOpenChange
}: BulkProductUploadProps) => {
  const { productCategories, productGroups, productBrands, products, addProduct } = useAppContext();
  
  // Calculate next available product code
  const nextProductCode = products.length > 0 
    ? Math.max(...products.map(product => product.code || 0)) + 1 
    : 1;
  
  const [baseCode, setBaseCode] = useState<number>(nextProductCode);
  const [baseName, setBaseName] = useState<string>('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [displayCost, setDisplayCost] = useState<string>('0,00');
  const [sellingPrice, setSellingPrice] = useState<number>(0);
  const [displayPrice, setDisplayPrice] = useState<string>('0,00');
  const [stock, setStock] = useState<number>(0);
  const [unit, setUnit] = useState<string>('UN');
  const [category, setCategory] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [variants, setVariants] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [definePrice, setDefinePrice] = useState<boolean>(false);

  // Helper function to format currency input
  const formatCurrencyInput = (value: string): number => {
    // Remove all non-numeric characters
    const numericValue = value.replace(/[^\d]/g, '');
    // Convert to number and divide by 100 to get decimal value
    return parseFloat(numericValue || '0') / 100;
  };

  // Helper function to format currency display
  const formatCurrency = (value: number): string => {
    return value.toLocaleString('pt-BR', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  };

  // Handle cost price change
  const handleCostPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newCostPrice = formatCurrencyInput(e.target.value);
    setCostPrice(newCostPrice);
    setDisplayCost(formatCurrency(newCostPrice));
  };
  
  // Handle selling price change
  const handleSellingPriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newSellingPrice = formatCurrencyInput(e.target.value);
    setSellingPrice(newSellingPrice);
    setDisplayPrice(formatCurrency(newSellingPrice));
  };

  const handleSubmit = async () => {
    // Validação básica
    if (!baseName || !costPrice) {
      toast({
        title: "Campos incompletos",
        description: "Preencha pelo menos o nome base e preço de custo.",
        variant: "destructive"
      });
      return;
    }

    try {
      setIsProcessing(true);
      const variantLines = variants.trim().split('\n').filter(line => line.trim() !== '');
      
      if (variantLines.length === 0) {
        toast({
          title: "Sem variantes",
          description: "Adicione pelo menos uma variante de produto.",
          variant: "destructive"
        });
        setIsProcessing(false);
        return;
      }

      // Criar produtos com base nas variantes
      const productsToCreate = variantLines.map((variant, index) => {
        const productName = `${baseName} ${variant.trim()}`;
        return {
          code: baseCode + index,
          name: productName,
          description: '',
          price: definePrice ? sellingPrice : costPrice, // Usar preço de venda apenas se definido manualmente
          cost: costPrice,
          stock: stock,
          minStock: 0,
          unit: unit,
          categoryId: category === "none" ? undefined : category,
          groupId: group === "none" ? undefined : group,
          brandId: brand === "none" ? undefined : brand,
          maxDiscountPercentage: 0, // Valor padrão
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      // Add products one by one
      for (const product of productsToCreate) {
        await addProduct(product);
      }
      
      toast({
        title: "Produtos cadastrados",
        description: `${productsToCreate.length} produtos foram cadastrados com sucesso.`,
      });
      
      // Resetar formulário
      setVariants('');
      onOpenChange(false);
    } catch (error) {
      console.error("Erro ao processar produtos em massa:", error);
      toast({
        title: "Erro no processamento",
        description: "Ocorreu um erro ao cadastrar os produtos em massa.",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh]">
        <CustomScrollArea className="h-full">
          <DialogHeader>
            <DialogTitle>Cadastro em Massa de Produtos</DialogTitle>
          </DialogHeader>
          <div className="grid grid-cols-2 gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="baseCode">Código Base</Label>
              <Input
                id="baseCode"
                type="number"
                value={baseCode}
                onChange={(e) => setBaseCode(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="baseName">Nome Base do Produto</Label>
              <Input
                id="baseName"
                value={baseName}
                onChange={(e) => setBaseName(e.target.value)}
                placeholder="Ex: Sorvete"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
              <Input
                id="costPrice"
                value={displayCost}
                onChange={handleCostPriceChange}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center space-x-2 mb-2">
                <Checkbox
                  id="definePrice"
                  checked={definePrice}
                  onCheckedChange={(checked) => {
                    setDefinePrice(checked === true);
                  }}
                />
                <label
                  htmlFor="definePrice"
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                >
                  Definir preço de venda agora
                </label>
              </div>
              {definePrice && (
                <Input
                  id="sellingPrice"
                  value={displayPrice}
                  onChange={handleSellingPriceChange}
                  placeholder="Preço de Venda (R$)"
                />
              )}
              {!definePrice && (
                <p className="text-xs text-muted-foreground">
                  Defina o preço de venda mais tarde na tela de precificação
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label htmlFor="stock">Estoque</Label>
              <Input
                id="stock"
                type="number"
                value={stock}
                onChange={(e) => setStock(Number(e.target.value))}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit">Unidade</Label>
              <Select value={unit} onValueChange={setUnit}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma unidade" />
                </SelectTrigger>
                <SelectContent>
                  {PRODUCT_UNITS.map(unit => (
                    <SelectItem key={unit.value} value={unit.value}>{unit.label}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-xs text-muted-foreground">
                Unidade de medida do produto (UN, KG, L, etc.)
              </p>
            </div>
            <div className="space-y-2">
              <Label htmlFor="category">Categoria</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {productCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>{category.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="group">Grupo</Label>
              <Select value={group} onValueChange={setGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um grupo" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhum</SelectItem>
                  {productGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>{group.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="brand">Marca</Label>
              <Select value={brand} onValueChange={setBrand}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma marca" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="none">Nenhuma</SelectItem>
                  {productBrands.map(brand => (
                    <SelectItem key={brand.id} value={brand.id}>{brand.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2 col-span-2">
              <Label htmlFor="variants">Variantes (uma por linha)</Label>
              <Textarea
                id="variants"
                value={variants}
                onChange={(e) => setVariants(e.target.value)}
                rows={5}
                placeholder="Ex: Chocolate&#10;Morango&#10;Baunilha"
              />
              <p className="text-sm text-muted-foreground">
                Digite cada variante (sabor, cor, etc.) em uma linha. Será combinado com o nome base.
              </p>
            </div>
          </div>
          <div className="flex justify-end space-x-2 mt-4">
            <Button variant="outline" onClick={() => onOpenChange(false)} disabled={isProcessing}>Cancelar</Button>
            <Button 
              onClick={handleSubmit} 
              disabled={isProcessing}
            >
              {isProcessing ? 'Processando...' : 'Cadastrar Produtos'}
            </Button>
          </div>
        </CustomScrollArea>
      </DialogContent>
    </Dialog>
  );
};

export default BulkProductUpload;
