
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { EnhancedTable, EnhancedTableHeader, EnhancedTableBody, EnhancedTableRow, EnhancedTableHead, EnhancedTableCell } from '@/components/ui/enhanced-table';
import { PriceInput } from '@/components/ui/price-input';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { productDiscountService } from '@/services/supabase/productDiscountService';
import { toast } from 'sonner';
import { Edit, Save, X, Search } from 'lucide-react';
import { Input } from '@/components/ui/input';

interface ProductPricingRow extends Product {
  maxDiscountPercentage: number;
}

export default function ProductPricing() {
  const { products, updateProduct } = useProducts();
  const [pricingData, setPricingData] = useState<ProductPricingRow[]>([]);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [editDiscount, setEditDiscount] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  // Load pricing data with discount settings
  useEffect(() => {
    const loadPricingData = async () => {
      setIsLoading(true);
      try {
        const discounts = await productDiscountService.getAllDiscounts();
        
        const combined = products.map(product => ({
          ...product,
          maxDiscountPercentage: discounts[product.id] || 0
        }));
        
        setPricingData(combined);
      } catch (error) {
        console.error('Erro ao carregar dados de precificação:', error);
        setPricingData(products.map(product => ({
          ...product,
          maxDiscountPercentage: 0
        })));
      } finally {
        setIsLoading(false);
      }
    };

    loadPricingData();
  }, [products]);

  const filteredData = pricingData.filter(product => 
    product.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    product.code.toString().includes(searchTerm)
  );

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
      const discountPercentage = parseFloat(editDiscount);
      
      if (isNaN(editPrice) || editPrice < 0) {
        toast("Preço inválido", {
          description: "O preço deve ser um número válido maior ou igual a zero"
        });
        return;
      }

      // Update product price
      await updateProduct(productId, { price: editPrice });
      
      // Update discount settings if provided
      if (discountPercentage > 0) {
        await productDiscountService.upsert(productId, discountPercentage);
      }
      
      // Update local state
      setPricingData(prev => prev.map(item => 
        item.id === productId 
          ? { ...item, price: editPrice, maxDiscountPercentage: discountPercentage }
          : item
      ));
      
      // Disparar evento para sincronização com outros componentes
      window.dispatchEvent(new CustomEvent('productPriceUpdated', { 
        detail: { productId, newPrice: editPrice } 
      }));
      
      toast("Preço atualizado com sucesso!");
      setEditingId(null);
      setEditPrice(0);
      setEditDiscount('');
      
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      toast("Erro ao atualizar preço");
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
      {/* Header */}
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

      {/* Pricing Table */}
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
                        type="number"
                        step="0.01"
                        min="0"
                        max="100"
                        value={editDiscount}
                        onChange={(e) => setEditDiscount(e.target.value)}
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
                            className="h-7 w-7 p-0"
                          >
                            <Save className="h-3 w-3" />
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={handleEditCancel}
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
