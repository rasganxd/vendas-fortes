
import React from 'react';
import { Product } from '@/types';
import { Package } from 'lucide-react';

interface ProductItemProps {
  product: Product;
  onSelect: (product: Product) => void;
}

export default function ProductItem({ product, onSelect }: ProductItemProps) {
  return (
    <div
      className="flex items-center justify-between p-3 hover:bg-gray-100 cursor-pointer border-b border-gray-200 last:border-b-0"
      onClick={() => onSelect(product)}
    >
      <div className="flex items-center space-x-3">
        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
          <Package className="w-4 h-4 text-blue-600" />
        </div>
        <div>
          <div className="font-medium text-gray-900">{product.name}</div>
          <div className="text-sm text-gray-500">Cód: {product.code}</div>
        </div>
      </div>
      <div className="text-right">
        <div className="font-semibold text-gray-900">
          {product.price.toLocaleString('pt-BR', {
            style: 'currency',
            currency: 'BRL'
          })}
        </div>
        <div className="text-sm text-gray-500">{product.unit || 'UN'}</div>
      </div>
    </div>
  );
}
