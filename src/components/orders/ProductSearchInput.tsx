
import React, { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Search, Package } from 'lucide-react';
import { Card, CardContent } from '@/components/ui/card';
import QuantityInput from './QuantityInput';

interface ProductSearchInputProps {
  addItemToOrder: (productName: string, quantity: number, price: number) => void;
  inlineLayout?: boolean;
  inputRef?: React.RefObject<HTMLInputElement>;
}

export default function ProductSearchInput({
  addItemToOrder,
  inlineLayout = false,
  inputRef
}: ProductSearchInputProps) {
  const [productName, setProductName] = useState('');
  const [quantity, setQuantity] = useState<number | null>(1);
  const [price, setPrice] = useState<number | null>(null);
  const quantityInputRef = useRef<HTMLInputElement>(null);
  const priceInputRef = useRef<HTMLInputElement>(null);

  const handleAddItem = () => {
    if (!productName.trim() || !quantity || quantity <= 0 || !price || price <= 0) {
      return;
    }

    addItemToOrder(productName.trim(), quantity, price);
    
    // Reset form
    setProductName('');
    setQuantity(1);
    setPrice(null);
    
    // Focus back to product input
    if (inputRef?.current) {
      inputRef.current.focus();
    }
  };

  const handleProductNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setProductName(e.target.value);
  };

  const handleQuantityChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setQuantity(null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue > 0) {
        setQuantity(numValue);
      }
    }
  };

  const handlePriceChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    if (value === '') {
      setPrice(null);
    } else {
      const numValue = parseFloat(value);
      if (!isNaN(numValue) && numValue >= 0) {
        setPrice(numValue);
      }
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.currentTarget === inputRef?.current) {
        quantityInputRef.current?.focus();
      } else if (e.currentTarget === quantityInputRef.current) {
        priceInputRef.current?.focus();
      } else if (e.currentTarget === priceInputRef.current) {
        handleAddItem();
      }
    }
  };

  const incrementQuantity = () => {
    setQuantity(prev => (prev || 0) + 1);
  };

  const decrementQuantity = () => {
    setQuantity(prev => Math.max(1, (prev || 1) - 1));
  };

  if (inlineLayout) {
    return (
      <div className="flex flex-col sm:flex-row gap-2 w-full">
        <div className="flex-1">
          <Input
            ref={inputRef}
            type="text"
            placeholder="Nome do produto..."
            value={productName}
            onChange={handleProductNameChange}
            onKeyDown={handleKeyDown}
            className="h-11"
          />
        </div>
        
        <QuantityInput
          quantity={quantity}
          onQuantityChange={handleQuantityChange}
          onIncrement={incrementQuantity}
          onDecrement={decrementQuantity}
          onKeyDown={handleKeyDown}
          inputRef={quantityInputRef}
        />
        
        <div className="w-32">
          <Input
            ref={priceInputRef}
            type="number"
            step="0.01"
            placeholder="Preço"
            value={price === null ? '' : price.toString()}
            onChange={handlePriceChange}
            onKeyDown={handleKeyDown}
            className="h-11"
          />
        </div>
        
        <Button 
          onClick={handleAddItem}
          disabled={!productName.trim() || !quantity || quantity <= 0 || !price || price <= 0}
          className="h-11 px-6 bg-blue-600 hover:bg-blue-700"
        >
          Adicionar
        </Button>
      </div>
    );
  }

  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="p-4">
        <div className="space-y-4">
          <div className="flex items-center gap-2 text-gray-700">
            <Package className="h-4 w-4" />
            <h4 className="text-sm font-medium">Adicionar Item</h4>
          </div>
          
          <div className="space-y-3">
            <div>
              <Input
                ref={inputRef}
                type="text"
                placeholder="Nome do produto..."
                value={productName}
                onChange={handleProductNameChange}
                onKeyDown={handleKeyDown}
                className="w-full"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="flex-1">
                <QuantityInput
                  quantity={quantity}
                  onQuantityChange={handleQuantityChange}
                  onIncrement={incrementQuantity}
                  onDecrement={decrementQuantity}
                  onKeyDown={handleKeyDown}
                  inputRef={quantityInputRef}
                />
              </div>
              
              <div className="flex-1">
                <Input
                  ref={priceInputRef}
                  type="number"
                  step="0.01"
                  placeholder="Preço unitário"
                  value={price === null ? '' : price.toString()}
                  onChange={handlePriceChange}
                  onKeyDown={handleKeyDown}
                  className="h-11"
                />
              </div>
            </div>
            
            <Button 
              onClick={handleAddItem}
              disabled={!productName.trim() || !quantity || quantity <= 0 || !price || price <= 0}
              className="w-full bg-blue-600 hover:bg-blue-700"
            >
              <Package className="h-4 w-4 mr-2" />
              Adicionar ao Pedido
            </Button>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
