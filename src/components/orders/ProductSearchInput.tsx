
import React, { useEffect, useState } from 'react';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import ProductSearchResults from './ProductSearchResults';
import QuantityInput from './QuantityInput';
import UnitSelector from '@/components/ui/UnitSelector';
import { useAppData } from '@/context/providers/AppDataProvider';
import { useProductUnits } from '@/components/products/hooks/useProductUnits';

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
    originalHandleProductSelect(product);
    // Set default unit to product's main unit
    setSelectedUnit(product.unit || 'UN');
  };

  // Calculate price when unit changes
  const handleUnitChange = (unit: string) => {
    setSelectedUnit(unit);
    if (selectedProduct) {
      let convertedPrice = selectedProduct.price;
      
      // If product has subunit and selected unit is the subunit
      if (selectedProduct.hasSubunit && selectedProduct.subunit === unit) {
        // Get the main unit's conversion rate from units configuration
        const mainUnitData = units.find(u => u.value === selectedProduct.unit);
        if (mainUnitData && mainUnitData.conversionRate > 0) {
          // Price per subunit = main unit price / main unit conversion rate
          convertedPrice = selectedProduct.price / mainUnitData.conversionRate;
        }
      }
      // If converting from subunit back to main unit
      else if (selectedProduct.hasSubunit && selectedProduct.unit === unit && selectedUnit === selectedProduct.subunit) {
        // Get the main unit's conversion rate from units configuration
        const mainUnitData = units.find(u => u.value === selectedProduct.unit);
        if (mainUnitData && mainUnitData.conversionRate > 0) {
          // Main unit price = subunit price * conversion rate
          convertedPrice = selectedProduct.price;
        }
      }
      
      console.log(`💰 Price conversion for ${selectedProduct.name}: ${unit} = R$ ${convertedPrice.toFixed(2)}`);
      originalHandlePriceChange({ target: { value: convertedPrice.toFixed(2).replace('.', ',') } } as any);
    }
  };

  const handleAddToOrder = () => {
    if (selectedProduct && quantity && quantity > 0) {
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
    
    if (selectedProduct.hasSubunit && selectedProduct.subunit === selectedUnit) {
      // Get the main unit's conversion rate  
      const mainUnitData = units.find(u => u.value === selectedProduct.unit);
      const mainUnitConversionRate = mainUnitData?.conversionRate || 1;
      
      // Show how many main units this subunit quantity represents
      const mainUnitQty = (quantity || 0) / mainUnitConversionRate;
      return `${quantity || 0} ${selectedUnit} = ${mainUnitQty.toFixed(3)} ${selectedProduct.unit}`;
    }
    
    return null;
  };
  
  return (
    <div className="relative w-full" style={{ zIndex: 1 }}>
      <div className="flex flex-col md:flex-row items-start md:items-center gap-4">
        <div className="relative flex-1 w-full" style={{ zIndex: 10 }}>
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
              className="h-11 text-center w-28 border-gray-300"
              placeholder="Preço"
              value={formatPriceDisplay(price)}
              onChange={originalHandlePriceChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAddToOrder()}
              disabled={isAddingItem}
            />
          </div>
          
          <Button 
            type="button"
            className="h-11 flex-none w-32 bg-sales-800 hover:bg-sales-700 text-white"
            disabled={!selectedProduct || quantity === null || quantity <= 0 || isAddingItem}
            onClick={handleAddToOrder}
          >
            <ShoppingCart size={18} className="mr-2" />
            {isAddingItem ? 'Adicionando...' : 'Adicionar'}
          </Button>
        </div>
      </div>
      
      {getConversionDisplay() && (
        <div className="mt-2 text-xs text-gray-500">
          {getConversionDisplay()}
        </div>
      )}
    </div>
  );
}
