import React from 'react';
import { Product } from '@/types';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search, X, Check, Barcode } from "lucide-react";
import { Label } from "@/components/ui/label";
interface ProductCodeInputProps {
  products: Product[];
  foundProduct: Product | null;
  onProductFound: (product: Product | null) => void;
  onProductSelect: (product: Product) => void;
  onSearchDialogOpen: () => void;
  inputRef?: React.RefObject<HTMLInputElement>;
  onEnterPress?: () => void;
  isEditMode?: boolean;
}
export default function ProductCodeInput({
  products,
  foundProduct,
  onProductFound,
  onProductSelect,
  onSearchDialogOpen,
  inputRef,
  onEnterPress,
  isEditMode = false
}: ProductCodeInputProps) {
  const [codeInput, setCodeInput] = React.useState('');

  // Check if input is a valid product code
  React.useEffect(() => {
    if (codeInput.trim() === '') {
      onProductFound(null);
      return;
    }

    // Only search if input is numeric
    if (!/^\d+$/.test(codeInput.trim())) {
      onProductFound(null);
      return;
    }
    const code = parseInt(codeInput.trim(), 10);
    const product = products.find(p => p.code === code);
    onProductFound(product || null);
  }, [codeInput, products, onProductFound]);
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    // Only allow numbers
    if (value === '' || /^\d+$/.test(value)) {
      setCodeInput(value);
    }
  };
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (foundProduct) {
        onProductSelect(foundProduct);
        setCodeInput('');
      } else if (onEnterPress) {
        onEnterPress();
      }
    }
  };
  const handleClear = () => {
    setCodeInput('');
    onProductFound(null);
    inputRef?.current?.focus();
  };
  const displayValue = foundProduct ? foundProduct.code.toString() : codeInput;
  return <div className="space-y-2">
      
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Input type="text" id="product-code" placeholder="Digite o código do produto" value={displayValue} onChange={handleInputChange} onKeyDown={handleKeyDown} ref={inputRef} className="w-full pr-10 h-10" disabled={isEditMode} />
          {foundProduct ? <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2">
              <Check className="text-green-500 h-4 w-4" />
              <Button type="button" variant="ghost" size="icon" onClick={handleClear} className="h-6 w-6">
                <X size={12} />
              </Button>
            </div> : <Barcode className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />}
        </div>
        <Button type="button" variant="outline" size="icon" onClick={onSearchDialogOpen} className="h-10 w-10" disabled={isEditMode}>
          <Search size={18} />
        </Button>
      </div>
      
      {foundProduct && <div className="text-sm text-green-600 flex items-center gap-2">
          <Check size={16} />
          <span>{foundProduct.name} - Pressione Enter para selecionar</span>
        </div>}
    </div>;
}