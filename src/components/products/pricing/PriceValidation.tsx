
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
  const { maxDiscountPercent } = product;
  
  // Calculate minimum price based on max discount
  const minimumPrice = maxDiscountPercent ? currentPrice * (1 - maxDiscountPercent / 100) : 0;
  
  // Se não há desconto máximo definido, está válido
  if (!maxDiscountPercent) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-green-600">Sem limite de desconto</span>
      </div>
    );
  }
  
  // Verificar se o preço está muito abaixo do custo
  const isBelowCost = currentPrice < product.cost;
  
  if (isBelowCost) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <XCircle className="h-4 w-4 text-red-500 mr-1" />
        <span className="text-red-600">
          Abaixo do custo (R$ {product.cost.toFixed(2)})
        </span>
      </div>
    );
  }
  
  // Verificar se está próximo do custo (warning)
  const isNearCost = currentPrice <= product.cost * 1.1;
  
  if (isNearCost) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
        <span className="text-yellow-600">
          Próximo do custo (Min: R$ {minimumPrice.toFixed(2)})
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center text-sm", className)}>
      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
      <span className="text-green-600">
        Válido (Min: R$ {minimumPrice.toFixed(2)})
      </span>
    </div>
  );
};

export default PriceValidation;
