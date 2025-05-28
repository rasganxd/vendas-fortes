
import React, { useEffect, useState } from 'react';
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
  
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  // Calculate the position of the dropdown relative to the input field
  useEffect(() => {
    if (resultsRef.current && resultsRef.current.parentElement) {
      const parentRect = resultsRef.current.parentElement.getBoundingClientRect();
      
      setPosition({
        top: parentRect.bottom + window.scrollY,
        left: parentRect.left + window.scrollX,
        width: parentRect.width
      });
    }
  }, [products]);
  
  return (
    <div 
      ref={resultsRef}
      className="fixed z-[999999] overflow-auto bg-white border border-gray-300 rounded-lg shadow-2xl"
      style={{
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        maxHeight: '40vh',
        maxWidth: '100%'
      }}
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
