
import React from 'react';
import { Product } from '@/types';
import { AlertTriangle, CheckCircle } from 'lucide-react';

interface PriceValidationProps {
  product: Product;
  currentPrice: number;
  className?: string;
}

const PriceValidation: React.FC<PriceValidationProps> = ({
  product,
  currentPrice,
  className = ''
}) => {
  const costPrice = product.cost_price || 0;
  const suggestedPrice = product.price || costPrice * 1.3; // 30% markup default
  
  const isValid = currentPrice >= costPrice;
  const isOptimal = currentPrice >= suggestedPrice * 0.9; // Within 10% of suggested

  if (!isValid) {
    return (
      <div className={`flex items-center text-red-600 ${className}`}>
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span>Preço abaixo do custo (R$ {costPrice.toFixed(2)})</span>
      </div>
    );
  }

  if (!isOptimal) {
    return (
      <div className={`flex items-center text-yellow-600 ${className}`}>
        <AlertTriangle className="h-4 w-4 mr-2" />
        <span>Preço baixo. Sugerido: R$ {suggestedPrice.toFixed(2)}</span>
      </div>
    );
  }

  return (
    <div className={`flex items-center text-green-600 ${className}`}>
      <CheckCircle className="h-4 w-4 mr-2" />
      <span>Preço adequado</span>
    </div>
  );
};

export default PriceValidation;
