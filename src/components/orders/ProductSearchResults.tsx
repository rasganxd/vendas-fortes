
import React from 'react';
import { Product } from '@/types';

interface ProductSearchResultsProps {
  products: Product[];
  resultsRef: React.RefObject<HTMLDivElement>;
  onSelectProduct: (product: Product) => void;
}

export default function ProductSearchResults({
  products,
  resultsRef,
  onSelectProduct
}: ProductSearchResultsProps) {
  if (products.length === 0) return null;
  
  return (
    <div 
      ref={resultsRef}
      className="absolute z-50 mt-1 w-full max-h-60 overflow-auto bg-white border rounded-md shadow-lg"
    >
      {products.map(product => (
        <div
          key={product.id}
          className="px-4 py-3 hover:bg-gray-100 cursor-pointer flex justify-between border-b border-gray-100 last:border-0"
          onClick={() => onSelectProduct(product)}
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
  );
}
