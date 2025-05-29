
import React, { useEffect, useState } from 'react';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart, AlertTriangle } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import ProductSearchResults from './ProductSearchResults';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import PriceValidation from '@/components/products/pricing/PriceValidation';
import { useAppData } from '@/context/providers/AppDataProvider';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';
import { calculateUnitPrice, formatBrazilianPrice } from '@/utils/priceConverter';

interface ProductSearchInputProps {
  products: Product[];
  addItemToOrder: (product: Product, quantity: number, price: number, unit?: string) => void;
  inlineLayout?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function ProductSearchInput({
  products: propProducts,
  addItemToOrder,
  inlineLayout = false,
  inputRef
}: ProductSearchInputProps) {
  const { products: centralizedProducts, refreshProducts } = useAppData();
  const { units } = useProductUnits();
  const [selectedUnit, setSelectedUnit] = useState<string>('');
  
  const products = centralizedProducts.length > 0 ? centralizedProducts : propProducts;
  
  // Listen for product updates
  useEffect(() => {
    const handleProductsUpdated = () => {
      console.log("Products updated event received in ProductSearchInput");
    };

    window.addEventListener('productsUpdated', handleProductsUpdated);
    
    return () => {
      window.removeEventListener('productsUpdated', handleProductsUpdated);
    };
  }, []);

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
    currentPriceError,
    isCurrentPriceValid,
    handleSearch,
    handleSearchKeyDown,
    handleProductSelect: originalHandleProductSelect,
    handleQuantityChange,
    handlePriceChange: originalHandlePriceChange,
    handleAddToOrder: originalHandleAddToOrder,
    incrementQuantity,
    decrementQuantity
  } = useProductSearch({
    products,
    addItemToOrder: (product, qty, prc) => addItemToOrder(product, qty, prc, selectedUnit),
    inputRef
  });

  // Update selected unit when product changes
  const handleProductSelect = (product: Product) => {
    console.log("📦 Produto selecionado:", product.name, {
      price: product.price,
      unit: product.unit,
      subunit: product.subunit,
      hasSubunit: product.hasSubunit,
      subunitRatio: product.subunitRatio
    });
    
    originalHandleProductSelect(product);
    
    // Set default unit to product's main unit
    const defaultUnit = product.unit || 'UN';
    setSelectedUnit(defaultUnit);
    
    // Calculate correct price for default unit
    const correctPrice = calculateUnitPrice(product, defaultUnit);
    console.log(`💰 Preço calculado para ${defaultUnit}: R$ ${correctPrice.toFixed(2)}`);
    
    // Update the price in the form
    originalHandlePriceChange({ 
      target: { value: formatBrazilianPrice(correctPrice) } 
    } as any);
  };

  // Calculate price when unit changes
  const handleUnitChange = (unit: string) => {
    console.log("🔄 Mudança de unidade:", unit);
    setSelectedUnit(unit);
    
    if (selectedProduct) {
      // Use the new calculateUnitPrice function
      const correctPrice = calculateUnitPrice(selectedProduct, unit);
      console.log(`💰 Novo preço para ${unit}: R$ ${correctPrice.toFixed(2)}`);
      
      // Update the price field
      originalHandlePriceChange({ 
        target: { value: formatBrazilianPrice(correctPrice) } 
      } as any);
    }
  };

  const handleAddToOrder = () => {
    if (selectedProduct && quantity && quantity > 0 && isCurrentPriceValid) {
      console.log("🛒 Adicionando ao pedido:", {
        product: selectedProduct.name,
        quantity,
        price,
        unit: selectedUnit
      });
      addItemToOrder(selectedProduct, quantity, price, selectedUnit);
    }
  };
  
  const formatPriceDisplay = (value: number): string => {
    if (value === 0) return '';
    return value.toFixed(2).replace('.', ',');
  };
  
  // Calculate unit conversion display
  const getConversionDisplay = () => {
    if (!selectedProduct || !selectedUnit || selectedUnit === selectedProduct.unit) {
      return null;
    }
    
    if (selectedProduct.hasSubunit && selectedProduct.subunit === selectedUnit && selectedProduct.subunitRatio) {
      // Show how many main units this subunit quantity represents
      const mainUnitQty = (quantity || 0) / selectedProduct.subunitRatio;
      return `${quantity || 0} ${selectedUnit} = ${mainUnitQty.toFixed(3)} ${selectedProduct.unit}`;
    }
    
    return null;
  };
  
  return (
    <div className="relative w-full z-10">
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full">
          <div className="flex items-center">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
              <Input
                ref={inputRef}
                type="text"
                className="pl-10 h-11 border-gray-300 focus:border-blue-400 focus:ring-blue-400"
                placeholder="Buscar produto pelo nome ou código"
                value={searchTerm}
                onChange={handleSearch}
                onKeyDown={handleSearchKeyDown}
                autoComplete="off"
                disabled={isAddingItem}
              />
              
              {showResults && (
                <ProductSearchResults
                  products={sortedProducts}
                  resultsRef={resultsRef}
                  onSelectProduct={handleProductSelect}
                />
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex-none">
            <QuantityInput
              quantity={quantity}
              onQuantityChange={handleQuantityChange}
              onIncrement={incrementQuantity}
              onDecrement={decrementQuantity}
              inputRef={quantityInputRef}
              onKeyDown={(e) => e.key === 'Enter' && priceInputRef.current?.focus()}
            />
          </div>
          
          <div className="flex-none">
            <UnitSelector
              selectedUnit={selectedUnit}
              onUnitChange={handleUnitChange}
              product={selectedProduct}
              className="h-11 w-20"
            />
          </div>
          
          <div className="flex-none">
            <Input
              ref={priceInputRef}
              type="text"
              className={`h-11 text-center w-28 border-gray-300 ${
                !isCurrentPriceValid ? 'border-red-500 bg-red-50' : ''
              }`}
              placeholder="Preço"
              value={formatPriceDisplay(price)}
              onChange={originalHandlePriceChange}
              onKeyDown={(e) => e.key === 'Enter' && isCurrentPriceValid && handleAddToOrder()}
              disabled={isAddingItem}
            />
          </div>
          
          <Button 
            type="button"
            className="h-11 flex-none w-32 bg-sales-800 hover:bg-sales-700 text-white"
            disabled={!selectedProduct || quantity === null || quantity <= 0 || isAddingItem || !isCurrentPriceValid}
            onClick={handleAddToOrder}
          >
            <ShoppingCart size={18} className="mr-2" />
            {isAddingItem ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </div>
      
      {/* Validação de preço */}
      {selectedProduct && (
        <div className="mt-2">
          <PriceValidation
            product={selectedProduct}
            currentPrice={price}
            className="text-sm"
          />
        </div>
      )}

      {/* Erro de validação */}
      {currentPriceError && (
        <div className="mt-2 flex items-center text-sm text-red-600 bg-red-50 p-2 rounded">
          <AlertTriangle className="h-4 w-4 mr-2" />
          <span>{currentPriceError}</span>
        </div>
      )}
      
      {getConversionDisplay() && (
        <div className="mt-2 text-xs text-gray-500">
          {getConversionDisplay()}
        </div>
      )}
      
      {/* Mostrar informação da conversão de preço */}
      {selectedProduct && selectedProduct.hasSubunit && selectedUnit && (
        <div className="mt-1 text-xs text-blue-600">
          {selectedUnit === selectedProduct.subunit ? 
            `Preço individual: R$ ${formatPriceDisplay(price)} (de uma ${selectedProduct.unit} com ${selectedProduct.subunitRatio} ${selectedProduct.subunit})` :
            `Preço da ${selectedProduct.unit}: R$ ${formatPriceDisplay(price)}`
          }
        </div>
      )}
    </div>
  );
}
