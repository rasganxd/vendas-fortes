
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
  const { minPrice } = product;
  
  // Se não há preço mínimo definido, está válido
  if (!minPrice) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-green-600">Sem limite</span>
      </div>
    );
  }
  
  // Verificar se o preço está acima do mínimo
  const isBelowMin = currentPrice < minPrice;
  
  if (isBelowMin) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <XCircle className="h-4 w-4 text-red-500 mr-1" />
        <span className="text-red-600">
          Abaixo do mínimo (R$ {minPrice.toFixed(2)})
        </span>
      </div>
    );
  }
  
  // Verificar se está próximo do limite mínimo (warning)
  const isNearMin = currentPrice <= minPrice * 1.1;
  
  if (isNearMin) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
        <span className="text-yellow-600">
          Próximo do mínimo (R$ {minPrice.toFixed(2)})
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center text-sm", className)}>
      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
      <span className="text-green-600">Válido</span>
    </div>
  );
};

export default PriceValidation;
