
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { Product } from '@/types';

interface ProductSearchResultsPortalProps {
  products: Product[];
  inputRef: React.RefObject<HTMLInputElement>;
  onSelectProduct: (product: Product) => void;
  isVisible: boolean;
}

export default function ProductSearchResultsPortal({
  products,
  inputRef,
  onSelectProduct,
  isVisible
}: ProductSearchResultsPortalProps) {
  const [position, setPosition] = useState({ top: 0, left: 0, width: 0 });
  
  useEffect(() => {
    if (isVisible && inputRef.current) {
      const updatePosition = () => {
        const inputRect = inputRef.current!.getBoundingClientRect();
        const viewportHeight = window.innerHeight;
        const listHeight = Math.min(products.length * 60 + 16, 256); // Estimated height
        
        let top = inputRect.bottom + window.scrollY + 4;
        
        // If there's not enough space below, position above
        if (inputRect.bottom + listHeight > viewportHeight) {
          top = inputRect.top + window.scrollY - listHeight - 4;
        }
        
        setPosition({
          top,
          left: inputRect.left + window.scrollX,
          width: inputRect.width
        });
      };
      
      updatePosition();
      
      // Update position on scroll or resize
      const handleUpdate = () => updatePosition();
      window.addEventListener('scroll', handleUpdate, true);
      window.addEventListener('resize', handleUpdate);
      
      return () => {
        window.removeEventListener('scroll', handleUpdate, true);
        window.removeEventListener('resize', handleUpdate);
      };
    }
  }, [isVisible, products.length, inputRef]);
  
  if (!isVisible || products.length === 0) return null;
  
  return createPortal(
    <div 
      className="fixed bg-white border border-gray-200 rounded-lg shadow-2xl max-h-64 overflow-y-auto"
      style={{ 
        zIndex: 999999,
        top: `${position.top}px`,
        left: `${position.left}px`,
        width: `${position.width}px`,
        minWidth: '300px'
      }}
    >
      {products.map(product => (
        <div
          key={product.id}
          className="p-3 hover:bg-gray-50 cursor-pointer border-b border-gray-100 last:border-b-0"
          onClick={() => onSelectProduct(product)}
        >
          <div className="flex justify-between items-start">
            <div className="flex-1">
              <div className="font-medium text-gray-900">{product.name}</div>
              <div className="text-sm text-gray-500">Cód: {product.code}</div>
            </div>
            <div className="text-right">
              <div className="font-bold text-green-600">
                {product.price?.toLocaleString('pt-BR', {
                  style: 'currency',
                  currency: 'BRL'
                })}
              </div>
              <div className="text-xs text-gray-500">{product.unit}</div>
            </div>
          </div>
        </div>
      ))}
    </div>,
    document.body
  );
}
