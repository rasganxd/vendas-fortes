
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Minus } from 'lucide-react';

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
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [quantity, setQuantity] = useState<number | null>(null);
  const [price, setPrice] = useState<number>(0);
  const [showResults, setShowResults] = useState(false);
  
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);
  const resultsRef = useRef<HTMLDivElement>(null);
  
  const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    setShowResults(e.target.value.length > 0);
  };
  
  const handleSearchKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      
      // Check if input is a product code
      const codeMatch = searchTerm.match(/^(\d+)$/);
      if (codeMatch) {
        const productCode = codeMatch[1];
        const product = products.find(p => p.code?.toString() === productCode);
        
        if (product) {
          handleProductSelect(product);
          return;
        }
      }
      
      // If not a direct code match, and we have results, select the first one
      if (sortedProducts.length > 0) {
        handleProductSelect(sortedProducts[0]);
      }
    }
  };
  
  const handleProductSelect = (product: Product) => {
    setSelectedProduct(product);
    setSearchTerm(product.name);
    setPrice(product.price);
    setShowResults(false);
    setQuantity(1); // Set default quantity to 1 when selecting a product
    setTimeout(() => quantityInputRef.current?.focus(), 50);
  };
  
  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Allow empty value
    if (e.target.value === '') {
      setQuantity(null);
      return;
    }
    
    // Only allow numbers and prevent negative values
    const value = e.target.value.replace(/[^\d]/g, '');
    const numericValue = value ? parseInt(value, 10) : null;
    
    setQuantity(numericValue);
  };
  
  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/[^\d.,]/g, '').replace(',', '.');
    setPrice(parseFloat(value) || 0);
  };
  
  const handleAddToOrder = () => {
    if (selectedProduct && (quantity !== null && quantity > 0)) {
      addItemToOrder(selectedProduct, quantity, price);
      setSearchTerm('');
      setSelectedProduct(null);
      setQuantity(null); // Reset to empty
      setPrice(0);
      setTimeout(() => inputRef?.current?.focus(), 50);
    }
  };
  
  const incrementQuantity = () => {
    setQuantity(prev => (prev === null ? 1 : prev + 1));
  };
  
  const decrementQuantity = () => {
    setQuantity(prev => {
      if (prev === null) return null;
      return prev > 1 ? prev - 1 : 1;
    });
  };
  
  // Close results when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (resultsRef.current && !resultsRef.current.contains(event.target as Node)) {
        setShowResults(false);
      }
    }
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);
  
  // Update the filtering logic to prioritize exact code matches and show code in the results
  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.code?.toString() === searchTerm) || 
        (product.code?.toString()?.includes(searchTerm))
      )
    : [];
  
  // Sort results to prioritize exact code matches
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Exact code matches come first
    const aExactCodeMatch = a.code?.toString() === searchTerm;
    const bExactCodeMatch = b.code?.toString() === searchTerm;
    if (aExactCodeMatch && !bExactCodeMatch) return -1;
    if (!aExactCodeMatch && bExactCodeMatch) return 1;
    return 0;
  });
  
  if (inlineLayout) {
    return (
      <div className="relative w-full">
        <div className="flex items-center gap-2 h-10">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
            <Input
              ref={inputRef}
              type="text"
              className="pl-10 h-10"
              placeholder="Buscar produto pelo nome ou código"
              value={searchTerm}
              onChange={handleSearch}
              onKeyDown={handleSearchKeyDown}
              autoComplete="off"
            />
            {showResults && sortedProducts.length > 0 && (
              <div 
                ref={resultsRef}
                className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border rounded-md shadow-lg"
              >
                {sortedProducts.map(product => (
                  <div
                    key={product.id}
                    className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                    onClick={() => handleProductSelect(product)}
                  >
                    <div className="flex gap-2">
                      <span className="font-medium text-gray-500">#{product.code}</span>
                      <span>{product.name}</span>
                    </div>
                    <span className="text-gray-600">
                      {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  </div>
                ))}
              </div>
            )}
          </div>
          
          <div className="flex items-center">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-r-none border-r-0"
              onClick={decrementQuantity}
            >
              <Minus size={16} />
            </Button>
            <Input
              ref={quantityInputRef}
              type="text"
              className="w-14 h-10 text-center border-x-0 rounded-none"
              value={quantity === null ? '' : quantity.toString()}
              onChange={handleQuantityChange}
              onKeyDown={(e) => e.key === 'Enter' && priceInputRef.current?.focus()}
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-10 w-10 rounded-l-none border-l-0"
              onClick={incrementQuantity}
            >
              <Plus size={16} />
            </Button>
          </div>
          
          {/* Add price field */}
          <div className="w-28">
            <Input
              ref={priceInputRef}
              type="text"
              className="h-10 text-center"
              placeholder="Valor"
              value={price ? price.toString() : ''}
              onChange={handlePriceChange}
              onKeyDown={(e) => e.key === 'Enter' && handleAddToOrder()}
            />
          </div>
          
          <Button 
            type="button"
            className="h-10 bg-gray-500 hover:bg-gray-600 text-white"
            onClick={handleAddToOrder}
          >
            Adicionar
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-500" size={18} />
        <Input
          type="text"
          className="pl-10"
          placeholder="Buscar produto pelo nome ou código"
          value={searchTerm}
          onChange={handleSearch}
          onKeyDown={handleSearchKeyDown}
          autoComplete="off"
        />
        {showResults && sortedProducts.length > 0 && (
          <div 
            ref={resultsRef}
            className="absolute z-10 mt-1 w-full max-h-60 overflow-auto bg-white border rounded-md shadow-lg"
          >
            {sortedProducts.map(product => (
              <div
                key={product.id}
                className="px-4 py-2 hover:bg-gray-100 cursor-pointer flex justify-between"
                onClick={() => handleProductSelect(product)}
              >
                <div className="flex gap-2">
                  <span className="font-medium text-gray-500">#{product.code}</span>
                  <span>{product.name}</span>
                </div>
                <span className="text-gray-600">
                  {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
      
      <div className="grid grid-cols-3 gap-4">
        <div>
          <label className="block text-sm text-gray-700 mb-1">Quantidade</label>
          <div className="flex items-center">
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-10 w-10"
              onClick={decrementQuantity}
            >
              <Minus size={18} />
            </Button>
            <Input
              type="text"
              className="mx-2 text-center"
              value={quantity === null ? '' : quantity.toString()}
              onChange={handleQuantityChange}
              placeholder="Quantidade"
            />
            <Button 
              type="button" 
              variant="outline" 
              size="icon" 
              className="h-10 w-10"
              onClick={incrementQuantity}
            >
              <Plus size={18} />
            </Button>
          </div>
        </div>
        
        <div>
          <label className="block text-sm text-gray-700 mb-1">Preço Unitário</label>
          <Input
            type="text"
            value={price.toString()}
            onChange={handlePriceChange}
          />
        </div>
        
        <div className="flex items-end">
          <Button 
            type="button" 
            className="w-full bg-sales-800 hover:bg-sales-700"
            disabled={!selectedProduct || quantity === null || quantity <= 0}
            onClick={handleAddToOrder}
          >
            Adicionar ao Pedido
          </Button>
        </div>
      </div>
    </div>
  );
}
