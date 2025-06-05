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
  return;
}