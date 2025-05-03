
import { OrderItem } from '@/types';
import { mockProducts } from './products';

// Helper function to generate order items
export const generateOrderItems = (orderId: string): OrderItem[] => {
  const numItems = Math.floor(Math.random() * 4) + 1;
  const items: OrderItem[] = [];
  
  for (let i = 0; i < numItems; i++) {
    const product = mockProducts[Math.floor(Math.random() * mockProducts.length)];
    const quantity = Math.floor(Math.random() * 10) + 1;
    const price = product.price;
    const discount = Math.random() > 0.7 ? product.price * 0.1 : 0;
    const total = quantity * (price - discount);
    
    items.push({
      id: `item-${orderId}-${i}`,
      productId: product.id,
      productName: product.name,
      productCode: product.code,
      quantity: quantity,
      price: price,
      unitPrice: price,
      discount: discount,
      total: total
    });
  }
  
  return items;
};
