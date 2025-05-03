
import { Order } from '@/types';
import { mockCustomers } from './customers';
import { mockSalesReps } from './salesReps';
import { generateOrderItems } from './orderItems';
import { randomRecentDate, randomFutureDate, currentDate } from '../utils/mock-utils';

// Generate mock orders
export const mockOrders: Order[] = mockCustomers.flatMap((customer) => {
  // Generate 1-3 orders per customer
  const numOrders = Math.floor(Math.random() * 3) + 1;
  const orders: Order[] = [];
  
  for (let i = 0; i < numOrders; i++) {
    const salesRep = mockSalesReps[0];
    const orderId = `ord-${customer.id}-${i}`;
    const items = generateOrderItems(orderId);
    const total = items.reduce((sum, item) => sum + item.total, 0);
    const statuses = ['draft', 'confirmed', 'completed', 'canceled'] as const;
    const paymentStatuses = ['pending', 'partial', 'paid'] as const;
    const orderDate = randomRecentDate();
    const dueDate = randomFutureDate();
    
    orders.push({
      id: orderId,
      code: parseInt(orderId.split('-').pop() || '0') + 1000,
      customerId: customer.id,
      customerName: customer.name,
      salesRepId: salesRep.id,
      salesRepName: salesRep.name,
      date: orderDate,
      dueDate: dueDate,
      items: items,
      total: total,
      discount: 0,
      status: statuses[Math.floor(Math.random() * statuses.length)],
      paymentStatus: paymentStatuses[Math.floor(Math.random() * paymentStatuses.length)],
      paymentMethodId: "",
      paymentMethod: "",
      paymentTableId: "",
      payments: [],
      notes: Math.random() > 0.7 ? 'Observações especiais para este pedido' : "",
      createdAt: orderDate,
      updatedAt: orderDate,
      deliveryZip: customer.zip,
      deliveryAddress: customer.address,
      deliveryCity: customer.city,
      deliveryState: customer.state
    });
  }
  
  return orders;
});
