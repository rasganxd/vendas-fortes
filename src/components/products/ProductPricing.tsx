
import React, { useState, useEffect, useMemo } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { EnhancedTable, EnhancedTableHeader, EnhancedTableBody, EnhancedTableRow, EnhancedTableHead, EnhancedTableCell } from '@/components/ui/enhanced-table';
import { PriceInput } from '@/components/ui/price-input';
import { SavingIndicator } from '@/components/ui/saving-indicator';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { productDiscountService } from '@/services/supabase/productDiscountService';
import { useToast } from '@/hooks/use-toast';
import { useOptimizedLogging } from '@/hooks/useOptimizedLogging';
import { Edit, Save, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductPricingRow extends Product {
  maxDiscountPercentage: number;
}

export default function ProductPricing() {
  const { products, updateProduct } = useProducts();
  const { toast } = useToast();
  const { logDebug, logError, logSuccess } = useOptimizedLogging({ component: 'ProductPricing' });
  
  const [pricingData, setPricingData] = useState<ProductPricingRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // Memoized filtered data
  const filteredData = useMemo(() => 
    pricingData.filter(product => 
      product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
      product.code.toString().includes(searchTerm)
    ), [pricingData, searchTerm]
  );

  // Load pricing data with discount settings
  useEffect(() => {
    const loadPricingData = async () => {
      if (products.length === 0) return;
      
      setIsLoading(true);
      try {
        logDebug('Loading pricing data', products.length);
        const discounts = await productDiscountService.getAllDiscounts();
        
        const combined = products.map(product => ({
          ...product,
          maxDiscountPercentage: discounts[product.id] || 0
        }));
        
        setPricingData(combined);
        logSuccess('Pricing data loaded', combined.length);
      } catch (error) {
        logError('Error loading pricing data', error);
        toast({
          title: "Erro ao carregar dados",
          description: "Não foi possível carregar as configurações de desconto"
        });
        // Fallback to products without discounts
        setPricingData(products.map(product => ({
          ...product,
          maxDiscountPercentage: 0
        })));
      } finally {
        setIsLoading(false);
      }
    };

    loadPricingData();
  }, [products, toast, logDebug, logError, logSuccess]);

  const handleEditStart = (product: ProductPricingRow) => {
    setEditingId(product.id);
    setEditPrice(product.price || 0);
    setEditDiscount(product.maxDiscountPercentage.toString());
  };

  const handleEditCancel = () => {
    setEditingId(null);
    setEditPrice(0);
    setEditDiscount('');
  };

  const handleSave = async (productId: string) => {
    try {
      setIsSaving(true);
      
      // Validate price
      if (isNaN(editPrice) || editPrice < 0) {
        toast({
          title: "Preço inválido",
          description: "O preço deve ser um número válido maior ou igual a zero"
        });
        return;
      }

      // Validate discount
      const discountValue = editDiscount.trim();
      let discountPercentage = 0;
      
      if (discountValue !== '') {
        discountPercentage = parseFloat(discountValue.replace(',', '.'));
        
        if (isNaN(discountPercentage) || discountPercentage < 0 || discountPercentage > 100) {
          toast({
            title: "Desconto inválido",
            description: "O desconto deve estar entre 0% e 100%"
          });
          return;
        }
      }

      // Update product price
      await updateProduct(productId, { price: editPrice });
      
      // Update discount settings
      if (discountPercentage > 0) {
        await productDiscountService.upsert(productId, discountPercentage);
      } else {
        try {
          await productDiscountService.delete(productId);
        } catch (error) {
          // Not critical if delete fails (might not exist)
          logDebug('No discount settings to remove', error);
        }
      }
      
      // Update local state
      setPricingData(prev => prev.map(item => 
        item.id === productId 
          ? { ...item, price: editPrice, maxDiscountPercentage: discountPercentage }
          : item
      ));
      
      // Dispatch event for synchronization
      window.dispatchEvent(new CustomEvent('productPriceUpdated', { 
        detail: { productId, newPrice: editPrice } 
      }));
      
      toast({
        title: "Produto atualizado com sucesso!",
        description: `Preço: ${formatCurrency(editPrice)} | Desconto máx: ${discountPercentage.toFixed(1)}%`
      });
      
      setEditingId(null);
      setEditPrice(0);
      setEditDiscount('');
      
    } catch (error) {
      logError('Error saving price and discount', error);
      
      const errorMessage = error instanceof Error ? error.message : "Erro desconhecido";
      toast({
        title: "Erro ao atualizar produto",
        description: errorMessage,
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const calculateMargin = (product: ProductPricingRow): number => {
    if (!product.cost || product.cost === 0) return 0;
    const price = product.price || 0;
    return ((price - product.cost) / product.cost) * 100;
  };

  const calculateMinPrice = (product: ProductPricingRow): number => {
    if (!product.price || product.maxDiscountPercentage === 0) return product.price || 0;
    return product.price * (1 - product.maxDiscountPercentage / 100);
  };

  const getMarginColor = (margin: number): string => {
    if (margin >= 30) return 'text-green-600';
    if (margin >= 15) return 'text-yellow-600';
    return 'text-red-600';
  };

  return (
    <div className="space-y-6">
      <SavingIndicator isVisible={isSaving} message="Salvando preço e desconto..." />

      <Card>
        <CardHeader>
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle>Precificação de Produtos</CardTitle>
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
              <Input
                placeholder="Buscar produto..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10 w-80"
              />
            </div>
          </div>
        </CardHeader>
      </Card>

      <Card>
        <CardContent className="p-0">
          <EnhancedTable isLoading={isLoading}>
            <EnhancedTableHeader>
              <EnhancedTableRow>
                <EnhancedTableHead>Código</EnhancedTableHead>
                <EnhancedTableHead>Produto</EnhancedTableHead>
                <EnhancedTableHead>Custo</EnhancedTableHead>
                <EnhancedTableHead>Preço de Venda</EnhancedTableHead>
                <EnhancedTableHead>Margem</EnhancedTableHead>
                <EnhancedTableHead>Desc. Máx (%)</EnhancedTableHead>
                <EnhancedTableHead>Preço Mín.</EnhancedTableHead>
                <EnhancedTableHead>Ações</EnhancedTableHead>
              </EnhancedTableRow>
            </EnhancedTableHeader>
            <EnhancedTableBody>
              {filteredData.map((product) => (
                <EnhancedTableRow key={product.id}>
                  <EnhancedTableCell className="font-medium">
                    {product.code}
                  </EnhancedTableCell>
                  <EnhancedTableCell>{product.name}</EnhancedTableCell>
                  <EnhancedTableCell>
                    {formatCurrency(product.cost || 0)}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    {editingId === product.id ? (
                      <PriceInput
                        value={editPrice}
                        onChange={setEditPrice}
                        className="w-32"
                        autoFocus
                      />
                    ) : (
                      formatCurrency(product.price || 0)
                    )}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    <span className={getMarginColor(calculateMargin(product))}>
                      {calculateMargin(product).toFixed(1)}%
                    </span>
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    {editingId === product.id ? (
                      <Input
                        type="text"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(e.target.value)}
                        placeholder="0.0"
                        className="w-20"
                      />
                    ) : (
                      product.maxDiscountPercentage.toFixed(1) + '%'
                    )}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    {formatCurrency(calculateMinPrice(product))}
                  </EnhancedTableCell>
                  <EnhancedTableCell>
                    <div className="flex items-center gap-2">
                      {editingId === product.id ? (
                        <>
                          <Button
                            size="sm"
                            onClick={() => handleSave(product.id)}
                            disabled={isSaving}
                            className="h-7 w-7 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
                            disabled={isSaving}
                            className="h-7 w-7 p-0"
                          >
                            <X className="h-3 w-3" />
                          </Button>
                        </>
                      ) : (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleEditStart(product)}
                          className="h-7 w-7 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                      )}
                    </div>
                  </EnhancedTableCell>
                </EnhancedTableRow>
              ))}
            </EnhancedTableBody>
          </EnhancedTable>
        </CardContent>
      </Card>

      {filteredData.length === 0 && !isLoading && (
        <Card>
          <CardContent className="py-8">
            <div className="text-center text-gray-500">
              <p>Nenhum produto encontrado.</p>
              {searchTerm && (
                <p className="text-sm mt-2">
                  Tente ajustar os termos de busca.
                </p>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
