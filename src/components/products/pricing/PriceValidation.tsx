
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface PriceValidationProps {
  product: Product;
  currentPrice: number;
  className?: string;
}

export const PriceValidation: React.FC<PriceValidationProps> = ({
  product,
  currentPrice,
  className
}) => {
  const { minPrice, maxPrice } = product;
  
  // Se não há limites definidos, está válido
  if (!minPrice && !maxPrice) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-green-600">Sem limites</span>
      </div>
    );
  }
  
  // Verificar se o preço está dentro dos limites
  const isBelowMin = minPrice && currentPrice < minPrice;
  const isAboveMax = maxPrice && currentPrice > maxPrice;
  const isOutOfRange = isBelowMin || isAboveMax;
  
  if (isOutOfRange) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <XCircle className="h-4 w-4 text-red-500 mr-1" />
        <span className="text-red-600">
          Fora da faixa
          {isBelowMin && ` (min: R$ ${minPrice?.toFixed(2)})`}
          {isAboveMax && ` (max: R$ ${maxPrice?.toFixed(2)})`}
        </span>
      </div>
    );
  }
  
  // Verificar se está próximo dos limites (warning)
  const isNearMin = minPrice && currentPrice <= minPrice * 1.1;
  const isNearMax = maxPrice && currentPrice >= maxPrice * 0.9;
  
  if (isNearMin || isNearMax) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
        <span className="text-yellow-600">
          Próximo do limite
          {isNearMin && ` (min: R$ ${minPrice?.toFixed(2)})`}
          {isNearMax && ` (max: R$ ${maxPrice?.toFixed(2)})`}
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center text-sm", className)}>
      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
      <span className="text-green-600">Dentro da faixa</span>
    </div>
  );
};

export default PriceValidation;
