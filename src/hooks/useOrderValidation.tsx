
import { useMemo, useEffect, useState } from 'react';
import { OrderItem, Product } from '@/types';
import { validateProductDiscount } from '@/context/operations/productOperations';

interface UseOrderValidationProps {
  orderItems: OrderItem[];
  products: Product[];
}

export function useOrderValidation({ orderItems, products }: UseOrderValidationProps) {
  const [validationResults, setValidationResults] = useState({
    isValid: true,
    invalidItems: [] as Array<{
      item: OrderItem;
      error: string;
    }>,
    totalInvalidItems: 0
  });

  useEffect(() => {
    const validateItems = async () => {
      const invalidItems: Array<{
        item: OrderItem;
        error: string;
      }> = [];

      for (const item of orderItems) {
        if (item.productId) {
          try {
            const validation = await validateProductDiscount(item.productId, item.unitPrice || 0, products);
            if (validation !== true) {
              invalidItems.push({
                item,
                error: validation as string
              });
            }
          } catch (error) {
            console.error("Error validating order item:", error);
          }
        }
      }

      setValidationResults({
        isValid: invalidItems.length === 0,
        invalidItems,
        totalInvalidItems: invalidItems.length
      });
    };

    validateItems();
  }, [orderItems, products]);

  return validationResults;
}
