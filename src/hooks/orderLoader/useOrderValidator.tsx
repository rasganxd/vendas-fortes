
import { Order } from '@/types';
import { v4 as uuidv4 } from 'uuid';

export const useOrderValidator = () => {
  const validateAndFixOrderItems = (order: Order) => {
    if (!order?.items || !Array.isArray(order.items)) {
      console.warn("⚠️ No valid items found in order");
      return [];
    }

    console.log("📦 Processing order items:", order.items.length);
    
    return order.items.map((item, index) => {
      if (!item) {
        console.warn(`⚠️ Null item found at index ${index}`);
        return {
          id: uuidv4(),
          productId: `unknown-${index}`,
          productName: "Item desconhecido",
          productCode: 0,
          quantity: 1,
          unitPrice: 0,
          price: 0,
          discount: 0,
          total: 0,
          unit: 'UN' // Default unit for unknown items
        };
      }
      
      console.log(`🔧 Validating item: ${item.productName}, unit: ${item.unit}`);
      
      return {
        id: item.id || uuidv4(),
        productId: item.productId || `unknown-${index}`,
        productName: item.productName || "Item sem nome",
        productCode: item.productCode || 0,
        quantity: Math.max(item.quantity || 1, 1),
        unitPrice: Math.max(item.unitPrice || item.price || 0, 0),
        price: Math.max(item.price || item.unitPrice || 0, 0),
        discount: Math.max(item.discount || 0, 0),
        total: Math.max((item.unitPrice || item.price || 0) * (item.quantity || 1), 0),
        unit: item.unit || 'UN' // Preserve original unit or use fallback
      };
    });
  };

  return { validateAndFixOrderItems };
};
