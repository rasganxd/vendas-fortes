
import React from 'react';
import { Card, CardContent } from "@/components/ui/card";
import ProductSearchInput from './ProductSearchInput';

interface ProductAdditionProps {
  handleAddItem: (productName: string, quantity: number, price: number) => void;
  productInputRef: React.RefObject<HTMLInputElement>;
  isEditMode: boolean;
}

export default function ProductAddition({
  handleAddItem,
  productInputRef,
  isEditMode
}: ProductAdditionProps) {
  return (
    <Card className="shadow-sm border-gray-200">
      <CardContent className="py-3">
        <div className="mb-2">
          <h4 className="text-sm font-medium text-gray-800">
            {isEditMode ? 'Adicionar Itens' : 'Adicionar Itens ao Pedido'}
          </h4>
        </div>
        <ProductSearchInput 
          addItemToOrder={handleAddItem} 
          inlineLayout={true} 
          inputRef={productInputRef} 
        />
      </CardContent>
    </Card>
  );
}
