
import { LoadItem, OrderItem } from '@/types';
import { mockOrders } from './orders';

// Mock Load Items
export const mockLoadItems: LoadItem[] = mockOrders
  .filter(order => order.status === 'confirmed')
  .flatMap(order => {
    return order.items.map(item => ({
      id: `load-item-${order.id}-${item.productId}`,
      loadId: `load-${order.id}`,
      productId: item.productId || '',
      productName: item.productName,
      quantity: item.quantity,
      price: item.price,
      total: item.price * item.quantity,
      orderId: order.id,
      orderItemId: item.id,
      productCode: item.productCode,
      customerId: order.customerId,
      status: 'pending' as const
    }));
  });
