
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface QuantityInputProps {
  quantity: number | null;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  onKeyDown?: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  inputRef: React.RefObject<HTMLInputElement>;
}

export default function QuantityInput({
  quantity,
  onQuantityChange,
  onIncrement,
  onDecrement,
  onKeyDown,
  inputRef
}: QuantityInputProps) {
  return (
    <div className="flex items-center">
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className="h-11 w-11 rounded-r-none border-r-0 hover:bg-gray-50 transition-colors"
        onClick={onDecrement}
      >
        <Minus size={16} />
      </Button>
      
      <Input
        ref={inputRef}
        type="text"
        className="w-16 h-11 text-center border-x-0 rounded-none focus-visible:ring-0 focus-visible:ring-offset-0"
        value={quantity === null ? '' : quantity.toString()}
        onChange={onQuantityChange}
        onKeyDown={onKeyDown}
        placeholder="Qtd"
      />
      
      <Button 
        type="button" 
        variant="outline" 
        size="icon" 
        className="h-11 w-11 rounded-l-none border-l-0 hover:bg-gray-50 transition-colors"
        onClick={onIncrement}
      >
        <Plus size={16} />
      </Button>
    </div>
  );
}
