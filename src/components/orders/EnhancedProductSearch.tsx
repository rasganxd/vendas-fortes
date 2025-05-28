
import React, { useState, useEffect } from 'react';
import { Product, Customer } from '@/types';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Search, ShoppingCart, Clock, Star, Barcode } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import ProductSearchResults from './ProductSearchResults';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import { useAppData } from '@/context/providers/AppDataProvider';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';

interface EnhancedProductSearchProps {
  products: Product[];
  handleAddItem: (product: Product, quantity: number, price: number, unit?: string) => void;
  productInputRef: React.RefObject<HTMLInputElement>;
  isEditMode: boolean;
  selectedCustomer: Customer | null;
}

export default function EnhancedProductSearch({
  products: propProducts,
  handleAddItem,
  productInputRef,
  isEditMode,
  selectedCustomer
}: EnhancedProductSearchProps) {
  const { products: centralizedProducts } = useAppData();
  const { units } = useProductUnits();
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  const [recentProducts, setRecentProducts] = useState<Product[]>([]);
  const [popularProducts, setPopularProducts] = useState<Product[]>([]);
  
  const products = centralizedProducts.length > 0 ? centralizedProducts : propProducts;

  const {
    searchTerm,
    selectedProduct,
    quantity,
    price,
    showResults,
    sortedProducts,
    resultsRef,
    quantityInputRef,
    priceInputRef,
    isAddingItem,
    handleSearch,
    handleSearchKeyDown,
    handleProductSelect: originalHandleProductSelect,
    handleQuantityChange,
    handlePriceChange: originalHandlePriceChange,
    incrementQuantity,
    decrementQuantity
  } = useProductSearch({
    products,
    addItemToOrder: (product, qty, prc) => handleAddItem(product, qty, prc, selectedUnit),
    inputRef: productInputRef
  });

  // Load recent and popular products
  useEffect(() => {
    // Simulate recent products (could come from localStorage or API)
    const recent = products.slice(0, 5);
    setRecentProducts(recent);
    
    // Simulate popular products (could come from sales data)
    const popular = products.slice(5, 10);
    setPopularProducts(popular);
  }, [products]);

  const handleProductSelect = (product: Product) => {
    originalHandleProductSelect(product);
    setSelectedUnit(product.unit || 'UN');
  };

  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    if (selectedProduct) {
      let convertedPrice = selectedProduct.price;
      
      if (selectedProduct.hasSubunit && selectedProduct.subunit === unit) {
        const mainUnitData = units.find(u => u.value === selectedProduct.unit);
        const mainUnitConversionRate = mainUnitData?.conversionRate || 1;
        convertedPrice = selectedProduct.price / mainUnitConversionRate;
      }
      
      originalHandlePriceChange({ target: { value: convertedPrice.toFixed(2).replace('.', ',') } } as any);
    }
  };

  const handleAddToOrder = () => {
    if (selectedProduct && quantity && quantity > 0) {
      handleAddItem(selectedProduct, quantity, price, selectedUnit);
    }
  };

  const handleQuickAdd = (product: Product) => {
    handleProductSelect(product);
    // Auto-add with quantity 1 after a brief delay
    setTimeout(() => {
      handleAddItem(product, 1, product.price, product.unit || 'UN');
    }, 100);
  };
  
  const formatPriceDisplay = (value: number): string => {
    if (value === 0) return '';
    return value.toFixed(2).replace('.', ',');
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="text-lg font-semibold text-gray-800 flex items-center gap-2">
          <ShoppingCart size={20} />
          Adicionar Produtos
        </h3>
        <Badge variant="outline" className="text-xs">
          <Barcode size={12} className="mr-1" />
          Digite código ou nome
        </Badge>
      </div>

      {/* Enhanced Search Bar */}
      <div className="relative">
        <div className="flex items-center space-x-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={20} />
            <Input
              ref={productInputRef}
              type="text"
              className="pl-10 h-12 text-lg border-gray-300 focus:border-blue-500 focus:ring-blue-500"
              placeholder="Buscar produto pelo nome ou código..."
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
              disabled={isAddingItem}
            />
            
            {showResults && (
              <ProductSearchResults
                products={sortedProducts.slice(0, 8)}
                resultsRef={resultsRef}
                onSelectProduct={handleProductSelect}
              />
            )}
          </div>
          
          <QuantityInput
            quantity={quantity}
            onQuantityChange={handleQuantityChange}
            onIncrement={incrementQuantity}
            onDecrement={decrementQuantity}
            inputRef={quantityInputRef}
            onKeyDown={(e) => e.key === 'Enter' && priceInputRef.current?.focus()}
            className="h-12 w-24"
          />
          
          <UnitSelector
            selectedUnit={selectedUnit}
            onUnitChange={handleUnitChange}
            product={selectedProduct}
            className="h-12 w-20"
          />
          
          <Input
            ref={priceInputRef}
            type="text"
            className="h-12 text-center w-32 border-gray-300"
            placeholder="Preço"
            value={formatPriceDisplay(price)}
            onChange={originalHandlePriceChange}
            onKeyDown={(e) => e.key === 'Enter' && handleAddToOrder()}
            disabled={isAddingItem}
          />
          
          <Button 
            type="button"
            className="h-12 w-36 bg-green-600 hover:bg-green-700 text-white font-medium"
            disabled={!selectedProduct || quantity === null || quantity <= 0 || isAddingItem}
            onClick={handleAddToOrder}
          >
            <ShoppingCart size={18} className="mr-2" />
            {isAddingItem ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </div>

      {/* Quick Access Products */}
      {!searchTerm && (recentProducts.length > 0 || popularProducts.length > 0) && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Recent Products */}
          {recentProducts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Clock size={16} />
                  Produtos Recentes
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {recentProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleQuickAdd(product)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm truncate">{product.name}</div>
                        <div className="text-xs text-gray-500">Cód: {product.code}</div>
                      </div>
                      <div className="text-sm font-medium">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}

          {/* Popular Products */}
          {popularProducts.length > 0 && (
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-sm flex items-center gap-2">
                  <Star size={16} />
                  Produtos Populares
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2">
                  {popularProducts.map((product) => (
                    <div
                      key={product.id}
                      className="flex items-center justify-between p-2 hover:bg-gray-50 rounded cursor-pointer"
                      onClick={() => handleQuickAdd(product)}
                    >
                      <div className="flex-1">
                        <div className="font-medium text-sm truncate">{product.name}</div>
                        <div className="text-xs text-gray-500">Cód: {product.code}</div>
                      </div>
                      <div className="text-sm font-medium">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  );
}
