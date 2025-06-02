
import React from 'react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Minus } from 'lucide-react';

interface QuantityInputProps {
  quantity: number;
  onQuantityChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onIncrement: () => void;
  onDecrement: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const QuantityInput: React.FC<QuantityInputProps> = ({
  quantity,
  onQuantityChange,
  onIncrement,
  onDecrement,
  inputRef,
  onKeyDown
}) => {
  return (
    <div className="flex items-center">
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onDecrement}
        className="h-10 w-8 p-0 rounded-r-none"
      >
        <Minus size={14} />
      </Button>
      <Input
        ref={inputRef}
        type="number"
        value={quantity}
        onChange={onQuantityChange}
        onKeyDown={onKeyDown}
        className="h-10 text-center rounded-none border-l-0 border-r-0"
        min="1"
      />
      <Button
        type="button"
        variant="outline"
        size="sm"
        onClick={onIncrement}
        className="h-10 w-8 p-0 rounded-l-none"
      >
        <Plus size={14} />
      </Button>
    </div>
  );
};

export default QuantityInput;
