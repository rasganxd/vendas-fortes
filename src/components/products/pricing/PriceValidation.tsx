
import React, { useEffect, useState } from 'react';
import { AlertTriangle, CheckCircle, XCircle, Percent } from 'lucide-react';
import { Product } from '@/types';
import { cn } from '@/lib/utils';
import { getCurrentDiscountPercentage, getMaximumDiscountPercentage } from '@/context/operations/productOperations';

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
  const [maxDiscountPercentage, setMaxDiscountPercentage] = useState<number>(0);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  
  // Load discount settings when component mounts or product changes
  useEffect(() => {
    const loadDiscountSettings = async () => {
      setIsLoading(true);
      try {
        const maxDiscount = await getMaximumDiscountPercentage(product.id, [product]);
        setMaxDiscountPercentage(maxDiscount);
      } catch (error) {
        console.error("Error loading discount settings:", error);
        setMaxDiscountPercentage(0);
      } finally {
        setIsLoading(false);
      }
    };

    loadDiscountSettings();
  }, [product.id, product]);

  const currentDiscountPercentage = getCurrentDiscountPercentage(product.id, currentPrice, [product]);
  
  // Show loading state
  if (isLoading) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <div className="h-4 w-4 animate-spin rounded-full border-2 border-gray-300 border-t-gray-600 mr-1"></div>
        <span className="text-gray-500">Carregando limites de desconto...</span>
      </div>
    );
  }
  
  // Se não há limite de desconto definido, está válido
  if (maxDiscountPercentage === 0) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <CheckCircle className="h-4 w-4 text-green-500 mr-1" />
        <span className="text-green-600">Sem limite de desconto definido</span>
      </div>
    );
  }
  
  // Verificar se o desconto está acima do máximo permitido
  const isAboveMaxDiscount = currentDiscountPercentage > maxDiscountPercentage;
  
  if (isAboveMaxDiscount) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <XCircle className="h-4 w-4 text-red-500 mr-1" />
        <span className="text-red-600">
          Desconto acima do limite ({currentDiscountPercentage.toFixed(1)}% {'>'}  {maxDiscountPercentage.toFixed(1)}%)
        </span>
      </div>
    );
  }
  
  // Verificar se está próximo do limite máximo (warning quando > 80% do limite)
  const isNearMaxDiscount = currentDiscountPercentage > (maxDiscountPercentage * 0.8);
  
  if (isNearMaxDiscount) {
    return (
      <div className={cn("flex items-center text-sm", className)}>
        <AlertTriangle className="h-4 w-4 text-yellow-500 mr-1" />
        <span className="text-yellow-600">
          Próximo do limite máximo ({currentDiscountPercentage.toFixed(1)}% de {maxDiscountPercentage.toFixed(1)}%)
        </span>
      </div>
    );
  }
  
  return (
    <div className={cn("flex items-center text-sm", className)}>
      <Percent className="h-4 w-4 text-green-500 mr-1" />
      <span className="text-green-600">
        Desconto: {currentDiscountPercentage.toFixed(1)}% (máx: {maxDiscountPercentage.toFixed(1)}%)
      </span>
    </div>
  );
};

export default PriceValidation;
