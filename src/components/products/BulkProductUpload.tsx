
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

interface BulkProductUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (products: any[]) => Promise<void>;
  productCategories: ProductCategory[];
  productGroups: ProductGroup[];
  productBrands: ProductBrand[];
  nextProductCode: number;
}

const BulkProductUpload = ({
  isOpen,
  onClose,
  onSave,
  productCategories,
  productGroups,
  productBrands,
  nextProductCode
}: BulkProductUploadProps) => {
  const [baseCode, setBaseCode] = useState<number>(nextProductCode);
  const [baseName, setBaseName] = useState<string>('');
  const [baseDescription, setBaseDescription] = useState<string>('');
  const [costPrice, setCostPrice] = useState<number>(0);
  const [salePrice, setSalePrice] = useState<number>(0);
  const [stock, setStock] = useState<number>(0);
  const [minStock, setMinStock] = useState<number>(0);
  const [unit, setUnit] = useState<string>('');
  const [category, setCategory] = useState<string>('');
  const [group, setGroup] = useState<string>('');
  const [brand, setBrand] = useState<string>('');
  const [maxDiscount, setMaxDiscount] = useState<number>(0);
  const [variants, setVariants] = useState<string>('');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const handleSubmit = async () => {
    // Validação básica
    if (!baseName || !costPrice || !salePrice) {
      toast({
        title: "Campos incompletos",
        description: "Preencha pelo menos o nome base, preço de custo e preço de venda.",
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
          description: baseDescription,
          price: salePrice,
          cost: costPrice,
          stock: stock,
          minStock: minStock,
          unit: unit,
          categoryId: category || undefined,
          groupId: group || undefined,
          brandId: brand || undefined,
          maxDiscountPercentage: maxDiscount || 0,
          createdAt: new Date(),
          updatedAt: new Date()
        };
      });

      await onSave(productsToCreate);
      toast({
        title: "Produtos cadastrados",
        description: `${productsToCreate.length} produtos foram cadastrados com sucesso.`,
      });
      
      // Resetar formulário
      setVariants('');
      onClose();
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
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Cadastro em Massa de Produtos</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-4">
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
          <div className="space-y-2 col-span-2">
            <Label htmlFor="baseDescription">Descrição Base</Label>
            <Input
              id="baseDescription"
              value={baseDescription}
              onChange={(e) => setBaseDescription(e.target.value)}
              placeholder="Descrição comum a todos os produtos"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="costPrice">Preço de Custo</Label>
            <Input
              id="costPrice"
              type="number"
              value={costPrice}
              onChange={(e) => setCostPrice(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="salePrice">Preço de Venda</Label>
            <Input
              id="salePrice"
              type="number"
              value={salePrice}
              onChange={(e) => setSalePrice(Number(e.target.value))}
            />
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
            <Label htmlFor="minStock">Estoque Mínimo</Label>
            <Input
              id="minStock"
              type="number"
              value={minStock}
              onChange={(e) => setMinStock(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="unit">Unidade</Label>
            <Input
              id="unit"
              value={unit}
              onChange={(e) => setUnit(e.target.value)}
              placeholder="Ex: UN, KG, L"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="maxDiscount">Desconto Máximo (%)</Label>
            <Input
              id="maxDiscount"
              type="number"
              value={maxDiscount}
              onChange={(e) => setMaxDiscount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="category">Categoria</Label>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
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
          <Button variant="outline" onClick={onClose} disabled={isProcessing}>Cancelar</Button>
          <Button 
            onClick={handleSubmit} 
            disabled={isProcessing} 
            className="bg-sales-800 hover:bg-sales-700"
          >
            {isProcessing ? 'Processando...' : 'Cadastrar Produtos'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BulkProductUpload;
