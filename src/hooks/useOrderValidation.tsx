
import { useMemo } from 'react';
import { OrderItem, Product } from '@/types';
import { validateProductDiscount } from '@/context/operations/productOperations';

interface UseOrderValidationProps {
  orderItems: OrderItem[];
  products: Product[];
}

export function useOrderValidation({ orderItems, products }: UseOrderValidationProps) {
  const validationResults = useMemo(() => {
    const invalidItems: Array<{
      item: OrderItem;
      error: string;
    }> = [];

    orderItems.forEach(item => {
      if (item.productId) {
        const validation = validateProductDiscount(item.productId, item.unitPrice || 0, products);
        if (validation !== true) {
          invalidItems.push({
            item,
            error: validation as string
          });
        }
      }
    });

    return {
      isValid: invalidItems.length === 0,
      invalidItems,
      totalInvalidItems: invalidItems.length
    };
  }, [orderItems, products]);

  return validationResults;
}
