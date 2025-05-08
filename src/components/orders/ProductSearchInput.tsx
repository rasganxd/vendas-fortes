
import React, { useState, useRef, useEffect } from 'react';
import { Product } from '@/types';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Search, Plus, Minus, ShoppingCart } from 'lucide-react';

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
    console.log("Product selected:", product);
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
      console.log("Adding to order:", selectedProduct, quantity, price);
      addItemToOrder(selectedProduct, quantity, price);
      
      // Reset all form fields completely
      setSearchTerm('');
      setSelectedProduct(null);
      setQuantity(null);
      setPrice(0);
      setShowResults(false);
      
      // Focus back on the search input
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
  
  const filteredProducts = searchTerm
    ? products.filter(product => 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (product.code?.toString() === searchTerm) || 
        (product.code?.toString()?.includes(searchTerm))
      )
    : [];
  
  const sortedProducts = [...filteredProducts].sort((a, b) => {
    // Exact code matches come first
    const aExactCodeMatch = a.code?.toString() === searchTerm;
    const bExactCodeMatch = b.code?.toString() === searchTerm;
    if (aExactCodeMatch && !bExactCodeMatch) return -1;
    if (!aExactCodeMatch && bExactCodeMatch) return 1;
    return 0;
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
              
              {showResults && sortedProducts.length > 0 && (
                <div 
                  ref={resultsRef}
                  className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border rounded-md shadow-lg"
                >
                  {sortedProducts.map(product => (
                    <div
                      key={product.id}
                      className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex justify-between border-b border-gray-100 last:border-0"
                      onClick={() => handleProductSelect(product)}
                    >
                      <div className="flex gap-3">
                        <span className="font-medium text-gray-500">#{product.code}</span>
                        <span className="font-medium">{product.name}</span>
                      </div>
                      <span className="text-gray-600 font-medium">
                        {product.price.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
        
        <div className="flex items-center space-x-3 w-full md:w-auto">
          <div className="flex-none">
            <div className="flex items-center">
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-11 w-11 rounded-r-none border-r-0 hover:bg-gray-50 transition-colors"
                onClick={decrementQuantity}
              >
                <Minus size={16} />
              </Button>
              
              <Input
                ref={quantityInputRef}
                type="text"
                className="w-16 h-11 text-center border-x-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
                value={quantity === null ? '' : quantity.toString()}
                onChange={handleQuantityChange}
                onKeyDown={(e) => e.key === 'Enter' && priceInputRef.current?.focus()}
                placeholder="Qtd"
              />
              
              <Button 
                type="button" 
                variant="outline" 
                size="icon" 
                className="h-11 w-11 rounded-l-none border-l-0 hover:bg-gray-50 transition-colors"
                onClick={incrementQuantity}
              >
                <Plus size={16} />
              </Button>
            </div>
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
