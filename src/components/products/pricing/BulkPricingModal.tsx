
import React, { useState, useEffect } from 'react';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { Product, ProductCategory, ProductGroup } from '@/types';
import { formatCurrency } from "@/lib/utils";

interface BulkPricingModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  products: Product[];
  productCategories: ProductCategory[];
  productGroups: ProductGroup[];
  onApplyChanges: (changes: BulkPricingChanges) => void;
}

interface BulkPricingChanges {
  selectedProducts: string[];
  priceChanges?: {
    mode: 'percentage' | 'fixed' | 'absolute';
    value: number;
  };
  minPriceChange?: number;
  maxPriceChange?: number;
}

interface ProductPreview {
  id: string;
  name: string;
  currentPrice: number;
  newPrice: number;
  currentMinPrice?: number;
  newMinPrice?: number;
  currentMaxPrice?: number;
  newMaxPrice?: number;
}

export const BulkPricingModal: React.FC<BulkPricingModalProps> = ({
  open,
  onOpenChange,
  products,
  productCategories,
  productGroups,
  onApplyChanges
}) => {
  const [selectedProducts, setSelectedProducts] = useState<Set<string>>(new Set());
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedGroup, setSelectedGroup] = useState<string>('all');
  const [markupMode, setMarkupMode] = useState<string>('percentage');
  const [bulkValue, setBulkValue] = useState<number>(0);
  const [bulkMinPrice, setBulkMinPrice] = useState<number>(0);
  const [bulkMaxPrice, setBulkMaxPrice] = useState<number>(0);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  const [showPreview, setShowPreview] = useState(false);
  const [productPreviews, setProductPreviews] = useState<ProductPreview[]>([]);

  // Filter products based on category and group
  useEffect(() => {
    let filtered = products;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryId === selectedCategory);
    }

    if (selectedGroup !== 'all') {
      filtered = filtered.filter(product => product.groupId === selectedGroup);
    }

    setFilteredProducts(filtered);
  }, [products, selectedCategory, selectedGroup]);

  const handleSelectAll = () => {
    if (selectedProducts.size === filteredProducts.length) {
      setSelectedProducts(new Set());
    } else {
      const allIds = new Set(filteredProducts.map(product => product.id));
      setSelectedProducts(allIds);
    }
  };

  const handleSelectProduct = (id: string) => {
    const newSelected = new Set(selectedProducts);
    if (newSelected.has(id)) {
      newSelected.delete(id);
    } else {
      newSelected.add(id);
    }
    setSelectedProducts(newSelected);
  };

  const generatePreview = () => {
    if (selectedProducts.size === 0) {
      toast("Nenhum produto selecionado", {
        description: "Selecione produtos para gerar a previsão.",
        style: {
          backgroundColor: 'rgb(239, 68, 68)',
          color: 'white'
        }
      });
      return;
    }

    const previews: ProductPreview[] = [];
    
    selectedProducts.forEach(productId => {
      const product = products.find(p => p.id === productId);
      if (!product) return;
      
      let newPrice = product.price;
      
      if (bulkValue > 0) {
        if (markupMode === 'percentage') {
          const markup = product.cost * (bulkValue / 100);
          newPrice = product.cost + markup;
        } else if (markupMode === 'fixed') {
          newPrice = product.cost + bulkValue;
        } else if (markupMode === 'absolute') {
          newPrice = bulkValue;
        }
      }
      
      previews.push({
        id: product.id,
        name: product.name,
        currentPrice: product.price,
        newPrice: newPrice,
        currentMinPrice: product.minPrice,
        newMinPrice: bulkMinPrice > 0 ? bulkMinPrice : product.minPrice,
        currentMaxPrice: product.maxPrice,
        newMaxPrice: bulkMaxPrice > 0 ? bulkMaxPrice : product.maxPrice
      });
    });

    setProductPreviews(previews);
    setShowPreview(true);
  };

  const applyChanges = () => {
    const changes: BulkPricingChanges = {
      selectedProducts: Array.from(selectedProducts)
    };

    if (bulkValue > 0) {
      changes.priceChanges = {
        mode: markupMode as 'percentage' | 'fixed' | 'absolute',
        value: bulkValue
      };
    }

    if (bulkMinPrice > 0) {
      changes.minPriceChange = bulkMinPrice;
    }

    if (bulkMaxPrice > 0) {
      changes.maxPriceChange = bulkMaxPrice;
    }

    onApplyChanges(changes);
    onOpenChange(false);
    
    // Reset form
    setSelectedProducts(new Set());
    setBulkValue(0);
    setBulkMinPrice(0);
    setBulkMaxPrice(0);
    setShowPreview(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Precificação em Massa</DialogTitle>
          <DialogDescription>
            Configure preços para múltiplos produtos simultaneamente
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Filtros */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Filtrar por Categoria</Label>
              <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as categorias" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as categorias</SelectItem>
                  {productCategories.map(category => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label>Filtrar por Grupo</Label>
              <Select value={selectedGroup} onValueChange={setSelectedGroup}>
                <SelectTrigger>
                  <SelectValue placeholder="Todos os grupos" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos os grupos</SelectItem>
                  {productGroups.map(group => (
                    <SelectItem key={group.id} value={group.id}>
                      {group.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          {/* Seleção de produtos */}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm">
                Seleção de Produtos ({filteredProducts.length} produtos)
              </CardTitle>
              <div className="flex items-center space-x-2">
                <Checkbox 
                  checked={filteredProducts.length > 0 && selectedProducts.size === filteredProducts.length}
                  onCheckedChange={handleSelectAll}
                />
                <Label className="text-sm">Selecionar todos os produtos filtrados</Label>
              </div>
            </CardHeader>
            <CardContent className="max-h-40 overflow-y-auto">
              <div className="space-y-2">
                {filteredProducts.map(product => (
                  <div key={product.id} className="flex items-center space-x-2">
                    <Checkbox 
                      checked={selectedProducts.has(product.id)}
                      onCheckedChange={() => handleSelectProduct(product.id)}
                    />
                    <Label className="text-sm flex-1">
                      {product.code} - {product.name} (Atual: {formatCurrency(product.price)})
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurações de preço */}
          <div className="space-y-4">
            <Separator />
            <h3 className="text-lg font-medium">Preços de Venda</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Modo de Precificação</Label>
                <Select value={markupMode} onValueChange={setMarkupMode}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="percentage">Markup % sobre custo</SelectItem>
                    <SelectItem value="fixed">Valor fixo sobre custo</SelectItem>
                    <SelectItem value="absolute">Preço absoluto</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>
                  {markupMode === 'percentage' ? 'Percentual (%)' : 'Valor (R$)'}
                </Label>
                <Input
                  type="number"
                  value={bulkValue || ''}
                  onChange={(e) => setBulkValue(parseFloat(e.target.value) || 0)}
                  placeholder={markupMode === 'percentage' ? 'Ex: 30' : 'Ex: 10.00'}
                  step={markupMode === 'percentage' ? '1' : '0.01'}
                />
              </div>
            </div>

            <Separator />
            <h3 className="text-lg font-medium">Preços Mínimo e Máximo</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Preço Mínimo (R$)</Label>
                <Input
                  type="number"
                  value={bulkMinPrice || ''}
                  onChange={(e) => setBulkMinPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 5.00"
                  step="0.01"
                />
              </div>
              <div className="space-y-2">
                <Label>Preço Máximo (R$)</Label>
                <Input
                  type="number"
                  value={bulkMaxPrice || ''}
                  onChange={(e) => setBulkMaxPrice(parseFloat(e.target.value) || 0)}
                  placeholder="Ex: 100.00"
                  step="0.01"
                />
              </div>
            </div>
          </div>

          {/* Preview */}
          {showPreview && productPreviews.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Previsão das Alterações</CardTitle>
              </CardHeader>
              <CardContent className="max-h-60 overflow-y-auto">
                <div className="space-y-2">
                  {productPreviews.slice(0, 10).map(preview => (
                    <div key={preview.id} className="text-sm border-b pb-2">
                      <div className="font-medium">{preview.name}</div>
                      <div className="grid grid-cols-3 gap-2 text-xs text-muted-foreground">
                        <div>
                          Preço: {formatCurrency(preview.currentPrice)} → {formatCurrency(preview.newPrice)}
                        </div>
                        {preview.newMinPrice !== preview.currentMinPrice && (
                          <div>
                            Min: {formatCurrency(preview.currentMinPrice || 0)} → {formatCurrency(preview.newMinPrice || 0)}
                          </div>
                        )}
                        {preview.newMaxPrice !== preview.currentMaxPrice && (
                          <div>
                            Max: {formatCurrency(preview.currentMaxPrice || 0)} → {formatCurrency(preview.newMaxPrice || 0)}
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  {productPreviews.length > 10 && (
                    <div className="text-xs text-muted-foreground">
                      ...e mais {productPreviews.length - 10} produto(s)
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        <DialogFooter className="flex gap-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancelar
          </Button>
          <Button 
            variant="outline" 
            onClick={generatePreview}
            disabled={selectedProducts.size === 0}
          >
            Gerar Previsão
          </Button>
          <Button 
            onClick={applyChanges}
            disabled={selectedProducts.size === 0 || (bulkValue <= 0 && bulkMinPrice <= 0 && bulkMaxPrice <= 0)}
          >
            Aplicar Alterações
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};

export default BulkPricingModal;
