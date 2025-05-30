
import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { formatCurrency } from '@/lib/utils';
import { Product } from '@/types';
import { useProducts } from '@/hooks/useProducts';
import { productDiscountService } from '@/services/supabase/productDiscountService';
import { toast } from 'sonner';

export default function ProductPricing() {
  const { products, updateProduct } = useProducts();
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [newPrice, setNewPrice] = useState<string>('');
  const [maxDiscount, setMaxDiscount] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleProductSelect = async (product: Product) => {
    setSelectedProduct(product);
    setNewPrice(product.price?.toString() || '');
    
    // Load discount settings for the product
    try {
      const discountSettings = await productDiscountService.getByProductId(product.id);
      setMaxDiscount(discountSettings?.maxDiscountPercentage?.toString() || '');
    } catch (error) {
      console.error('Erro ao carregar configurações de desconto:', error);
      setMaxDiscount('');
    }
  };

  const handlePriceUpdate = async () => {
    if (!selectedProduct) return;
    
    setIsLoading(true);
    try {
      const price = parseFloat(newPrice);
      const discountPercentage = parseFloat(maxDiscount);
      
      // Update product price
      await updateProduct(selectedProduct.id, { price });
      
      // Update discount settings if provided
      if (discountPercentage > 0) {
        await productDiscountService.upsert(selectedProduct.id, discountPercentage);
      }
      
      toast("Preço atualizado com sucesso!");
      
      // Refresh the selected product data
      const updatedProduct = { ...selectedProduct, price };
      setSelectedProduct(updatedProduct);
      
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      toast("Erro ao atualizar preço");
    } finally {
      setIsLoading(false);
    }
  };

  const calculateMinPrice = () => {
    if (!selectedProduct) return 0;
    const discount = parseFloat(maxDiscount) || 0;
    const price = parseFloat(newPrice) || 0;
    return price * (1 - discount / 100);
  };

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Product Selection */}
        <Card>
          <CardHeader>
            <CardTitle>Selecionar Produto</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2 max-h-96 overflow-y-auto">
              {products.map(product => (
                <div
                  key={product.id}
                  className={`p-3 border rounded cursor-pointer hover:bg-gray-50 ${
                    selectedProduct?.id === product.id ? 'border-blue-500 bg-blue-50' : ''
                  }`}
                  onClick={() => handleProductSelect(product)}
                >
                  <div className="font-medium">{product.name}</div>
                  <div className="text-sm text-gray-500">
                    Código: {product.code} | Preço atual: {formatCurrency(product.price || 0)}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Pricing Configuration */}
        <Card>
          <CardHeader>
            <CardTitle>Configurar Preço</CardTitle>
          </CardHeader>
          <CardContent>
            {selectedProduct ? (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="newPrice">Preço de Venda</Label>
                  <Input
                    id="newPrice"
                    type="number"
                    step="0.01"
                    value={newPrice}
                    onChange={(e) => setNewPrice(e.target.value)}
                    placeholder="0.00"
                  />
                </div>

                <div>
                  <Label htmlFor="maxDiscount">Desconto Máximo (%)</Label>
                  <Input
                    id="maxDiscount"
                    type="number"
                    step="0.01"
                    min="0"
                    max="100"
                    value={maxDiscount}
                    onChange={(e) => setMaxDiscount(e.target.value)}
                    placeholder="0"
                  />
                </div>

                <div className="space-y-2 p-3 bg-gray-50 rounded">
                  <div className="text-sm">
                    <strong>Custo:</strong> {formatCurrency(selectedProduct.cost || 0)}
                  </div>
                  <div className="text-sm">
                    <strong>Margem:</strong> {
                      ((parseFloat(newPrice) - (selectedProduct.cost || 0)) / (selectedProduct.cost || 1) * 100).toFixed(2)
                    }%
                  </div>
                  <div className="text-sm">
                    <strong>Preço mínimo:</strong> {formatCurrency(calculateMinPrice())}
                  </div>
                </div>

                <Button 
                  onClick={handlePriceUpdate}
                  disabled={isLoading || !newPrice}
                  className="w-full"
                >
                  {isLoading ? 'Atualizando...' : 'Atualizar Preço'}
                </Button>
              </div>
            ) : (
              <p className="text-gray-500">Selecione um produto para configurar o preço</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
