
import React from 'react';
import { AlertTriangle, CheckCircle, XCircle } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';

interface DiscountValidationProps {
  product: Product;
  appliedDiscountPercent: number;
  className?: string;
}

export const DiscountValidation: React.FC<DiscountValidationProps> = ({
  product,
  appliedDiscountPercent,
  className
}) => {
  const { maxDiscountPercent } = product;
  
  // Se não há desconto máximo definido, qualquer desconto é válido
  if (!maxDiscountPercent || maxDiscountPercent === 0) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-green-600">Sem limite de desconto</span>
      </div>
    );
  }
  
  // Verificar se o desconto está acima do máximo
  const isAboveMax = appliedDiscountPercent > maxDiscountPercent;
  
  if (isAboveMax) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <XCircle className="h-4 w-4 text-red-500 mr-1" />
        <span className="text-red-600">
          Acima do máximo ({maxDiscountPercent}%)
        </span>
      </div>
    );
  }
  
  // Verificar se está próximo do limite máximo (warning)
  const isNearMax = appliedDiscountPercent >= maxDiscountPercent * 0.9;
  
  if (isNearMax) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
        <span className="text-yellow-600">
          Próximo do máximo ({maxDiscountPercent}%)
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center text-sm", className)}>
      <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
      <span className="text-green-600">Desconto válido</span>
    </div>
  );
};

export default DiscountValidation;
