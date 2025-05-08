
import React from 'react';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, ShoppingCart } from 'lucide-react';
import { useProductSearch } from '@/hooks/useProductSearch';
import ProductSearchResults from './ProductSearchResults';
import QuantityInput from './QuantityInput';

interface ProductSearchInputProps {
  products: Product[];
  addItemToOrder: (product: Product, quantity: number, price: number) => void;
  inlineLayout?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function ProductSearchInput({
  products,
  addItemToOrder,
  inlineLayout = false,
  inputRef
}: ProductSearchInputProps) {
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
    handleSearch,
    handleSearchKeyDown,
    handleProductSelect,
    handleQuantityChange,
    handlePriceChange,
    handleAddToOrder,
    incrementQuantity,
    decrementQuantity
  } = useProductSearch({
    products,
    addItemToOrder,
    inputRef
  });
  
  return (
    <div className="relative w-full">
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
            <Input
              ref={priceInputRef}
              type="text"
              className="h-11 text-center w-28 border-gray-300"
              placeholder="Preço"
              value={price ? price.toString() : ''}
              onChange={handlePriceChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAddToOrder()}
            />
          </div>
          
          <Button 
            type="button"
            className="h-11 flex-none w-32 bg-sales-800 hover:bg-sales-700 text-white"
            disabled={!selectedProduct || quantity === null || quantity <= 0}
            onClick={handleAddToOrder}
          >
            <ShoppingCart size={18} className="mr-2" />
            Adicionar
          </Button>
        </div>
      </div>
    </div>
  );
}
